-- ═══════════════════════════════════════════════════════════════════════
-- FINDGOD AI Training 2.0 — schema
-- ═══════════════════════════════════════════════════════════════════════
-- Adds the tables that power the new tabbed AI Training workspace in the
-- admin dashboard. Four config sources feed a runtime prompt compiler:
--
--   personality_config   — structured form: tone, do's, don'ts, style
--   example_responses    — Q&A few-shot library, tag-filterable
--   guardrails           — topic-triggered rules (politics, crisis, etc.)
--   knowledge_documents  — uploaded PDFs / notes / URLs (RAG source)
--   knowledge_chunks     — embedded chunks with pgvector similarity search
--
-- All tables are SERVICE-ROLE ONLY. No RLS policies for anon/authenticated —
-- the public chat client and admin dashboard read via service-role clients.
--
-- The existing `prompt_versions` table is NOT modified. It continues to
-- serve as the raw-prompt fallback and the version-history backbone for
-- the compiled output of this new system.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
-- pgvector
-- ───────────────────────────────────────────────────────────────────────
-- OpenAI text-embedding-3-small emits 1536-dim vectors. Storing as
-- `vector(1536)` lets us swap embedding models later (3-large is 3072,
-- voyage-3 is 1024) via a follow-up migration if we need.

create extension if not exists vector;


-- ───────────────────────────────────────────────────────────────────────
-- personality_config
-- ───────────────────────────────────────────────────────────────────────
-- The structured "how the AI sounds" form. Exactly ONE row is is_active
-- at a time (enforced by partial unique index). Older rows are kept for
-- history/rollback just like prompt_versions.
--
-- Fields are split so the admin form can render them as dedicated inputs
-- (as opposed to one free-text blob). The compiler joins them into a
-- markdown section of the final system prompt.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.personality_config (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  tone              text not null default '',
  voice_notes       text not null default '',
  dos               text[] not null default '{}',
  donts             text[] not null default '{}',
  style_examples    text not null default '',
  is_active         boolean not null default false,
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

create unique index if not exists personality_config_one_active_idx
  on public.personality_config ((is_active)) where is_active = true;
create index if not exists personality_config_created_at_idx
  on public.personality_config (created_at desc);

alter table public.personality_config enable row level security;

comment on table public.personality_config is
  'Structured voice/tone config. Exactly one row may be is_active=true. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- example_responses
-- ───────────────────────────────────────────────────────────────────────
-- Q&A pairs used as few-shot examples. At runtime the compiler picks the
-- top-N most relevant (by tag match first, embedding similarity later)
-- and injects them as "Here's how you'd answer this kind of thing."
--
-- question_embedding is populated on insert/update by the admin app so we
-- can do semantic matching without recomputing on every chat request.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.example_responses (
  id                  uuid primary key default gen_random_uuid(),
  question            text not null,
  answer              text not null,
  tags                text[] not null default '{}',
  enabled             boolean not null default true,
  question_embedding  vector(1536),
  created_by          uuid references auth.users (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists example_responses_enabled_idx
  on public.example_responses (enabled) where enabled = true;
create index if not exists example_responses_tags_idx
  on public.example_responses using gin (tags);
-- IVFFlat index for semantic similarity. lists=50 is fine up to ~5k rows;
-- bump later if the library grows. Cosine distance because OpenAI
-- embeddings are L2-normalized.
create index if not exists example_responses_embedding_idx
  on public.example_responses using ivfflat (question_embedding vector_cosine_ops)
  with (lists = 50);

alter table public.example_responses enable row level security;

comment on table public.example_responses is
  'Few-shot Q&A pairs injected into the system prompt at runtime. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- guardrails
-- ───────────────────────────────────────────────────────────────────────
-- Topic-triggered directives. When a user message matches trigger_keywords
-- (case-insensitive substring match for V1; LLM classifier later), the
-- directive_text is appended to the system prompt for that turn only.
--
-- priority orders multiple matching rules (higher first). always_active=true
-- means the directive runs every turn regardless of triggers (used for
-- global safety rails — e.g., "if suicide comes up, safety resources first").
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.guardrails (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  trigger_keywords  text[] not null default '{}',
  directive_text    text not null,
  priority          int not null default 0,
  always_active     boolean not null default false,
  enabled           boolean not null default true,
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists guardrails_enabled_idx
  on public.guardrails (enabled, priority desc) where enabled = true;
create index if not exists guardrails_keywords_idx
  on public.guardrails using gin (trigger_keywords);

alter table public.guardrails enable row level security;

comment on table public.guardrails is
  'Topic-triggered directives appended to the system prompt at runtime. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- knowledge_documents
-- ───────────────────────────────────────────────────────────────────────
-- Uploaded source material: PDFs (parsed to text), pasted notes, URLs
-- (fetched and extracted). Each document is chunked and embedded for
-- retrieval at chat time.
--
-- status values:
--   pending     — uploaded, not yet processed
--   processing  — chunking / embedding in flight
--   ready       — chunks exist, available for retrieval
--   failed      — parse or embed error (see error_message)
--
-- raw_text is the extracted plain text (kept so we can re-chunk without
-- re-uploading the original). source_blob is optional — reserved for
-- later when we move originals to Vercel Blob.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.knowledge_documents (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  source_type     text not null check (source_type in ('pdf', 'text', 'url')),
  source_url      text,
  source_blob     text,
  raw_text        text not null default '',
  status          text not null default 'pending'
                    check (status in ('pending', 'processing', 'ready', 'failed')),
  error_message   text,
  chunk_count     int not null default 0,
  enabled         boolean not null default true,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists knowledge_documents_status_idx
  on public.knowledge_documents (status);
create index if not exists knowledge_documents_created_at_idx
  on public.knowledge_documents (created_at desc);

alter table public.knowledge_documents enable row level security;

comment on table public.knowledge_documents is
  'Uploaded source docs (PDF/text/URL). Parent row for knowledge_chunks. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- knowledge_chunks
-- ───────────────────────────────────────────────────────────────────────
-- The actual retrieval unit. Each row is ~500-1000 tokens of text with
-- its OpenAI embedding. Vector similarity search at chat time returns
-- top-K chunks, which the compiler injects as context.
--
-- metadata can carry page numbers, section headings, source URLs, etc.
-- chunk_index preserves order within the parent document.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.knowledge_chunks (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.knowledge_documents (id) on delete cascade,
  chunk_index   int not null,
  content       text not null,
  embedding     vector(1536),
  metadata      jsonb not null default '{}'::jsonb,
  token_count   int,
  created_at    timestamptz not null default now()
);

create index if not exists knowledge_chunks_document_id_idx
  on public.knowledge_chunks (document_id, chunk_index);
-- IVFFlat tuning: ~sqrt(rows) is the rule of thumb. 200 handles up to
-- ~40k chunks comfortably; revisit when we actually get there.
create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 200);

alter table public.knowledge_chunks enable row level security;

comment on table public.knowledge_chunks is
  'Embedded chunks for RAG retrieval. Cascade-deleted with parent document. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- match_knowledge_chunks RPC
-- ───────────────────────────────────────────────────────────────────────
-- Helper function for vector similarity search. Called from the chat
-- route with the user's message embedding; returns top-K most-similar
-- chunks across all enabled documents.
--
-- Called via supabase.rpc('match_knowledge_chunks', { ... }).
-- ───────────────────────────────────────────────────────────────────────

create or replace function public.match_knowledge_chunks(
  query_embedding  vector(1536),
  match_count      int default 5,
  min_similarity   float default 0.0
)
returns table (
  id              uuid,
  document_id     uuid,
  document_title  text,
  content         text,
  similarity      float,
  metadata        jsonb
)
language sql stable as $$
  select
    c.id,
    c.document_id,
    d.title as document_title,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity,
    c.metadata
  from public.knowledge_chunks c
  join public.knowledge_documents d on d.id = c.document_id
  where d.enabled = true
    and d.status = 'ready'
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count
$$;

comment on function public.match_knowledge_chunks is
  'Vector similarity search over enabled, ready knowledge_chunks. Service-role only.';


-- ───────────────────────────────────────────────────────────────────────
-- match_example_responses RPC
-- ───────────────────────────────────────────────────────────────────────
-- Same idea, for few-shot example selection by semantic similarity.
-- The compiler prefers tag-matched examples first, then fills the rest
-- with the top semantic matches.
-- ───────────────────────────────────────────────────────────────────────

create or replace function public.match_example_responses(
  query_embedding  vector(1536),
  match_count      int default 3,
  min_similarity   float default 0.0
)
returns table (
  id          uuid,
  question    text,
  answer      text,
  tags        text[],
  similarity  float
)
language sql stable as $$
  select
    e.id,
    e.question,
    e.answer,
    e.tags,
    1 - (e.question_embedding <=> query_embedding) as similarity
  from public.example_responses e
  where e.enabled = true
    and e.question_embedding is not null
    and 1 - (e.question_embedding <=> query_embedding) >= min_similarity
  order by e.question_embedding <=> query_embedding
  limit match_count
$$;

comment on function public.match_example_responses is
  'Vector similarity search over enabled example_responses. Service-role only.';

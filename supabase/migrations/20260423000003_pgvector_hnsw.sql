-- ═══════════════════════════════════════════════════════════════════════
-- FINDGOD AI Training 2.0 — swap IVFFlat → HNSW on pgvector indexes
-- ═══════════════════════════════════════════════════════════════════════
-- The original ai_training_v2 migration created IVFFlat indexes on
-- example_responses.question_embedding and knowledge_chunks.embedding.
-- Swapping both to HNSW before M2 (Examples) and M4 (Knowledge) ship.
--
-- Why HNSW over IVFFlat for our shape of data:
--
--   • Better recall at low row counts. IVFFlat partitions rows into
--     `lists` clusters and searches a subset — recall degrades on small
--     datasets where clusters are sparse. HNSW builds a navigable graph
--     and delivers near-exhaustive recall from the very first row.
--
--   • No rebuild on growth. IVFFlat's lists parameter needs retuning
--     (~sqrt(rows)) as the table grows; exceeding the sweet spot costs
--     either speed or recall. HNSW defaults handle row counts from 10
--     to ~1M without parameter changes.
--
--   • Slightly higher build cost, negligible query cost. We rebuild
--     from zero here; query latency at our scale is indistinguishable.
--
-- Tuning:
--   • m = 16             — default graph connectivity. Good to ~1M rows.
--   • ef_construction=64 — default build-time quality. Higher = better
--                          recall but slower to build; 64 is ample for
--                          our target size (< 40k chunks, < 5k examples).
--
-- Query-time recall is tunable via `SET hnsw.ef_search = N` per session;
-- Supabase default is 40, which is fine for top-K ≤ 10.
--
-- Safe to run on production — existing indexes are dropped and rebuilt
-- inside a single migration. Both tables are currently empty (M2/M4 not
-- shipped), so rebuild is a no-op today.
-- ═══════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────
-- example_responses.question_embedding
-- ───────────────────────────────────────────────────────────────────────

drop index if exists public.example_responses_embedding_idx;

create index if not exists example_responses_embedding_idx
  on public.example_responses
  using hnsw (question_embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

comment on index public.example_responses_embedding_idx is
  'HNSW over OpenAI (cosine) embeddings. See migration 20260423000003 for rationale.';


-- ───────────────────────────────────────────────────────────────────────
-- knowledge_chunks.embedding
-- ───────────────────────────────────────────────────────────────────────

drop index if exists public.knowledge_chunks_embedding_idx;

create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

comment on index public.knowledge_chunks_embedding_idx is
  'HNSW over OpenAI (cosine) embeddings. See migration 20260423000003 for rationale.';

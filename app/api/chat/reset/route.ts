import { NextResponse } from "next/server";
import { COOKIE_NAME, META_COOKIE_NAME } from "@/lib/chat-limit";

/**
 * Dev-only reset for the free-chat wall. Hitting this URL clears the
 * signed (HttpOnly) cookie, its JS-readable mirror, and the
 * `findgod_free_chat_used` localStorage flag, then sends the visitor
 * home. Returns 404 in production — never exposed.
 *
 * Usage: visit http://localhost:3000/api/chat/reset in the browser.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const expire = "Path=/; Max-Age=0; SameSite=Lax";
  const html = `<!doctype html>
<meta charset="utf-8">
<title>FINDGOD — chat reset</title>
<style>
  body { background:#050507; color:#F0EDE6; font-family:-apple-system,system-ui,sans-serif;
         display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
  p { opacity:.8; letter-spacing:.02em; }
</style>
<p>Resetting free-chat wall…</p>
<script>
  try { localStorage.removeItem('findgod_free_chat_used'); } catch (e) {}
  window.location.replace('/');
</script>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  res.headers.append("Set-Cookie", `${COOKIE_NAME}=; ${expire}; HttpOnly`);
  res.headers.append("Set-Cookie", `${META_COOKIE_NAME}=; ${expire}`);
  return res;
}

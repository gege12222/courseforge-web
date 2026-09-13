/**
 * POST /api/waitlist — the only server-side code on this site.
 *
 * Stores an email address and a UTC timestamp in KV. Nothing else: no IP, no
 * user agent, no referrer. Requires an explicit consent value and drops
 * anything that filled in the honeypot field.
 *
 * Binding: KV namespace `WAITLIST` (see DEPLOY.md).
 */
interface Env {
  WAITLIST: KVNamespace;
}

const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/;
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const type = request.headers.get('content-type') ?? '';
  const data = type.includes('application/json')
    ? await request.json<Record<string, string>>()
    : Object.fromEntries(await request.formData());

  const email = String(data.email ?? '').trim().toLowerCase();
  if (String(data.company ?? '')) return json(200, { ok: true }); // honeypot: pretend success
  if (data.consent !== 'yes') return json(400, { ok: false, error: 'consent' });
  if (!EMAIL.test(email) || email.length > 254) return json(400, { ok: false, error: 'email' });

  await env.WAITLIST.put(`email:${email}`, new Date().toISOString());
  return json(201, { ok: true });
};

// ModelLab AI text buddy.
// Klaviyo flow (trigger: someone texts us) -> POST /reply here -> Claude writes a reply in the
// rulebook voice -> we create a "Buddy Reply" event in Klaviyo -> a Klaviyo flow texts it back.
import { RULEBOOK, contextBlock } from "./prompt.js";

const KEYWORDS = /^(stop|stopall|unsubscribe|cancel|end|quit|help|info|start|unstop|yes)$/i;
const GSM = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\\[~\]|€]*$/;

function smsCredits(text) {
  if (GSM.test(text)) return text.length <= 160 ? 1 : Math.ceil(text.length / 153);
  return text.length <= 70 ? 1 : Math.ceil(text.length / 67);
}
const month = () => new Date().toISOString().slice(0, 7);
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });

async function getNum(kv, k) { return Number((await kv.get(k)) || 0); }

async function klaviyoEvent(env, metric, phone, email, properties) {
  const profile = phone ? { phone_number: phone } : { email };
  const r = await fetch("https://a.klaviyo.com/api/events/", {
    method: "POST",
    headers: { Authorization: "Klaviyo-API-Key " + env.KLAVIYO_BUDDY_KEY, revision: "2024-10-15", "content-type": "application/vnd.api+json", accept: "application/vnd.api+json" },
    body: JSON.stringify({ data: { type: "event", attributes: {
      properties, unique_id: crypto.randomUUID(),
      metric: { data: { type: "metric", attributes: { name: metric } } },
      profile: { data: { type: "profile", attributes: profile } } } } }),
  });
  if (!r.ok) throw new Error(`klaviyo ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

async function askClaude(env, profile, history, text, canRetry = true) {
  const messages = [...history, { role: "user", content: text }];
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: env.MODEL || "claude-haiku-5-5", max_tokens: 300, thinking: { type: "disabled" },
      system: [{ type: "text", text: RULEBOOK, cache_control: { type: "ephemeral" } }, { type: "text", text: contextBlock(profile) }],
      messages,
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  let out = (d.content || []).filter(c => c.type === "text").map(c => c.text || "").join("").trim();
  if (!out) console.log("empty reply", JSON.stringify({ stop: d.stop_reason, types: (d.content || []).map(c => c.type), usage: d.usage }));
  if (out && canRetry && clean(out).length > 150) out = (await shorten(env, out)) || out;
  askClaude.last = { stop: d.stop_reason, types: (d.content || []).map(c => c.type), usage: d.usage };
  return out;
}

const BANNED = /(👍|🙂|😂|🙏|✅|👌)\uFE0F?/gu;
const EMOJI = /\p{Extended_Pictographic}\uFE0F?/gu;
async function shorten(env, text) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 200, thinking: { type: "disabled" },
      system: "you shorten text messages. rewrite the text you're given to UNDER 140 characters total, sounding like a friend texting. keep it lowercase, casual, no period at the end, no emoji. keep any link exactly as written, it counts toward the limit; drop extra points instead. output only the rewritten text.",
      messages: [{ role: "user", content: text }] }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return (d.content || []).filter(c => c.type === "text").map(c => c.text).join("").trim();
}
function clean(reply) {
  let t = reply.replace(/^["'\s]+|["'\s]+$/g, "");
  t = t.replace(/\(?not (financial|investment) advice\)?[,.:;]?\s*(but\s+)?/gi, "");
  t = t.replace(BANNED, "");
  t = t.replace(/^[^:\n]{0,40}(shorter|rewritten|version)[^:\n]{0,20}:\s*/i, "");   // shortener preamble
  if (/^[A-Z][a-z]/.test(t)) t = t[0].toLowerCase() + t.slice(1);            // rulebook: lowercase
  const emojis = t.match(EMOJI) || [];
  // An emoji makes the whole text cost UCS-2 rates (70 chars/credit), so only keep one in very short replies.
  if (emojis.length > 1 || (emojis.length && t.length > 68)) t = t.replace(EMOJI, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  t = t.replace(/\.$/, "");             // rulebook: no ending period
  if (t.length > 160) {
    const link = (t.match(/modellab\.hidanielkang\.com\/\S*/) || [""])[0];
    let body = t.replace(link, "").trim();
    const room = 158 - (link ? link.length + 1 : 0);
    if (body.length > room) {
      const cut = body.slice(0, room);
      const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "), cut.lastIndexOf("? "));
      body = (end > room * 0.5 ? cut.slice(0, end + (cut[end] === "?" ? 1 : 0)) : cut.replace(/\s+\S*$/, "")).replace(/[.,]$/, "");
    }
    t = link ? body + " " + link : body;
  }
  return t;
}

async function handle(env, body) {
  const kv = env.BUDDY_KV, m = month();
  const phone = String(body.phone || "").trim();
  // Klaviyo's inbound-SMS event field name varies, so the webhook sends several candidates.
  const text = String(body.text || ["t1","t2","t3","t4","t5","t6"].map(k => body[k]).find(v => v && String(v).trim()) || "").trim();
  if (env.BUDDY_KV && !(await env.BUDDY_KV.get("seen_payload"))) await env.BUDDY_KV.put("seen_payload", JSON.stringify(body).slice(0, 2000));
  if (!phone || !text || KEYWORDS.test(text)) return { skipped: "no phone/text or a compliance keyword" };

  const used = await getNum(kv, `credits:${m}`);
  const cap = Number(env.MONTHLY_CREDIT_CAP || 80);
  const mine = await getNum(kv, `p:${m}:${phone}`);
  const perCap = Number(env.PER_PERSON_MONTHLY || 6);

  if (used >= cap || mine >= perCap) {
    // One "maxed out" note per person per month, then silence. Their text still sits in the Klaviyo inbox.
    const noted = await kv.get(`max:${m}:${phone}`);
    if (!noted && used < cap + 10) {
      const note = "i'm maxed out on replies this month 😅 daniel reads every text and will get back to you personally";
      await klaviyoEvent(env, "Buddy Reply", phone, null, { reply: note, kind: "maxed" });
      await kv.put(`max:${m}:${phone}`, "1", { expirationTtl: 40 * 86400 });
      await kv.put(`credits:${m}`, String(used + smsCredits(note)), { expirationTtl: 40 * 86400 });
    }
    return { skipped: "cap reached", used, cap, mine };
  }

  const hKey = `h:${phone}`;
  const history = JSON.parse((await kv.get(hKey)) || "[]");
  let reply = clean(await askClaude(env, body, history, text));
  let human = false;
  if (reply.startsWith("[HUMAN]")) { human = true; reply = reply.replace("[HUMAN]", "").trim(); }
  if (!reply) return { skipped: "empty reply" };

  await klaviyoEvent(env, "Buddy Reply", phone, null, { reply, kind: human ? "human_flag" : "ai", their_text: text.slice(0, 500) });
  if (human && env.ALERT_EMAIL) await klaviyoEvent(env, "Buddy Needs Human", null, env.ALERT_EMAIL, { phone, their_text: text.slice(0, 500), buddy_reply: reply });

  const credits = smsCredits(reply);
  const newUsed = used + credits;
  await kv.put(`credits:${m}`, String(newUsed), { expirationTtl: 40 * 86400 });
  await kv.put(`p:${m}:${phone}`, String(mine + 1), { expirationTtl: 40 * 86400 });
  await kv.put(hKey, JSON.stringify([...history, { role: "user", content: text }, { role: "assistant", content: reply }].slice(-12)), { expirationTtl: 60 * 86400 });

  if (newUsed >= cap * 0.8 && !(await kv.get(`alert80:${m}`)) && env.ALERT_EMAIL) {
    await klaviyoEvent(env, "Buddy Budget Alert", null, env.ALERT_EMAIL, { used: newUsed, cap, month: m });
    await kv.put(`alert80:${m}`, "1", { expirationTtl: 40 * 86400 });
  }
  return { ok: true, credits, used: newUsed, cap };
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.headers.get("x-buddy-secret") !== env.BUDDY_SECRET) return json({ error: "unauthorized" }, 401);
    if (url.pathname === "/status") {
      const m = month();
      return json({ last_payload_keys: Object.keys(JSON.parse((await env.BUDDY_KV.get("seen_payload")) || "{}")), month: m, credits_used: await getNum(env.BUDDY_KV, `credits:${m}`), cap: Number(env.MONTHLY_CREDIT_CAP || 80), model: env.MODEL });
    }
    if (url.pathname === "/reply" && req.method === "POST") {
      let body = {};
      try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
      if (url.searchParams.get("dry") === "1") {   // test the brain without texting anyone or using credits
        const history = JSON.parse((await env.BUDDY_KV.get(`dry:${body.phone || "x"}`)) || "[]");
        const reply = clean(await askClaude(env, body, history, String(body.text || "")));
        await env.BUDDY_KV.put(`dry:${body.phone || "x"}`, JSON.stringify([...history, { role: "user", content: String(body.text || "") }, { role: "assistant", content: reply }].slice(-12)), { expirationTtl: 3600 });
        return json({ reply, credits: smsCredits(reply), debug: askClaude.last });
      }
      ctx.waitUntil(handle(env, body).then(r => console.log(JSON.stringify(r))).catch(e => console.log("buddy error", e.message)));
      return json({ accepted: true });   // answer Klaviyo fast; the reply is sent in the background
    }
    return json({ error: "not found" }, 404);
  },
};
export { smsCredits, clean };

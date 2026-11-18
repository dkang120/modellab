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
      model: env.MODEL || "claude-sonnet-5-5", max_tokens: 300, thinking: thinkingOff(env.MODEL || "claude-sonnet-5-5"),
      system: [{ type: "text", text: RULEBOOK, cache_control: { type: "ephemeral" } }, { type: "text", text: contextBlock(profile) }],
      messages,
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  let out = (d.content || []).filter(c => c.type === "text").map(c => c.text || "").join("").trim();
  if (!out) console.log("empty reply", JSON.stringify({ stop: d.stop_reason, types: (d.content || []).map(c => c.type), usage: d.usage }));
  // Shorten anything over the rulebook's 140 chars (twice if needed) so clean() never has to chop mid-sentence.
  const flagged = /^\s*\[HUMAN\]/.test(out);
  if (flagged) out = out.replace("[HUMAN]", "").trim();
  for (let i = 0; out && canRetry && i < 2 && clean(out).length > SHORTEN_AT; i++) out = (await shorten(env, out)) || out;
  if (out && clean(out).length > SHORTEN_AT) out = trimSentences(out);
  if (flagged) out = "[HUMAN]" + out;
  const prior = [...history].reverse().find(m => m.role === "user")?.content || "";
  const already = history.some(m => m.role === "assistant" && /MY-RESET|988/.test(m.content || ""));
  out = crisisNet(text, approvalGuard(linkGuard(text, out)), prior, already);
  askClaude.last = { stop: d.stop_reason, types: (d.content || []).map(c => c.type), usage: d.usage };
  return out;
}

// Sonnet 5.5 rejects thinking "disabled" (400); its lowest setting is "between_tools". Haiku still takes "disabled".
export const thinkingOff = model => (/sonnet-5-5|opus|fable/.test(model) ? { type: "between_tools" } : { type: "disabled" });
export const SHORTEN_AT = 140;
export const SHORTEN_PROMPT = "you are a text-message shortener, not a chat partner. the user turn contains one text message inside <text> tags. rewrite THAT message to UNDER 130 characters, same meaning and same voice: lowercase, casual, no period at the end, no emoji. keep any phone number or link exactly as written. drop extra points to fit. never reply to the message, never comment on it, never mention shortening or instructions. output only the rewritten message.\n\nexample input: <text>ugh that's such a stressful feeling, watching it drop every day. the thing is, a lot of people find it helps to look at it less often, like once a week instead of every hour</text>\nexample output: ugh watching it drop daily is stressful. a lot of people check once a week instead of every hour";
// Fallback when shortening fails: keep whole sentences that fit, so nothing ends mid-thought.
export function trimSentences(text, max = SHORTEN_AT) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  const parts = t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [t];
  let out = "";
  for (const p of parts) { if ((out + p).trim().length > max) break; out += p; }
  out = out.trim();
  return out.length >= 40 ? out : t;   // first sentence alone too long: leave it for clean()
}
// Reject shortener output that talks about the task instead of doing it.
const META = /(shorten|rewrit|system prompt|instructions?|the (message|text) you (sent|gave)|character limit|here'?s (a|the) (shorter|version)|<\/?text>)/i;
export function shortenOk(original, out) {
  const t = String(out || "").trim();
  return !!t && !META.test(t) && t.length < String(original).length;
}
// Drop clauses that approve or rate their specific plan ("solid move", "good call"), or name a product to put money in.
const APPROVAL = /\b(solid (move|call|plan|pick|choice)|good (call|move|plan|pick|choice|idea)|smart (move|call|plan|choice)|fair call|right call|the move here|that's the move|i'?d (protect|keep|put|go with|do)|high[- ]yield savings|hysa)\b/i;
export function approvalGuard(out) {
  const r = String(out || "");
  if (!APPROVAL.test(r)) return r;
  const parts = r.split(/(?<=[.!?])\s+|,\s+(?=(?:but|and|so|though)\b)/);
  const kept = parts.filter(p => !APPROVAL.test(p)).join(" ").replace(/\s{2,}/g, " ").trim();
  return kept.length >= 12 ? kept : r;   // if the whole text is the approval, leave it (judge/test will flag it)
}
// Links only when they asked for something a page answers.
const ASKED_FOR_PAGE = /(link|site|website|page|show me|see (it|that|how|what)|where (can|do|is)|quiz|sim\b|simulator|tool|how bad|chart|history|look (at|it up)|send (me|it)|read more|learn more)/i;
export function linkGuard(theirText, out) {
  const r = String(out || "");
  if (!/modellab\.hidanielkang\.com/.test(r) || ASKED_FOR_PAGE.test(String(theirText || ""))) return r;
  if (!/modellab\.hidanielkang\.com\/(?!tools\/match\/)/.test(r)) {   // the style quiz link is allowed as homework, never bare
    return /quiz/i.test(r) ? r : r.replace(/(https?:\/\/)?modellab\.hidanielkang\.com\/tools\/match\/?/i, "2 min style quiz: modellab.hidanielkang.com/tools/match/");
  }
  // Drop the short clause that introduces the link ("basics at <link>", "check this out: <link>"), not just the URL.
  const cut = r.replace(/(^|[.!?]\s+|,\s+)[^.!?,]{0,45}?(https?:\/\/)?modellab\.hidanielkang\.com\/\S*/gi, (m, lead) => (/[.!?]/.test(lead) ? lead.trim() : ""))
    .replace(/\s*(https?:\/\/)?modellab\.hidanielkang\.com\/\S*/gi, "")
    .replace(/[\s:,-]+$/, "").replace(/\s{2,}/g, " ").trim();
  return cut.length >= 15 ? cut : r;   // nothing meaningful left: keep the original rather than send an empty text
}
const BANNED = /(👍|🙂|😂|🙏|✅|👌)\uFE0F?/gu;
const EMOJI = /\p{Extended_Pictographic}\uFE0F?/gu;
// Safety net if the model misses a crisis: code-level check on the person's text.
const HOPELESS = /(what'?s (even )?the point( anymore| of (even )?(anything|living|trying|it all|getting up|any of (this|it)))|(don'?t|can'?t) (even )?see the point (of (trying|anything|living|any of (this|it))|anymore)|done with everything|(life|everything|it all) (feels|is) (pointless|hopeless)|tired of (feeling like this|everything|living)|can'?t (do this|go on|take (it|this)) anymore|don'?t want to (live|be here|exist|wake up)|no reason to (live|keep going)|kill (my ?self)|suicid|\bend (it all|my life)\b|better off (dead|without me)|hurt (my ?self)|give up on everything)/i;
const LOSS = /(lost|losing|blew|blown|down (like )?\$?\d|in the hole|wiped out|make (it |that |this )?back|win (it |that )?back|get back to even|chas(e|ing) (it|the loss))/i;
const GAMBLE_WORDS = /(bet|bets|betting|parlay|sportsbook|casino|options|calls\b|puts\b|0dte|gambl|slots|draftkings|fanduel)/i;
const NEED = /(rent|bills|can'?t (pay|cover|afford)|owe|all my|everything i had|back to even|win it back|make (it )?back|evict)/i;
// Safety net if the model misses a crisis. theirText = this text; prior = their previous text; already = already flagged in this chat.
export function crisisNet(theirText, out, prior = "", already = false) {
  const t = String(theirText || ""), both = `${prior || ""} ${t}`;
  const hopeless = HOPELESS.test(t);
  const gamble = !already && GAMBLE_WORDS.test(both) && LOSS.test(both) && NEED.test(both);
  if (!hopeless && !gamble) return out;
  let r = String(out || "").replace("[HUMAN]", "").trim();
  if (hopeless && !/988/.test(r)) r = "i'm really glad you told me. you can call or text 988 anytime, and daniel will check in on you";
  else if (gamble && !/988|MY-RESET/i.test(r)) r = (r ? r.replace(/[.!?\s]*$/, "") + ". " : "") + "1-800-MY-RESET is free and 24/7 for gambling stuff, and daniel will check in";
  return "[HUMAN]" + r;
}

async function shorten(env, text) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 200, thinking: { type: "disabled" },   // shortening stays on the cheap model
      system: SHORTEN_PROMPT,
      messages: [{ role: "user", content: `<text>${text}</text>` }] }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  const out = (d.content || []).filter(c => c.type === "text").map(c => c.text).join("").trim();
  return shortenOk(text, out) ? out : null;
}
function clean(reply) {
  let t = reply.replace(/^["'\s]+|["'\s]+$/g, "");
  t = t.replace(/\(?not (financial|investment) advice\)?[,.:;]?\s*(but\s+)?/gi, "");
  t = t.replace(BANNED, "");
  t = t.replace(/^[^:\n]{0,40}(shorter|rewritten|version)[^:\n]{0,20}:\s*/i, "");   // shortener preamble
  t = t.replace(/(^|[.!?]\s+)([A-Z])(?=[a-z])/g, (m, a, b) => a + b.toLowerCase());  // rulebook: lowercase (keeps I, tickers)
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

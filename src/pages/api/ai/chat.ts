import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';

function normalizeModelName(name: string | undefined): string | undefined {
	if (!name) return name;
	return name.startsWith('models/') ? name.slice('models/'.length) : name;
}
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';
import { classifyFallbackIntent } from '@/services/assistant/fallback';
import { DOTS_ASSISTANT_SYSTEM_PROMPT } from '@/services/assistant/system-prompt';

export const prerender = false;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export const POST: APIRoute = async ({ request }) => {
	try {
		publish('generation.requested', { kind: 'chat' });
		publish('assistant.interaction', { mode: 'batch' });
		incr(METRIC.ASSISTANT_RUN);
		const { messages, model } = await request.json();

		// DOTS-wide assistant system prompt
		const systemPrompt = DOTS_ASSISTANT_SYSTEM_PROMPT;

		// Ensure system prompt is always included as the first message
		const incoming: ChatMessage[] = (messages as ChatMessage[]) ?? [];
		const effectiveMessages: ChatMessage[] = [
			{ role: 'system', content: systemPrompt },
			...incoming,
		];
		const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);

		// Fallback dynamic reply when GEMINI_API_KEY is not configured
		if (!apiKey) {
			const { reply, intent } = classifyFallbackIntent(effectiveMessages);
			return new Response(JSON.stringify({ reply, fallback: true, intent }), { status: 200, headers: { 'content-type': 'application/json' } });
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const { candidates, override, cached } = selectModels('chat', { forceModel: model });
		const attempts: { model: string; ok: boolean; error?: string }[] = [];
		let lastErr: any;
		for (const candidate of candidates) {
			try {
				// Build prompt parts with system + conversation each attempt (cheap)
				const parts: any[] = [];
				parts.push({ text: systemPrompt });
				for (const msg of effectiveMessages) {
					if (msg.role === 'user' || msg.role === 'assistant') {
						parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}` });
					}
				}
				parts.push({ text: 'Assistant:' });
				const m = genAI.getGenerativeModel({ model: normalizeModelName(candidate)! });
				const result = await m.generateContent({ contents: [{ role: 'user', parts }] });
				const reply = result.response.text();
				attempts.push({ model: candidate, ok: true });
				recordModelSuccess('chat', candidate);
				return new Response(JSON.stringify({ reply, model: candidate, attempts, override: !!override, cached }), { status: 200, headers: { 'content-type': 'application/json' } });
			} catch (err: any) {
				const msg = err?.message || String(err);
				attempts.push({ model: candidate, ok: false, error: msg.slice(0, 240) });
				lastErr = err;
				if (/unauth|denied|permission/i.test(msg)) break; // stop early if permission issue
				continue;
			}
		}
		// All attempts failed -> fallback classification (contextual intent aware reply)
		const { reply, intent } = classifyFallbackIntent(effectiveMessages);
		return new Response(JSON.stringify({ reply, intent, fallback: true, attempts, error: lastErr?.message || 'model-failed', override: !!override, cached }), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (e: any) {
		const msg = e?.message || 'error';
		const fallback = classifyFallbackIntent([{ role: 'user', content: 'help' }]).reply; // minimal safe fallback
		return new Response(JSON.stringify({ error: msg, status: 500, fallback: true, reply: fallback }), { status: 200, headers: { 'content-type': 'application/json' } });
	}
};

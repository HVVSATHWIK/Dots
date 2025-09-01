import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages, model } = await request.json();

		// DOTS-wide assistant system prompt
		const systemPrompt = `
You are the DOTS Assistant.
- Be friendly, concise, and helpful.
- Support both artisans and buyers using the DOTS platform.
- Help with artisan products, creative ideas, and platform guidance.
- Suggest tags, titles, descriptions, pricing ranges, and materials when asked.
- If asked about something outside DOTS, answer politely but briefly.
- Keep responses supportive, approachable, and easy to act on.
`;

		// Ensure system prompt is always included as the first message
		const incoming: ChatMessage[] = (messages as ChatMessage[]) ?? [];
		const effectiveMessages: ChatMessage[] = [
			{ role: 'system', content: systemPrompt },
			...incoming,
		];
		const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);

		// Fallback stub when GEMINI_API_KEY is not configured
		if (!apiKey) {
			const lastUser = [...effectiveMessages].reverse().find(m => m.role === 'user');
			return new Response(JSON.stringify({ reply: `Stubbed reply: ${lastUser?.content ?? 'Hello'}` }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const modelName =
			(model as string)
			|| (import.meta.env.GEMINI_MODEL as string | undefined)
			|| (process.env.GEMINI_MODEL as string | undefined)
			|| 'gemini-1.5-flash';
		const m = genAI.getGenerativeModel({ model: modelName });

		// Build prompt parts with our system prompt and the conversation
		const parts: any[] = [];
		parts.push({ text: systemPrompt });
		for (const msg of effectiveMessages) {
			if (msg.role === 'user' || msg.role === 'assistant') {
				parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}` });
			}
		}
		parts.push({ text: 'Assistant:' });

		const result = await m.generateContent({ contents: [{ role: 'user', parts }] });
		const reply = result.response.text();
		return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e?.message ?? 'error' }), { status: 500 });
	}
};

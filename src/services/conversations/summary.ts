/** Session narrative compression scaffold. */
export interface ConversationTurn { role: 'user' | 'assistant'; content: string; }
export interface ConversationSummary { tokens: number; summary: string; }
export function summarizeConversation(_turns: ConversationTurn[]): ConversationSummary { return { tokens: 0, summary: 'stub' }; }

/** Collaborative design thread scaffold. */
export interface DesignThread { id: string; title: string; creatorId: string; createdAt: number; status: 'open' | 'closed'; }
export interface DesignProposal { id: string; threadId: string; artisanId: string; text: string; createdAt: number; }

export async function createThread(_title: string, _creatorId: string): Promise<DesignThread> { return { id: 'thread-temp', title: _title, creatorId: _creatorId, createdAt: Date.now(), status: 'open' }; }
export async function addProposal(_threadId: string, _artisan: string, _text: string): Promise<DesignProposal> { return { id: 'proposal-temp', threadId: _threadId, artisanId: _artisan, text: _text, createdAt: Date.now() }; }

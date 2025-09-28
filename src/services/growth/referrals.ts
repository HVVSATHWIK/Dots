/** Growth / referral scaffold. */
export interface Referral { code: string; creatorId: string; createdAt: number; uses: number; }
export function generateReferralCode(_creatorId: string): Referral { return { code: 'REF-' + Math.random().toString(36).slice(2,8), creatorId: _creatorId, createdAt: Date.now(), uses: 0 }; }

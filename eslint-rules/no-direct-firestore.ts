import type { Rule } from 'eslint';

/**
 * Disallow direct firebase/firestore imports outside the designated data layers.
 * Allowed files (patterns):
 *  - integrations/members/firebase.ts (initialization)
 *  - src/lib/firestore-repo.ts (repository abstraction)
 *  - src/lib/embeddings.ts (vector storage transitional)
 *  - tests (to allow mocks if needed)
 */

// Use constructor for RegExp to avoid double escaping confusion in TS + Windows paths.
const ALLOW_PATTERNS: RegExp[] = [
  new RegExp('integrations/members/firebase\\.ts$'),
  new RegExp('src/lib/firestore-repo\\.ts$'),
  new RegExp('src/lib/embeddings\\.ts$'),
  new RegExp('__mocks__'),
  new RegExp('tests?/.*\\.ts$'),
];

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow direct Firestore access; use repository layer', recommended: false },
    schema: [],
    messages: {
      noDirectFirestore: 'Direct firebase/firestore import detected. Use repository abstractions in src/lib/firestore-repo.ts',
    },
  },
  create(ctx: Rule.RuleContext): Rule.RuleListener {
    const file = ctx.getFilename();
    if (ALLOW_PATTERNS.some((r: RegExp) => r.test(file.replace(/\\/g, '/')))) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        // @ts-ignore
        if (node.source.value === 'firebase/firestore') {
          ctx.report({ node, messageId: 'noDirectFirestore' });
        }
      },
    };
  },
} as Rule.RuleModule;

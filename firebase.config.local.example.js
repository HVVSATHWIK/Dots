// Local dev optional fallback (only if you cannot or do not want to use .env)
// 1. Copy to firebase.config.local.js (DO NOT COMMIT THAT FILE)
// 2. Fill real values
// 3. Import in index.html before the bundled scripts or inject via a custom script tag.
// <script src="/firebase.config.local.js"></script>
// This sets a global used by integrations/members/firebase.ts when env vars are missing.

window.__FIREBASE_CONFIG__ = {
  apiKey: 'AIza...YOUR_KEY...'
  // authDomain: 'dots-57778.firebaseapp.com',
  // projectId: 'dots-57778',
  // storageBucket: 'dots-57778.appspot.com',
  // messagingSenderId: '313625221417',
  // appId: '1:313625221417:web:ffbb801990fe67a352bf38',
  // measurementId: 'G-L67LB38V9Z'
};

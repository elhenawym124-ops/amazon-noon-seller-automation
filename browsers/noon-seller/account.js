// Resolves the Noon seller account email without hardcoding it in the repo.
//
// Order:
//   1. NOON_EMAIL environment variable
//   2. local.config.json in this folder (git-ignored)
//
// Create local.config.json with:  { "email": "you@example.com" }
'use strict';

let email = process.env.NOON_EMAIL || '';
if (!email) {
  try { email = require('./local.config.json').email || ''; } catch (e) { /* not created yet */ }
}
if (!email) {
  throw new Error(
    'Noon seller email not configured. Set the NOON_EMAIL environment variable ' +
    'or create browsers/noon-seller/local.config.json with {"email":"you@example.com"}'
  );
}

module.exports = { email };

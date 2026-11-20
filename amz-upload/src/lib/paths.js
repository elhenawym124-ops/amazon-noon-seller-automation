// Single source of truth for paths inside amz-upload.
// Every script here resolves relative paths against the module root
// (H:\amzain\amz-upload), not against the current working directory.
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');

const dirs = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  config: path.join(ROOT, 'config'),
  data: path.join(ROOT, 'data'),
  templates: path.join(ROOT, 'templates'),
  output: path.join(ROOT, 'output'),
  feeds: path.join(ROOT, 'output', 'feeds'),
  summaries: path.join(ROOT, 'output', 'summaries'),
  reports: path.join(ROOT, 'output', 'reports')
};

/**
 * Resolve a CLI argument against the module root.
 * Absolute paths are returned unchanged.
 */
function resolve(p) {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

/**
 * Read a JSON file and tolerate a UTF-8 BOM (Notepad/PowerShell add one).
 */
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

module.exports = { ROOT, dirs, resolve, readJson };

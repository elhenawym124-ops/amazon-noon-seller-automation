// Path map for hv-pipeline. Inputs in data/, configs in config/, outputs in output/.
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');

const dirs = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  config: path.join(ROOT, 'config'),
  data: path.join(ROOT, 'data'),
  samples: path.join(ROOT, 'data', 'samples'),
  imgCache: path.join(ROOT, 'data', 'img-cache'),
  output: path.join(ROOT, 'output'),
  feeds: path.join(ROOT, 'output', 'feeds'),
  reports: path.join(ROOT, 'output', 'reports')
};

function resolve(p) {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

module.exports = { ROOT, dirs, resolve, readJson };

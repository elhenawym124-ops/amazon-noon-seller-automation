// Path map for noon-upload. Feeds in output/feeds, configs in config,
// state and downloaded noon reports in data.
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');
const WORKSPACE = path.join(ROOT, '..');

const dirs = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  config: path.join(ROOT, 'config'),
  data: path.join(ROOT, 'data'),
  state: path.join(ROOT, 'data', 'state'),
  noonReports: path.join(ROOT, 'data', 'noon-reports'),
  output: path.join(ROOT, 'output'),
  feeds: path.join(ROOT, 'output', 'feeds'),
  amzUpload: path.join(WORKSPACE, 'amz-upload'),
  listings: path.join(WORKSPACE, 'amz-upload', 'data', 'levelup_listings.json'),
  noonTemplate: path.join(WORKSPACE, 'browsers', 'noon-seller', 'templates', 'Food_Containers__Download_English.xlsx'),
  xlsxModule: path.join(WORKSPACE, 'amz-upload', 'node_modules', 'xlsx')
};

function resolve(p) {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

module.exports = { ROOT, dirs, resolve, readJson };

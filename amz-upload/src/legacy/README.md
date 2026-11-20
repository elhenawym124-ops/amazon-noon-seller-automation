# legacy scripts (archived)

One-off builders from earlier upload sessions (`build-x*.js`, `build-pq*.js`,
`assemble-*.js`, `patch-pan*.js`, `split-org*.js`, ...).

They were written against the **old flat layout** where templates, configs and
feeds all lived in `H:\amzain\amz-upload`. They are kept for reference only;
paths inside them were updated to the new workspace root, but they do not know
about `templates/`, `config/` or `output/feeds/`.

Do not use them for new work. Use `src/build-feed.js` + a config from `config/`.

`assemble.js`, `assemble-pan.js`, `assemble-tray.js` and `wave1.js` read
`data/dp_<ASIN>.json`. Those 176 detail dumps were archived to
`H:\amzain\archive\amz-upload-data\dp\` — copy back what you need before running
any of them.

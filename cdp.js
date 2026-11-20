// Minimal CDP client for the HomeVista Chrome (port 9444), using Node's built-in WebSocket.
// Usage:
//   node cdp.js list
//   node cdp.js eval "<js expression>"            (runs in first page)
//   node cdp.js nav <url>
//   node cdp.js shot <out.png> [fullPage]
//   node cdp.js cookies
const fs = require('fs');

const PORT = process.env.CDP_PORT || 9444;
const BASE = `http://127.0.0.1:${PORT}`;

async function httpJson(path, method = 'GET') {
  const r = await fetch(BASE + path, { method });
  return r.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const events = [];
    ws.onopen = () => resolve({
      send(method, params = {}, sessionId) {
        const msgId = ++id;
        return new Promise((res, rej) => {
          pending.set(msgId, { res, rej });
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
      },
      events,
      close: () => ws.close(),
    });
    ws.onerror = (e) => reject(new Error('ws error: ' + (e.message || 'unknown')));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      } else if (msg.method) {
        events.push(msg);
      }
    };
  });
}

async function firstPageSession(c) {
  const { targetInfos } = await c.send('Target.getTargets');
  const page = targetInfos.find(t => t.type === 'page' && !t.url.startsWith('chrome://'));
  if (!page) throw new Error('no page target found');
  const { sessionId } = await c.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await c.send('Page.enable', {}, sessionId).catch(() => {});
  await c.send('Runtime.enable', {}, sessionId).catch(() => {});
  return { sessionId, page };
}

(async () => {
  const [cmd, ...args] = process.argv.slice(2);
  const ver = await httpJson('/json/version');
  const c = await connect(ver.webSocketDebuggerUrl);
  try {
    if (cmd === 'list') {
      const { targetInfos } = await c.send('Target.getTargets');
      console.log(JSON.stringify(targetInfos.filter(t => t.type === 'page').map(t => ({ title: t.title, url: t.url, id: t.targetId })), null, 1));
    } else if (cmd === 'eval') {
      const { sessionId } = await firstPageSession(c);
      const r = await c.send('Runtime.evaluate', { expression: args[0], returnByValue: true, awaitPromise: true }, sessionId);
      console.log(JSON.stringify(r.result && r.result.value !== undefined ? r.result.value : r, null, 1));
    } else if (cmd === 'nav') {
      const { sessionId } = await firstPageSession(c);
      await c.send('Page.navigate', { url: args[0] }, sessionId);
      await new Promise(r => setTimeout(r, 6000));
      const t = await c.send('Runtime.evaluate', { expression: '({url: location.href, title: document.title, txt: (document.body?document.body.innerText:"").slice(0,800)})', returnByValue: true }, sessionId);
      console.log(JSON.stringify(t.result.value, null, 1));
    } else if (cmd === 'shot') {
      const { sessionId } = await firstPageSession(c);
      const r = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: args[1] === 'full' }, sessionId);
      fs.writeFileSync(args[0], Buffer.from(r.data, 'base64'));
      console.log('saved ' + args[0]);
    } else if (cmd === 'cookies') {
      const r = await c.send('Network.getAllCookies');
      const names = [...new Set(r.cookies.map(x => x.name))].filter(n => /^(at-|sess-|ubid|session-id|lc-|x-)/.test(n));
      console.log(JSON.stringify(names, null, 1));
    } else {
      console.log('unknown command: ' + cmd);
    }
  } finally {
    c.close();
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

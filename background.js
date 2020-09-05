async function dedupTabs() {
  let tabs = await queryTabs({currentWindow: true})
  let urls = new Map()
  for (let t of tabs) {
    let u = normalizeUrl(t.url)
    let ts = urls.get(u)
    if (!ts) {
      ts = []
      urls.set(u, ts)
    }
    ts.push(t)
  }
  let dup = []
  for (let ts of urls.values()) {
    // keep highlight etc.
    // keep the shortest
    let x = ts
        .filter(a => !(a.highlighted || a.active || a.pinned))
        .sort((a, b) => a.url.length - b.url.length)
        .slice(1)
        .map(a => a.id)
    dup.push(...x)
  }
  if (dup.length > 0) {
    chrome.tabs.remove(dup)
  }
}

function normalizeUrl(url) {
  let a = new URL(url)
  return `${a.protocol}//${a.host}${a.pathname}${a.search}`
}

function currentWin() {
  return new Promise(resolve => {
    chrome.windows.getCurrent({}, win => { resolve(win.id) })
  })
}

function queryTabs(arg) {
  return new Promise(resolve => {
    chrome.tabs.query(arg, tabs => { resolve(tabs) })
  })
}

function init() {
  chrome.browserAction.onClicked.addListener(dedupTabs)
}

init()

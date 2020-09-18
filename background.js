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

  function keep(t) {
    return t.highlighted || t.active || t.pinned
  }

  let dup = []
  for (let ts of urls.values()) {
    // keep highlight etc.
    // keep the shortest
    let x = ts.sort((a, b) => {
      let i = keep(a) ? -1 : a.url.length
      let j = keep(b) ? -1 : b.url.length
      return i - j
    })
    for (let i = 1; i < x.length; i++) {
      if (keep(x[i])) {
        continue
      }
      dup.push(...x.slice(i).map(a => a.id))
      break
    }
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

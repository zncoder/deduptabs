async function dedupTabs() {
  let tabs = await queryTabs({currentWindow: true})
  let urls = new Set()
  for (let t of tabs) {
    if (t.highlighted || t.active || t.pinned) {
      urls.add(t.url)
    }
  }
  let dup = []
  for (let t of tabs) {
    if (t.highlighted || t.active || t.pinned) {
      continue
    }
    if (urls.has(t.url)) {
      dup.push(t.id)
      continue
    }
    urls.add(t.url)
  }
  if (dup) {
    chrome.tabs.remove(dup)
  }
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

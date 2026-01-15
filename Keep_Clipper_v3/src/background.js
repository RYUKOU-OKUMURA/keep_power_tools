const KEEP_URL = "https://keep.google.com/";

// コンテキストメニュー作成（選択テキスト/ページから保存）
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "save-to-keep",
    title: "Google Keep に保存",
    contexts: ["selection", "page"],
  });

  // 初回インストール時にオプションページでデータ取り扱いを案内
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage().catch(() => {});
  }
});

chrome.action.onClicked.addListener((tab) => handleClip(tab));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-keep") {
    // デバッグ: 各URLソースを確認
    console.log("contextMenus debug:", {
      "info.pageUrl": info.pageUrl,
      "info.frameUrl": info.frameUrl,
      "tab?.url": tab?.url,
      "tab": tab
    });
    // info.pageUrl, info.frameUrl, tab.url の順でフォールバック
    handleClipWithText(
      tab,
      info.selectionText || "",
      info.pageUrl || info.frameUrl || tab?.url || ""
    );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "save-selection") {
    if (sender.tab) {
      // contentSelection.jsから直接テキストとURLを受け取る
      handleClipWithText(
        sender.tab,
        message.text || "",
        message.url || sender.tab?.url || ""
      );
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false, reason: "no-tab" });
    }
    return true;
  }
});

async function handleClip(tab) {
  if (!tab?.id) return;
  if (tab.url?.startsWith(KEEP_URL)) return;

  try {
    const pageInfo = await getPageInfo(tab.id);
    const payloadText = pageInfo.text || pageInfo.title || "";
    const pageUrl = pageInfo.url || tab.url || "";
    const keepTabId = await ensureKeepTab();
    const payload = { text: payloadText, url: pageUrl };
    await injectToKeep(keepTabId, payload);
    chrome.tabs.update(keepTabId, { active: true });
    clearBadge();
  } catch (err) {
    console.error("Keep clip failed", err);
    showBadge("ERR", "#d93025");
    await showToast(tab?.id, "Keepへの保存に失敗しました。再試行してください。", "error");
  }
}

// 選択テキストを直接受け取るバージョン（PDF対応）
async function handleClipWithText(tab, selectionText, pageUrl) {
  if (!tab?.id) return;
  if (tab.url?.startsWith(KEEP_URL)) return;

  try {
    const payloadText = selectionText || tab.title || "";
    // URLが空の場合、chrome.tabs.queryで直接取得
    let url = pageUrl || tab.url || "";
    if (!url) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      url = activeTab?.url || "";
    }
    const keepTabId = await ensureKeepTab();
    const payload = { text: payloadText, url: url };
    await injectToKeep(keepTabId, payload);
    chrome.tabs.update(keepTabId, { active: true });
    clearBadge();
  } catch (err) {
    console.error("Keep clip failed", err);
    showBadge("ERR", "#d93025");
    await showToast(tab?.id, "Keepへの保存に失敗しました。再試行してください。", "error");
  }
}

async function getPageInfo(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const selection = window.getSelection()?.toString().trim() || "";
      return {
        text: selection,
        title: document.title,
        url: location.href,
      };
    },
  });
  return result?.result ?? { text: "", title: "", url: "" };
}

async function ensureKeepTab() {
  const existing = await chrome.tabs.query({ url: `${KEEP_URL}*` });
  const tab =
    existing.find((t) => t.id !== undefined) ??
    (await chrome.tabs.create({ url: KEEP_URL }));
  const tabId = tab.id;
  if (!tabId) throw new Error("Failed to obtain Keep tab id");
  await waitForTabComplete(tabId);
  return tabId;
}

async function waitForTabComplete(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.status === "complete") return;

  await new Promise((resolve) => {
    const listener = (updatedTabId, info) => {
      if (updatedTabId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function injectToKeep(tabId, data) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (payload) => {
      globalThis.__keepClipPayload = payload;
    },
    args: [data],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/keepInject.js"],
  });
}

function showBadge(text, color) {
  chrome.action.setBadgeText({ text });
  if (color) {
    chrome.action.setBadgeBackgroundColor({ color });
  }
  setTimeout(() => clearBadge(), 4000);
}

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
}

async function showToast(tabId, message, variant = "info") {
  if (!tabId || !message) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg, type) => {
        const TOAST_ID = "keep-clipper-toast";
        const existing = document.getElementById(TOAST_ID);
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id = TOAST_ID;
        toast.textContent = msg;
        const isError = type === "error";
        Object.assign(toast.style, {
          position: "fixed",
          top: "16px",
          right: "16px",
          padding: "12px 14px",
          background: isError ? "#d93025" : "#1a73e8",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: "2147483647",
          fontSize: "13px",
          maxWidth: "320px",
          lineHeight: "1.4",
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
      },
      args: [message, variant],
    });
  } catch (err) {
    console.warn("showToast failed", err);
  }
}

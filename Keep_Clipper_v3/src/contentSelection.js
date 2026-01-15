(() => {
  if (location.hostname.includes("keep.google.com")) return;

  const BUTTON_ID = "keep-clipper-inline-save-btn";
  const OFFSET = 8;
  const MIN_LEFT = 8;
  const MIN_TOP = 8;
  let button = null;

  init().catch((err) => {
    console.error("contentSelection init failed", err);
  });

  async function init() {
    const { inlineEnabled, domainFilters } = await loadSettings();
    if (!inlineEnabled) return;
    if (!isAllowedHost(location.hostname, domainFilters)) return;

    const schedule = () => requestAnimationFrame(handleSelectionChange);

    document.addEventListener("selectionchange", schedule);
    document.addEventListener("mouseup", schedule);
    document.addEventListener("keyup", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
  }

  function handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      removeButton();
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      removeButton();
      return;
    }

    const anchor = selection.anchorNode;
    if (isEditable(anchor)) {
      removeButton();
      return;
    }

    const rect = getSelectionRect(selection);
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      removeButton();
      return;
    }

    const btn = ensureButton();
    positionButton(btn, rect);
  }

  function ensureButton() {
    if (button) return button;

    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.type = "button";
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
      <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" fill="#fff"/>
    </svg>Keep`;
    Object.assign(btn.style, {
      position: "fixed",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: "bold",
      lineHeight: "1",
      color: "#fff",
      background: "#FBBC04",
      border: "none",
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      cursor: "pointer",
      userSelect: "none",
    });

    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 選択テキストとURLを取得してメッセージに含める
      const selectedText = window.getSelection()?.toString().trim() || "";
      const pageUrl = location.href;

      try {
        chrome.runtime
          .sendMessage({
            type: "save-selection",
            text: selectedText,
            url: pageUrl,
          })
          .catch(() => {});
      } catch (_err) {
        // Extension context may be invalid
      }

      removeButton();
    });

    document.body.appendChild(btn);
    button = btn;
    return btn;
  }

  function positionButton(btn, rect) {
    const btnWidth = btn.offsetWidth || 60;
    const btnHeight = btn.offsetHeight || 30;

    let left = rect.right + OFFSET;
    if (left + btnWidth > window.innerWidth - MIN_LEFT) {
      left = Math.max(MIN_LEFT, rect.right - btnWidth - OFFSET);
    }

    let top = rect.bottom + OFFSET;
    if (top + btnHeight > window.innerHeight - MIN_TOP) {
      top = Math.max(MIN_TOP, rect.top - btnHeight - OFFSET);
    }

    btn.style.left = `${left}px`;
    btn.style.top = `${top}px`;
  }

  function removeButton() {
    if (!button) return;
    button.remove();
    button = null;
  }

  function getSelectionRect(selection) {
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects ? Array.from(range.getClientRects()) : [];
    const visibleRects = rects.filter((r) => r.width > 0 && r.height > 0);
    const targetRect = visibleRects.length
      ? visibleRects[visibleRects.length - 1]
      : range.getBoundingClientRect();
    return targetRect;
  }

  function isEditable(node) {
    if (!node) return false;
    let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (current) {
      if (
        current instanceof HTMLInputElement ||
        current instanceof HTMLTextAreaElement ||
        current.isContentEditable
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  async function loadSettings() {
    try {
      const res = await chrome.storage.local.get({
        inlineEnabled: true,
        domainFilters: [],
      });
      return {
        inlineEnabled: res.inlineEnabled !== false,
        domainFilters: Array.isArray(res.domainFilters) ? res.domainFilters : [],
      };
    } catch (_err) {
      return { inlineEnabled: true, domainFilters: [] };
    }
  }

  function isAllowedHost(hostname, filters) {
    if (!filters || filters.length === 0) return true;
    return filters.some((filter) => {
      const normalized = filter.trim().toLowerCase();
      if (!normalized) return false;
      const host = hostname.toLowerCase();
      return host === normalized || host.endsWith(`.${normalized}`);
    });
  }
})();

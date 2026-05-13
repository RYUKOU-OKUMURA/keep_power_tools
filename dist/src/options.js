(() => {
  const SELECTION_SAVE_KEY = "selectionSaveEnabled";
  const INLINE_KEY = "inlineEnabled";
  const FILTER_KEY = "domainFilters";
  const QUICK_ACTIONS_KEY = "quickActionsConfig";

  const $selectionSave = document.getElementById("selectionSaveEnabled");
  const $inline = document.getElementById("inlineEnabled");
  const $filters = document.getElementById("domainFilters");
  const $save = document.getElementById("saveBtn");
  const $status = document.getElementById("status");

  // Quick Actions チェックボックス
  const $quickActions = {
    delete: document.getElementById("quickActionDelete"),
    label: document.getElementById("quickActionLabel"),
    copy: document.getElementById("quickActionCopy"),
    docs: document.getElementById("quickActionDocs"),
    history: document.getElementById("quickActionHistory"),
  };

  // デフォルトの Quick Actions 設定（すべて有効）
  const DEFAULT_QUICK_ACTIONS = {
    delete: true,
    label: true,
    copy: true,
    docs: true,
    history: true,
  };

  const load = async () => {
    const res = await chrome.storage.local.get({
      [SELECTION_SAVE_KEY]: true,
      [INLINE_KEY]: true,
      [FILTER_KEY]: [],
      [QUICK_ACTIONS_KEY]: DEFAULT_QUICK_ACTIONS,
    });
    $selectionSave.checked = res[SELECTION_SAVE_KEY] !== false;
    $inline.checked = Boolean(res[INLINE_KEY]);
    updateInlineAvailability();
    $filters.value = (res[FILTER_KEY] || []).join("\n");

    const quickActionsConfig = res[QUICK_ACTIONS_KEY] || DEFAULT_QUICK_ACTIONS;
    Object.keys($quickActions).forEach((id) => {
      $quickActions[id].checked = Boolean(quickActionsConfig[id]);
    });
  };

  const save = async () => {
    $save.disabled = true;
    $status.textContent = "保存中…";
    $status.className = "status";
    const filters = $filters.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const quickActionsConfig = {};
    Object.keys($quickActions).forEach((id) => {
      quickActionsConfig[id] = $quickActions[id].checked;
    });

    await chrome.storage.local.set({
      [SELECTION_SAVE_KEY]: $selectionSave.checked,
      [INLINE_KEY]: $inline.checked,
      [FILTER_KEY]: filters,
      [QUICK_ACTIONS_KEY]: quickActionsConfig,
    });
    $status.textContent = "保存しました";
    $status.className = "status success";
    setTimeout(() => {
      $status.textContent = "";
      $status.className = "status";
    }, 2000);
    $save.disabled = false;
  };

  const updateInlineAvailability = () => {
    const enabled = $selectionSave.checked;
    $inline.disabled = !enabled;
  };

  $selectionSave.addEventListener("change", updateInlineAvailability);

  $save.addEventListener("click", () => {
    save().catch((err) => {
      console.error("options save failed", err);
      $status.textContent = "保存に失敗しました";
      $status.className = "status error";
      $save.disabled = false;
    });
  });

  load().catch((err) => console.error("options load failed", err));
})();

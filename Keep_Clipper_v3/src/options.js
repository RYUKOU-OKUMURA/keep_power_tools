(() => {
  const INLINE_KEY = "inlineEnabled";
  const FILTER_KEY = "domainFilters";

  const $inline = document.getElementById("inlineEnabled");
  const $filters = document.getElementById("domainFilters");
  const $save = document.getElementById("saveBtn");
  const $status = document.getElementById("status");

  const load = async () => {
    const res = await chrome.storage.local.get({
      [INLINE_KEY]: true,
      [FILTER_KEY]: [],
    });
    $inline.checked = Boolean(res[INLINE_KEY]);
    $filters.value = (res[FILTER_KEY] || []).join("\n");
  };

  const save = async () => {
    $save.disabled = true;
    $status.textContent = "保存中…";
    $status.className = "status";
    const filters = $filters.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await chrome.storage.local.set({
      [INLINE_KEY]: $inline.checked,
      [FILTER_KEY]: filters,
    });
    $status.textContent = "保存しました";
    $status.className = "status success";
    setTimeout(() => {
      $status.textContent = "";
      $status.className = "status";
    }, 2000);
    $save.disabled = false;
  };

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


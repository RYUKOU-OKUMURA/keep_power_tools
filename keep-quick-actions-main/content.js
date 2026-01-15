/**
 * Google Keep Quick Actions
 * 3点リーダーメニューの項目をツールバーに直接表示
 */

(function() {
  'use strict';

  // メニュー項目の定義（表示順）
  const MENU_ITEMS = [
    { id: 'delete', label: 'メモを削除', icon: 'delete' },
    { id: 'label', label: 'ラベルを追加', icon: 'label' },
    { id: 'copy', label: 'コピーを作成', icon: 'content_copy' },
    { id: 'docs', label: 'Googleドキュメントにコピー', icon: 'description' },
    { id: 'history', label: '変更履歴', icon: 'history' }
  ];

  // SVGアイコン定義
  const ICONS = {
    delete: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    label: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>`,
    content_copy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
    description: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>`
  };

  // 追加済みフラグ（重複防止）
  let buttonsAdded = false;
  let currentToolbar = null;

  /**
   * クイックアクションボタンを作成
   */
  function createQuickButton(item) {
    const button = document.createElement('div');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('data-tooltip-text', item.label);
    button.setAttribute('aria-label', item.label);
    button.setAttribute('data-quick-action', item.id);
    button.className = 'keep-quick-action';
    button.style.cssText = 'user-select: none; position: relative;';
    
    // アイコンを挿入
    button.innerHTML = ICONS[item.icon];
    
    // SVG要素に直接スタイルを適用（Google Keepのスタイルを確実に上書き）
    const svg = button.querySelector('svg');
    if (svg) {
      svg.style.cssText = 'width: 20px !important; height: 20px !important; display: block !important; fill: #5f6368 !important; color: #5f6368 !important;';
      const path = svg.querySelector('path');
      if (path) {
        path.style.cssText = 'fill: #5f6368 !important;';
      }
    }
    
    // クリックイベント
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerMenuItem(item, button);
    });

    // キーボードサポート
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerMenuItem(item, button);
      }
    });

    return button;
  }

  /**
   * 3点リーダーメニューから対応する項目をクリック
   */
  function triggerMenuItem(item, originEl) {
    const label = item?.label || '';

    function normalizeText(text) {
      return (text || '').replace(/\s+/g, '').trim();
    }

    function isVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function dispatchKey(target, { key, code }) {
      if (!target) return;
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key,
          code
        })
      );
      target.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key,
          code
        })
      );
    }

    function dispatchMouse(el, type, { clientX, clientY } = {}) {
      el.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: 1,
          clientX,
          clientY
        })
      );
    }

    function dispatchPointer(el, type, { clientX, clientY } = {}) {
      if (!window.PointerEvent) return;
      el.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerType: 'mouse',
          isPrimary: true,
          button: 0,
          buttons: 1,
          clientX,
          clientY
        })
      );
    }

    function clickLikeUser(el) {
      try {
        el.focus?.({ preventScroll: true });
      } catch (_) {}

      const rect = el.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;

      dispatchPointer(el, 'pointerdown', { clientX, clientY });
      dispatchMouse(el, 'mousedown', { clientX, clientY });
      dispatchPointer(el, 'pointerup', { clientX, clientY });
      dispatchMouse(el, 'mouseup', { clientX, clientY });
      dispatchMouse(el, 'click', { clientX, clientY });
    }

    function getZIndex(el) {
      const z = window.getComputedStyle(el).zIndex;
      const parsed = Number.parseInt(z, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function countVisibleMenuItems(root = document) {
      const all = root.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
      let count = 0;
      for (const el of all) {
        if (isVisible(el)) count += 1;
      }
      return count;
    }

    function findVisibleMenuRoot(moreButtonEl) {
      if (moreButtonEl) {
        const controlsId = moreButtonEl.getAttribute('aria-controls');
        if (controlsId) {
          const controlled = document.getElementById(controlsId);
          if (controlled && isVisible(controlled)) return controlled;
        }
      }

      // メニューがまだ取得できない場合は、可視の menuitem から祖先メニューを逆引きする
      const visibleMenuItems = Array.from(
        document.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]')
      ).filter(isVisible);
      for (const menuItem of visibleMenuItems) {
        const ancestorMenu = menuItem.closest('[role="menu"]');
        if (ancestorMenu && isVisible(ancestorMenu)) return ancestorMenu;
      }

      const menuCandidates = Array.from(document.querySelectorAll('[role="menu"], .goog-menu')).filter(isVisible);
      if (!menuCandidates.length) return null;

      // 画面上で前面にあるメニューを優先
      menuCandidates.sort((a, b) => getZIndex(b) - getZIndex(a));
      return menuCandidates[0];
    }

    function findMoreButtonNearOrigin() {
      const scope =
        originEl?.closest('[role="toolbar"], .Q0hgme-XPtOyb-INgbqf, .VIpgJd-xl07Ob-MTpRob') ||
        originEl?.parentElement ||
        document;

      const candidates = Array.from(
        scope.querySelectorAll('[role="button"], button, [aria-haspopup="menu"], [data-tooltip-text], [aria-label]')
      )
        .filter((el) => el && el !== originEl)
        .filter(isVisible);

      // 「その他/More」を最優先で特定。aria-haspopup は補助的に扱う（色など別メニュー誤爆回避）
      const scored = candidates
        .map((el) => {
          const ariaLabel = el.getAttribute('aria-label') || '';
          const tooltip = el.getAttribute('data-tooltip-text') || '';
          const combined = `${ariaLabel} ${tooltip}`.trim();
          const lower = combined.toLowerCase();
          const hasMoreJa = combined.includes('その他');
          const hasMoreEn = lower.includes('more');
          const hasMenuPopup = (el.getAttribute('aria-haspopup') || '').toLowerCase() === 'menu';

          let score = 0;
          if (hasMoreJa) score += 100;
          if (hasMoreEn) score += 80;
          if (hasMenuPopup) score += 20;
          if (combined) score += 1;

          return { el, score };
        })
        .sort((a, b) => b.score - a.score);

      if (scored.length && scored[0].score >= 80) return scored[0].el;

      // 最終手段：ページ全体から探す（従来挙動）
      let moreButton = document.querySelector('[aria-label="その他"], [data-tooltip-text="その他"]');
      if (!moreButton) {
        moreButton = document.querySelector(
          '[aria-label="その他のアクション"], [aria-label="その他の操作"], [data-tooltip-text="その他の操作"]'
        );
      }
      if (moreButton && moreButton !== originEl) return moreButton;

      return null;
    }

    function matchesMenuItemText(menuText) {
      const textNorm = normalizeText(menuText);
      const labelNorm = normalizeText(label);
      if (labelNorm && (textNorm === labelNorm || textNorm.includes(labelNorm))) return true;

      // 例: "Google ドキュメントにコピー" のような表記揺れ
      const noGoogleNorm = normalizeText(label.replace(/Google/gi, ''));
      if (noGoogleNorm && textNorm.includes(noGoogleNorm)) return true;

      // 最低限のフォールバック（誤爆を避けて絞る）
      if (item?.id === 'delete' && textNorm.includes('削除')) return true;
      if (item?.id === 'label' && textNorm.includes('ラベル')) return true;
      if (item?.id === 'copy' && textNorm.includes('コピー') && textNorm.includes('作成')) return true;
      if (item?.id === 'docs' && textNorm.includes('ドキュメント') && textNorm.includes('コピー')) return true;
      if (item?.id === 'history' && textNorm.includes('履歴')) return true;

      return false;
    }

    const moreButton = findMoreButtonNearOrigin();
    if (!moreButton) {
      console.log('Keep Quick Actions: メニューボタンが見つかりません');
      return;
    }

    const beforeCount = countVisibleMenuItems();

    // メニューを開く（Keep側が click ではなく pointer/mouse に反応する場合に備える）
    clickLikeUser(moreButton);
    try {
      // 一応フォールバックも呼ぶ
      moreButton.click?.();
    } catch (_) {}

    const start = performance.now();
    const timeoutMs = 1200;
    let menuRoot = null;

    (function poll() {
      if (!menuRoot) {
        menuRoot = findVisibleMenuRoot(moreButton);
      }

      // “開いたメニュー内”だけを探索対象にする（誤爆クリック防止）
      const visibleItems = menuRoot
        ? Array.from(
            menuRoot.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]')
          ).filter(isVisible)
        : [];

      for (const menuItem of visibleItems) {
        const text = (menuItem.textContent || '').trim();
        if (matchesMenuItemText(text)) {
          clickLikeUser(menuItem);
          try {
            menuItem.click?.();
          } catch (_) {}
          return;
        }
      }

      if (performance.now() - start > timeoutMs) {
        const afterCount = countVisibleMenuItems();
        if (afterCount <= beforeCount) {
          console.log('Keep Quick Actions: メニューが開けませんでした（クリック方法/対象の可能性）:', label);
        } else {
          console.log('Keep Quick Actions: メニュー項目が見つかりません:', label);
        }
        // 見つからなかった場合は Escape で閉じる（Keep側が合成キーを無視する場合もある）
        try {
          dispatchKey(menuRoot || document.activeElement || document, { key: 'Escape', code: 'Escape' });
          dispatchKey(document, { key: 'Escape', code: 'Escape' });
        } catch (_) {}
        return;
      }

      requestAnimationFrame(poll);
    })();
  }

  /**
   * ツールバーにクイックアクションボタンを追加
   */
  function addQuickButtons(toolbar) {
    // すでに追加済みの場合はスキップ
    if (toolbar.querySelector('.keep-quick-action')) {
      return;
    }

    // 固定ボタンを探す
    const pinButton = toolbar.querySelector('[aria-label="固定"], [data-tooltip-text="固定"]');
    
    if (!pinButton) {
      return;
    }

    // 各メニュー項目のボタンを作成して挿入
    const fragment = document.createDocumentFragment();
    MENU_ITEMS.forEach(item => {
      const btn = createQuickButton(item);
      fragment.appendChild(btn);
      console.log('Keep Quick Actions: ボタンを作成:', item.label);
    });

    // 固定ボタンの前に挿入
    pinButton.parentNode.insertBefore(fragment, pinButton);
    
    console.log('Keep Quick Actions: ボタンを追加しました。追加数:', MENU_ITEMS.length);
  }

  /**
   * ツールバーを監視して検出
   */
  function findAndEnhanceToolbar() {
    // 選択モードのツールバーを探す
    // 「1 個を選択中」などのテキストがあるヘッダー
    const selectionHeaders = document.querySelectorAll('.Q0hgme-LgbsSe.Q0hgme-Bz112c-LgbsSe');
    
    // 固定ボタンがあるツールバーを探す
    const pinButtons = document.querySelectorAll('[aria-label="固定"], [data-tooltip-text="固定"]');
    
    pinButtons.forEach(pinButton => {
      const toolbar = pinButton.closest('.Q0hgme-XPtOyb-INgbqf, .VIpgJd-xl07Ob-MTpRob, [role="toolbar"]') || pinButton.parentElement;
      if (toolbar && !toolbar.querySelector('.keep-quick-action')) {
        addQuickButtons(toolbar);
      }
    });
  }

  /**
   * DOM変更を監視
   */
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      // ツールバーの変更を検出
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldCheck = true;
          break;
        }
      }
      
      if (shouldCheck) {
        // 少し遅延させて確実に要素が描画されてからチェック
        requestAnimationFrame(() => {
          findAndEnhanceToolbar();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初回チェック
    findAndEnhanceToolbar();
  }

  // ページ読み込み完了後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDOM);
  } else {
    observeDOM();
  }

})();

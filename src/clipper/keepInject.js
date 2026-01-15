(() => {
  // ストップワード（日本語・英語）
  const STOPWORDS = new Set([
    // 英語ストップワード
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and',
    'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that',
    'these', 'those', 'it', 'its', 'https', 'http', 'com', 'www',
    // 汎用漢字熟語（説明文で頻出）
    '画像', '文字', '以下', '内容', '方法', '場合', '部分', '結果', '情報',
    '説明', '表示', '確認', '入力', '出力', '処理', '実行', '作成', '削除',
    '変更', '設定', '機能', '操作', '選択', '指定', '利用', '使用', '取得',
    '上記', '下記', '前述', '後述', '次回', '今回', '通り', '以上', '以外',
    '問題', '質問', '回答', '要求', '必要', '可能', '不可', '有効', '無効'
  ]);

  function extractKeywords(text, maxCount = 4) {
    const textWithoutUrls = text.replace(/https?:\/\/[^\s]+/g, '');

    // 優先度別に抽出（1: 英単語, 2: カタカナ, 3: 漢字熟語）
    const englishWords = textWithoutUrls.match(/[A-Z][a-z]+|[A-Z]{2,}|[a-z]{4,}/g) || [];
    const katakana = textWithoutUrls.match(/[ァ-ヶー]{3,}/g) || [];
    const kanjiOnly = textWithoutUrls.match(/[一-龯]{2,6}/g) || [];

    const candidates = [
      ...englishWords.map(w => ({ word: w, priority: 1 })),
      ...katakana.map(w => ({ word: w, priority: 2 })),
      ...kanjiOnly.map(w => ({ word: w, priority: 3 })),
    ];

    // 優先度順にソートし、ストップワード除外 & 重複除去
    const keywords = [];
    const seen = new Set();
    for (const { word } of candidates.sort((a, b) => a.priority - b.priority)) {
      const lower = word.toLowerCase();
      if (!STOPWORDS.has(lower) && !STOPWORDS.has(word) && !seen.has(lower)) {
        seen.add(lower);
        keywords.push(word);
        if (keywords.length >= maxCount) break;
      }
    }
    return keywords;
  }

  function generateTitle(text) {
    const keywords = extractKeywords(text, 4);
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');

    if (keywords.length >= 2) {
      return keywords.join('_') + '_' + date;
    }
    return 'clip_' + date;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const run = async () => {
    const { text = "", url = "" } = globalThis.__keepPowerToolsClipperPayload || {};
    const payload = [text, url].filter(Boolean).join("\n");

    if (!location.hostname.includes("keep.google.com")) return;

    // セレクター定義
    const composerSelectors = [
      'div[role="combobox"][aria-autocomplete="list"]',
      '.IZ65Hb-vIzZGf-L9AdLc-haAclf',
    ];

    const titleSelectors = [
      'div[aria-label="タイトル"][contenteditable="true"]',
      'div[aria-label="Title"][contenteditable="true"]',
    ];

    const bodySelectors = [
      'div[role="combobox"][aria-autocomplete="list"]',
      '.IZ65Hb-vIzZGf-L9AdLc-haAclf',
    ];

    try {
      // 1. コンポーザーを見つける
      const composer = await waitForElement(composerSelectors, 10000);
      if (!composer) return;

      // 2. クリックしてノートを展開
      composer.click();
      await sleep(400);

      // 3. タイトル欄を見つけて入力
      const title = generateTitle(text);
      const titleField = await waitForElement(titleSelectors, 3000);
      if (titleField) {
        fill(titleField, title);
        await sleep(100);
      }

      // 4. 本文欄を見つけて入力
      const bodyField = await waitForElement(bodySelectors, 3000);
      if (bodyField) {
        fillBody(bodyField, payload);
      }

      // 5. 閉じる
      await sleep(200);
      finalize();
    } catch (err) {
      console.error("Keep inject failed", err);
    }
  };

  run();

  function waitForElement(selectorList, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve) => {
      const tryFind = () => {
        const found = selectorList
          .map((s) => document.querySelector(s))
          .find(Boolean);
        if (found) {
          resolve(found);
          observer.disconnect();
          return;
        }
        if (Date.now() > deadline) {
          resolve(null);
          observer.disconnect();
        }
      };

      const observer = new MutationObserver(tryFind);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      tryFind();
    });
  }

  function fill(target, value) {
    target.focus();
    target.innerHTML = "";
    target.textContent = value;
    target.dispatchEvent(
      new InputEvent("input", { bubbles: true, cancelable: true })
    );
    target.blur();
  }

  function fillBody(target, value) {
    target.click();
    target.focus();

    const pElement = target.querySelector('p');
    if (pElement) {
      pElement.innerHTML = '';
      const lines = value.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          pElement.appendChild(document.createElement('br'));
        }
        pElement.appendChild(document.createTextNode(line));
      });
    } else {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, value);
    }

    target.dispatchEvent(
      new InputEvent("input", { bubbles: true, cancelable: true })
    );
  }

  function finalize() {
    let closeBtn =
      document.querySelector('[aria-label="閉じる"]') ||
      document.querySelector('[aria-label="Close"]');

    if (!closeBtn) {
      closeBtn = Array.from(document.querySelectorAll('[role="button"]'))
        .find(el => {
          const text = el.textContent?.trim();
          return text === '閉じる' || text === 'Close';
        });
    }

    if (closeBtn) {
      closeBtn.click();
      return;
    }
    document.body?.click();
  }
})();

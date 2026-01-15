# Keep Power Tools

**ウェブページを Google Keep に保存し、Keep 内でクイック操作ができる統合 Chrome 拡張機能**

Keep Clipper と keep-quick-actions を統合したパワフルなツールセット。

---

## 📦 パッケージの概要

```
Keep Power Tools v1.0.0
├── 🔗 Clipper: ウェブページのテキスト + URL を Keep に保存
│   ├── ツールバーボタンでワンクリック保存
│   ├── 選択テキストのインラインボタン
│   └── 右クリックメニューからの保存
│
└── ⚡ Quick Actions: Keep 内での 5つの操作をツールバーに表示
    ├── メモを削除
    ├── ラベルを追加
    ├── コピーを作成
    ├── Googleドキュメントにコピー
    └── 変更履歴
```

---

## 🚀 5分でセットアップ

### 1️⃣ ロード
```
chrome://extensions/ → デベロッパーモードON
→ 「パッケージ化されていない拡張機能を読み込む」
→ keep_power_tools フォルダを選択
```

### 2️⃣ 設定（オプション）
```
Keep Power Tools アイコン → 右クリック → オプション
→ Quick Actions 表示設定で有効なアクションを選択 → 保存
```

### 3️⃣ 使用開始
```
ウェブページでテキスト選択 → Keep に保存
→ Google Keep でメモ選択 → Quick Actions で操作
```

**詳細は `QUICK_START.md` を参照**

---

## 📋 ドキュメント一覧

| ファイル | 用途 | 対象ユーザー |
|---------|------|------------|
| **QUICK_START.md** | 5分で始めるガイド | 全員 |
| **TESTING_GUIDE.md** | 完全な動作確認チェックリスト | テスター |
| **EXECUTION_PLAN.md** | フェーズごとの実装状況 | 開発者 |
| **MERGE_PLAN.md** | 統合計画の詳細 | 開発者 |

---

## ✅ 実装状況

### Phase 0-5: 実装完了 ✅
- [x] ファイル構成の統合
- [x] manifest.json の統合設定
- [x] Clipper のパス・変数の統一
- [x] Quick Actions 表示選択UI
- [x] Chrome Storage との連携

### Phase 6: 動作確認  🔄
テストガイドに従って、以下を確認：
- [ ] Clipper 機能（保存できる）
- [ ] Quick Actions 表示（5つボタンが表示される）
- [ ] 表示選択機能（設定が反映される）
- [ ] 統合動作（Clipper → Keep → Quick Actions が連続で動く）

### Phase 7: 運用 ⏳
実装完了後：
- [ ] Chrome Web Store へのアップロード（オプション）
- [ ] 正式版配布

---

## 🎯 期待される動作

### ✅ OKな状態
- ウェブページで「Keep に保存」できる
- Google Keep で 5つの Quick Actions ボタンが表示される
- オプション設定が保存される
- Keep ページでは Clipper が動作しない（意図的）

### ❌ NGな状態
- Quick Actions ボタンが表示されない
- 設定が反映されない
- Keep への保存に失敗する

---

## 🔍 ファイル構成

```
keep_power_tools/
├── manifest.json              # Manifest v3設定
├── README.md                  # このファイル
├── QUICK_START.md            # クイックスタート
├── TESTING_GUIDE.md          # テストチェックリスト
├── EXECUTION_PLAN.md         # 実装計画書
├── MERGE_PLAN.md             # 統合計画書
│
├── icons/                     # 拡張機能アイコン
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
└── src/
    ├── background.js          # Service Worker（Clipper制御）
    ├── options.html           # オプション画面
    ├── options.js             # オプション設定管理
    │
    ├── clipper/               # Keep に保存する機能
    │   ├── contentSelection.js
    │   └── keepInject.js
    │
    └── quick-actions/         # Keep 内の操作ツール
        ├── content.js
        └── styles.css
```

---

## 🛠️ 技術スタック

- **Manifest**: v3（最新Chrome拡張仕様）
- **Storage**: Chrome storage API（localStorage）
- **Script**: Vanilla JavaScript（フレームワーク不要）
- **Styling**: CSS（Google Keep デザイン準拠）

---

## 📌 重要な実装ポイント

### グローバル変数統一
```javascript
// Clipper データの受け渡し
globalThis.__keepPowerToolsClipperPayload
```

### ファイルパス統合
```javascript
// Clipper のカプセル化
src/clipper/keepInject.js
src/clipper/contentSelection.js
```

### 設定管理
```javascript
// Quick Actions 表示設定
storage.quickActionsConfig = {
  delete: true,
  label: true,
  copy: true,
  docs: true,
  history: true
}
```

---

## 🔐 プライバシー・セキュリティ

- ✅ 取得データ：選択テキスト + ページ URL のみ
- ✅ 送信先：Google Keep のみ（拡張内に保存なし）
- ✅ 権限：最小限のみ（activeTab, scripting, storage）
- ✅ シークレットモード対応

---

## 🆘 トラブルシューティング

### Quick Actions ボタンが表示されない
1. メモをクリックして選択状態にする
2. Chrome を再起動
3. DevTools で console を確認

### 設定が反映されない
1. Google Keep を再度開く
2. Chrome キャッシュをクリア
3. storage を確認（DevTools → Application）

**詳細は `TESTING_GUIDE.md` → トラブルシューティングを参照**

---

## 📞 サポート・フィードバック

問題や質問がある場合：
1. `TESTING_GUIDE.md` で確認
2. DevTools コンソールでエラーを確認
3. オリジナルレポ（Keep_Clipper_v3, keep-quick-actions-main）を参照

---

## 📈 ロードマップ

### v1.0.0（現在）✅
- [x] Keep Clipper + Quick Actions 統合
- [x] 表示選択機能
- [x] テストドキュメント

### v1.1.0（検討中）
- [ ] キーボードショートカット対応
- [ ] テーマカスタマイズ
- [ ] クラウド同期

---

## 📜 ライセンス

このプロジェクトは、以下のレポジトリを基に統合されています：
- Keep Clipper v3
- keep-quick-actions

各オリジナルプロジェクトのライセンスに準拠します。

---

## 🎉 使い始める

1. **新しく始めたい** → `QUICK_START.md`
2. **詳しくテストしたい** → `TESTING_GUIDE.md`
3. **実装状況を確認したい** → `EXECUTION_PLAN.md`
4. **統合の詳細が知りたい** → `MERGE_PLAN.md`

---

**Keep Power Tools v1.0.0**
最終更新: 2026-01-15
ステータス: テスト準備完了 ✅

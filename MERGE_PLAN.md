# Keep Power Tools 統合プラン

2つのGoogle Keep用Chrome拡張機能を1つに統合します。

## 統合対象

| 拡張機能 | 機能 | 動作場所 |
|---------|------|----------|
| Keep Clipper | Webページから選択テキスト+URLをKeepに保存 | 全サイト（Keep除外） |
| Keep Quick Actions | Keepのメニュー項目をツールバーに表示 | keep.google.com のみ |

---

## 作業方針

- このディレクトリ内で統合作業を行い、完成版は別ディレクトリで運用する
- 統合作業用の成果物は `keep-power-tools/` に集約する

---

## 統合後のファイル構造

```
keep-power-tools/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background.js
│   ├── options.html
│   ├── options.js
│   ├── clipper/
│   │   ├── contentSelection.js
│   │   └── keepInject.js
│   └── quick-actions/
│       ├── content.js
│       └── styles.css
```

---

## 実装手順

### Step 1: ディレクトリ構造作成
```bash
mkdir -p keep-power-tools/icons
mkdir -p keep-power-tools/src/clipper
mkdir -p keep-power-tools/src/quick-actions
```

### Step 2: ファイルコピー

**アイコン（Keep_Clipper_v3から - 4サイズ完備）**
- `Keep_Clipper_v3/icons/*` → `keep-power-tools/icons/`

**Clipper機能**
- `Keep_Clipper_v3/src/contentSelection.js` → `src/clipper/`
- `Keep_Clipper_v3/src/keepInject.js` → `src/clipper/`
- `Keep_Clipper_v3/src/background.js` → `src/`
- `Keep_Clipper_v3/src/options.html` → `src/`
- `Keep_Clipper_v3/src/options.js` → `src/`

**Quick Actions機能**
- `keep-quick-actions-main/content.js` → `src/quick-actions/`
- `keep-quick-actions-main/styles.css` → `src/quick-actions/`

### Step 3: manifest.json 作成

統合マニフェストを新規作成:
- permissions: Keep Clipperの権限をそのまま採用
- 名前: "Keep Power Tools"
- description: 統合内容に合わせて更新
- action.default_title: "Keep Power Tools"
- background.service_worker: `src/background.js`
- options_page: `src/options.html`
- host_permissions: `https://keep.google.com/*`
- content_scripts: 2つの定義を並列配置
  - Clipper: `src/clipper/contentSelection.js`（Keepは除外）
  - Quick Actions: `src/quick-actions/content.js` + `src/quick-actions/styles.css`

### Step 4: コード修正

**background.js** (2箇所)
1. `injectToKeep()`内のファイルパス変更
   - `"src/keepInject.js"` → `"src/clipper/keepInject.js"`
2. グローバル変数名変更（衝突回避）
   - `__keepClipPayload` → `__keepPowerToolsClipperPayload`

**keepInject.js** (1箇所)
- グローバル変数名をbackground.jsに合わせて変更

**options.html** (2箇所+)
- タイトル: "Keep Clipper 設定" → "Keep Power Tools 設定"
- ヘッダー: 同様に変更
- Quick Actionsの表示アクション選択UIを追加

**options.js**
- Quick Actionsの表示アクション設定を保存/読み込みする

**quick-actions/content.js**
- 保存された表示アクション設定を参照してボタン生成を制御する

### Step 5: 動作確認

Chromeで拡張機能をロードしてテスト

---

## 修正が必要なファイル

| ファイル | 修正内容 |
|---------|---------|
| `src/background.js` | ファイルパス + グローバル変数名 |
| `src/clipper/keepInject.js` | グローバル変数名 |
| `src/options.html` | タイトル・ヘッダー文言 |
| `src/options.js` | Quick Actionsの表示設定 |
| `src/quick-actions/content.js` | Quick Actionsの表示制御 |

---

## テスト計画

### Clipper機能
1. ツールバーボタンでKeepに保存
2. テキスト選択後のインラインボタン表示・保存
3. 右クリックコンテキストメニューから保存
4. keep.google.com上では動作しないことを確認

### Quick Actions機能
1. keep.google.comでメモ選択時にボタン表示
2. 各ボタン（削除、ラベル、コピー等）が正常動作
3. オプションで表示/非表示が切り替わること（例: Googleドキュメントにコピー）
4. ダークモード対応の確認

### 統合テスト
1. Webページで保存 → Keep内で操作の連続動作
2. オプション設定の保存・反映
3. 拡張機能の再起動後も正常動作

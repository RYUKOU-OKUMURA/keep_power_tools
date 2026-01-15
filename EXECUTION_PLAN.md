# Keep Power Tools 実行計画書

MERGE_PLAN.md をもとに、統合作業をフェーズごとに分解した実行計画です。
各タスクは完了時にチェックを入れて進捗管理します。

---

## Phase 0: 事前確認と作業準備

- [x] 作業用ディレクトリ `keep-power-tools/` を作成する
- [x] 現状の2拡張の最新状態を確認する（必要ならコミット/バックアップ）
- [x] 統合後の名前・説明・アイコン方針を確定する
- [x] Quick Actions の表示選択機能の仕様を決める（対象アクション/初期値）

---

## Phase 1: ファイル構成の作成とコピー

- [x] `keep-power-tools/icons/` を作成する
- [x] `keep-power-tools/src/clipper/` を作成する
- [x] `keep-power-tools/src/quick-actions/` を作成する

- [x] `Keep_Clipper_v3/icons/*` を `keep-power-tools/icons/` にコピーする
- [x] `Keep_Clipper_v3/src/contentSelection.js` を `keep-power-tools/src/clipper/` にコピーする
- [x] `Keep_Clipper_v3/src/keepInject.js` を `keep-power-tools/src/clipper/` にコピーする
- [x] `Keep_Clipper_v3/src/background.js` を `keep-power-tools/src/` にコピーする
- [x] `Keep_Clipper_v3/src/options.html` を `keep-power-tools/src/` にコピーする
- [x] `Keep_Clipper_v3/src/options.js` を `keep-power-tools/src/` にコピーする

- [x] `keep-quick-actions-main/content.js` を `keep-power-tools/src/quick-actions/` にコピーする
- [x] `keep-quick-actions-main/styles.css` を `keep-power-tools/src/quick-actions/` にコピーする

---

## Phase 2: manifest.json 作成

- [x] `keep-power-tools/manifest.json` を新規作成する
- [x] `name` を "Keep Power Tools" に設定する
- [x] `description` を統合後の内容に合わせて設定する
- [x] `version` を適切に設定する
- [x] `manifest_version` を 3 に設定する
- [x] `permissions` に Keep Clipper の権限を設定する
- [x] `host_permissions` に `https://keep.google.com/*` を設定する
- [x] `background.service_worker` を `src/background.js` に設定する
- [x] `options_page` を `src/options.html` に設定する
- [x] `action.default_title` を "Keep Power Tools" に設定する
- [x] `action.default_icon` / `icons` を `icons/` に設定する
- [x] `content_scripts` に以下を設定する
  - [x] Clipper: `matches` は全サイト、`exclude_matches` に Keep を指定
  - [x] Clipper: `js` は `src/clipper/contentSelection.js`
  - [x] Quick Actions: `matches` は Keep のみ
  - [x] Quick Actions: `js` は `src/quick-actions/content.js`
  - [x] Quick Actions: `css` は `src/quick-actions/styles.css`

---

## Phase 3: Clipper 側の修正

- [x] `src/background.js` の `injectToKeep()` で参照するファイルパスを更新する
  - [x] `"src/keepInject.js"` → `"src/clipper/keepInject.js"`
- [x] `src/background.js` のグローバル変数名を変更する
  - [x] `__keepClipPayload` → `__keepPowerToolsClipperPayload`
- [x] `src/clipper/keepInject.js` のグローバル変数名を同じものに変更する

---

## Phase 4: オプション画面（Quick Actions 表示選択）

- [x] `src/options.html` のタイトル/ヘッダーを "Keep Power Tools" に更新する
- [x] Quick Actions の表示選択UIを追加する
  - [x] 表示対象アクションのチェックボックス一覧を追加する
  - [x] Googleドキュメントにコピーのオン/オフができるようにする
  - [x] デフォルトの選択状態を仕様通りにする
- [x] `src/options.js` に Quick Actions の設定保存/読み込みを追加する
  - [x] 保存キー名を決定する
  - [x] 既存設定との互換性を考慮する（未設定時のデフォルト）

---

## Phase 5: Quick Actions 表示制御

- [x] `src/quick-actions/content.js` に表示設定の読み込み処理を追加する
- [x] 表示対象アクションのみを `MENU_ITEMS` から生成するようにする
- [x] 設定変更時の反映タイミング方針を決める（ページ再読み込み or 即時）

---

## Phase 6: 動作確認

### Clipper
- [ ] ツールバーボタンで Keep に保存できる
- [ ] 選択テキストのインラインボタンが表示/保存できる
- [ ] 右クリックメニューから保存できる
- [ ] keep.google.com 上では動作しない

### Quick Actions
- [ ] keep.google.com でメモ選択時にボタンが表示される
- [ ] 各ボタンが正常動作する（削除/ラベル/コピー/履歴）
- [ ] Googleドキュメントにコピーの表示/非表示が反映される
- [ ] ダークモード表示が崩れない

### 統合
- [ ] Webページで保存 → Keep内でクイック操作が連続で使える
- [ ] オプション設定が保存され、再起動後も保持される

---

## Phase 7: 完成版の分離運用

- [ ] 完成版を運用用の別ディレクトリへ移動/複製する
- [ ] 作業用ディレクトリの扱い（保管/削除）を決める

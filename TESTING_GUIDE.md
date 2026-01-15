# Keep Power Tools - 動作確認ガイド

## 📦 パッケージ内容

`keep-power-tools-v1.0.0.zip` に以下のファイルが含まれています：

```
keep_power_tools/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── background.js
    ├── options.html
    ├── options.js
    ├── clipper/
    │   ├── contentSelection.js
    │   └── keepInject.js
    └── quick-actions/
        ├── content.js
        └── styles.css
```

## 🚀 Chrome へのロード方法

### 方法1: 解凍したフォルダから直接ロード（推奨）

1. ZIPファイルを解凍する
2. Chrome を開き、以下のURLにアクセス：
   ```
   chrome://extensions/
   ```
3. 右上の「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. 解凍した `keep_power_tools` フォルダを選択
6. 拡張機能がロードされます

### 方法2: ZIP から直接ロード

1. Chrome を開き、`chrome://extensions/` にアクセス
2. デベロッパーモードをONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `keep-power-tools-v1.0.0.zip` を選択（自動解凍されます）

## ✅ 動作確認チェックリスト

### フェーズ1: Clipper 機能の確認

#### 1.1 ツールバーボタンでの保存
- [ ] Chrome ツールバーの Keep Power Tools アイコンをクリック
- [ ] 新しいタブで Google Keep が開く
- [ ] テキストとURLが自動で入力される
- [ ] 保存が完了する

#### 1.2 選択テキストのインラインボタン
- [ ] ウェブページで任意のテキストを選択
- [ ] テキストの近くに「Keep に保存」ボタンが表示される
- [ ] ボタンをクリック
- [ ] Google Keep にテキストとURLが保存される

#### 1.3 右クリックメニューからの保存
- [ ] ウェブページで右クリック
- [ ] 「Google Keep に保存」メニューが表示される
- [ ] メニューをクリック
- [ ] Google Keep にテキストとURLが保存される

#### 1.4 Keep ページでの動作確認
- [ ] `https://keep.google.com/` にアクセス
- [ ] Clipper 機能が動作しないことを確認

### フェーズ2: Quick Actions 機能の確認

#### 2.1 Quick Actions ボタンの表示
- [ ] Google Keep でメモを作成
- [ ] メモを選択（チェックボックスをクリック）
- [ ] ツールバーに以下の5つのボタンが表示される：
  - [ ] メモを削除
  - [ ] ラベルを追加
  - [ ] コピーを作成
  - [ ] Googleドキュメントにコピー
  - [ ] 変更履歴

#### 2.2 各アクションの動作確認
- [ ] メモを削除ボタン → メモが削除される
- [ ] ラベルを追加ボタン → ラベル選択ダイアログが開く
- [ ] コピーを作成ボタン → メモのコピーが作成される
- [ ] Googleドキュメントにコピーボタン → Google ドキュメントが開く
- [ ] 変更履歴ボタン → 変更履歴が表示される

#### 2.3 表示選択機能の確認
- [ ] Chrome メニュー → 拡張機能の管理 → Keep Power Tools の「詳細」
- [ ] または、Keep Power Tools アイコンを右クリック → 「オプション」
- [ ] オプション画面が開く
- [ ] 「Quick Actions 表示設定」セクションで：
  - [ ] 5つのチェックボックスが表示される
  - [ ] 全てチェックボックスがONになっている（初期値）
  - [ ] いくつかのアクションをOFFにして「保存」
  - [ ] Google Keep を再度開く
  - [ ] OFFにしたアクションのボタンが非表示になることを確認
  - [ ] 逆にONにしてみて、ボタンが表示されることを確認

### フェーズ3: 統合動作確認

#### 3.1 Clipper + Quick Actions の連携
- [ ] ウェブページでテキストを選択 → Keep に保存
- [ ] Google Keep を開く
- [ ] 保存されたメモを選択
- [ ] Quick Actions ボタンが表示される
- [ ] 各操作が正常に動作する

#### 3.2 設定の永続化
- [ ] オプション画面で Quick Actions の設定を変更
- [ ] Chrome を再起動
- [ ] Google Keep を開く
- [ ] 設定がそのまま保持されていることを確認

## 🔍 デバッグ方法

### Chrome DevTools での確認

1. Chrome のデベロッパーツール（F12）を開く
2. 各ページで以下を確認：

#### Background Service Worker のログ
```
chrome://extensions/ → Keep Power Tools → 検査 → コンソール
```

#### Content Script のログ
```
ウェブページでF12 → Console タブ
"Keep Quick Actions:" というプレフィックスのログを探す
```

### よくあるトラブルと対処

| 問題 | 原因 | 対処法 |
|------|------|--------|
| Quick Actions ボタンが表示されない | content.js が読み込まれていない | DevTools で `console` を確認し、エラーメッセージを探す |
| 設定が反映されない | Chrome storage に書き込めていない | DevTools の Application → Storage で `chrome-extension://` の local storage を確認 |
| ファイルパスエラー | manifest.json のパス指定が間違っている | manifest.json の `files` 指定を確認 |

## 📝 注意事項

- Google アカウントにログイン済みである必要があります
- シークレットモードで使用する場合、拡張機能の設定で「シークレットモード」をONにしてください
- 各機能は最新版 Google Chrome で動作確認されています

## 🎯 期待される動作

✅ **動作OK の状態：**
- Clipper でウェブページのテキストと URL が Keep に保存される
- Quick Actions で 5つのアクションが表示・実行できる
- オプション設定が保存・反映される
- Keep では Clipper が動作しない

❌ **問題がある場合：**
- Chrome の再起動を試してください
- 拡張機能を無効化 → 再度有効化してください
- Chrome キャッシュをクリアしてください

## 📞 サポート

問題が発生した場合：
1. DevTools コンソールでエラーメッセージを確認
2. EXECUTION_PLAN.md で実装状況を確認
3. Keep_Clipper_v3 / keep-quick-actions のオリジナルレポで仕様を確認

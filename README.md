# Basic チェッククイズ

理解度チェック用クイズサイトです。

- 全19問（CLI 3 / HTML 3 / CSS 2 / Ruby 4 / Sinatra 7）
- 選択式（4択）
- 各問の回答後に解説表示
- 終了後にカテゴリ別サマリー・苦手分野アドバイス

目安所要時間: **約15分**

## 公開 URL（GitHub Pages）

**https://lazyturtle0852.github.io/basic-quiz/**

問題を更新したら `git push` するだけで数分後に反映されます。

## 教室LANで使う（メンターPC）

同一 Wi-Fi 上の受講生に URL を共有して使います。

```bash
cd "/Users/ryoma/Desktop/Obsidian/02_Career/internships/Life is Tech/basic-quiz"
./start.sh
```

`start.sh` が表示する **短い URL**（例: `http://10.63.24.45:8080/`）を受講生に共有してください。

手動で起動する場合:

```bash
cd ".../basic-quiz"
python3 -m http.server 8080 --bind 0.0.0.0
```

> **注意**
> - `02_Career` など親フォルダで起動すると URL が長くなり、共有ミスの原因になります。必ず `basic-quiz` 内で起動してください。
> - `index.html` を直接ダブルクリックで開くと JSON の読み込みに失敗します。

### 他の人から繋がらないとき

サーバーログに **自分の IP からしかアクセスが記録されない** 場合、サーバー自体は正常で **ネットワーク側の問題** です。

1. **ファイアウォール** — システム設定 → ネットワーク → ファイアウォール → オプション → **Python**（またはターミナル）への着信を許可
2. **同じ Wi-Fi か** — ゲスト Wi-Fi と本体 Wi-Fi は別ネットワークのことが多い
3. **教室 Wi-Fi の端末間通信禁止** — 大学・会場 Wi-Fi では他端末への接続がブロックされていることが多い（最も多い原因）
4. **確実な代替** — メンターの **スマホテザリング** に全員接続 → `./start.sh` → 短い URL を共有
5. **それでも無理なら** — GitHub Pages で URL 配布（下記）

## GitHub Pages で公開する

リポジトリ: https://github.com/Lazyturtle0852/lit-basic-quiz

### 初回セットアップ（済みなら不要）

```bash
cd ".../basic-quiz"
gh auth login          # 未ログインの場合
gh repo create lit-basic-quiz --public --source=. --remote=origin --push
gh api repos/Lazyturtle0852/lit-basic-quiz/pages -X POST -f build_type=workflow
```

### 問題を更新して再公開

```bash
cd ".../basic-quiz"
git add .
git commit -m "update questions"
git push
```

GitHub Actions が自動デプロイします（1〜3分）。

### 手動で Pages を有効化する場合

GitHub → リポジトリ → Settings → Pages → Source: **GitHub Actions**

## 問題の編集

[`data/questions.json`](data/questions.json) を編集するだけで問題を追加・変更できます。

```json
{
  "id": "cli-01",
  "category": "cli",
  "type": "choice",
  "question": "問題文",
  "choices": ["A", "B", "C", "D"],
  "answer": 0,
  "explanation": "解説文"
}
```

記述式の場合:

```json
{
  "type": "text",
  "answer": ["正解1", "別解"],
  "explanation": "解説文"
}
```

`categories` の `count` も問題数に合わせて更新してください。

## 将来の拡張（AI サマリー）

v1 ではカテゴリ正答率に基づくルールベースの苦手分野分析です。AI による自然言語アドバイスを追加する場合:

- API キーをクライアントに置けないため、Netlify Functions や小さなバックエンドが必要
- 結果 JSON（正答率・間違えた問題 ID）をサーバーに送り、学習アドバイスを返す構成が現実的

## ファイル構成

```
basic-quiz/
├── index.html
├── css/style.css
├── js/
│   ├── app.js       # 画面遷移・イベント
│   ├── quiz.js      # 問題表示・採点
│   └── summary.js   # サマリー生成
├── data/questions.json
├── start.sh           # ローカルLAN配信用
├── .github/workflows/pages.yml
└── README.md
```

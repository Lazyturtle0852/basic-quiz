#!/bin/bash
set -e
cd "$(dirname "$0")"

REPO="Lazyturtle0852/lit-basic-quiz"
URL="https://lazyturtle0852.github.io/lit-basic-quiz/"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI にログインしてください:"
  echo "  gh auth login"
  exit 1
fi

REMOTE_URL="https://github.com/${REPO}.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "リポジトリは存在します。push します..."
  git push -u origin main
else
  echo "リポジトリを作成します..."
  gh repo create lit-basic-quiz --public
  git push -u origin main
fi

echo "GitHub Pages を有効化..."
gh api "repos/${REPO}/pages" -X POST -f build_type=workflow 2>/dev/null || \
  gh api "repos/${REPO}/pages" -X PUT -f build_type=workflow 2>/dev/null || \
  echo "（Pages は Settings → Pages → GitHub Actions で有効化）"

echo ""
echo "=========================================="
echo "  デプロイ完了（Actions 完了まで1〜3分）"
echo "  ${URL}"
echo "=========================================="
echo ""
echo "  状態確認: gh run list --repo ${REPO}"
echo ""

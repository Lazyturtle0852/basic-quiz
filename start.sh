#!/bin/bash
# basic-quiz フォルダで実行 → 短い URL で LAN 共有
cd "$(dirname "$0")"

PORT=8080
IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$IP" ]; then
  IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

echo ""
echo "=========================================="
echo "  LiT Basic クイズ サーバー"
echo "=========================================="
echo ""
echo "  自分のPC:  http://localhost:${PORT}/"
if [ -n "$IP" ]; then
  echo "  他の人:    http://${IP}:${PORT}/"
  echo ""
  echo "  ↑ この URL を受講生に共有（短いURL）"
else
  echo "  他の人:    IP取得失敗 → ipconfig getifaddr en0 で確認"
fi
echo ""
echo "  止める: Ctrl+C"
echo ""
echo "  ※ 他の人から繋がらない場合:"
echo "    1. システム設定 → ネットワーク → ファイアウォール → Python を許可"
echo "    2. 全員が同じ Wi-Fi か確認（ゲストWi-Fiは不可のことが多い）"
echo "    3. 教室Wi-Fiは端末間通信が禁止されている場合あり"
echo "       → メンターのスマホテザリングで全員接続が確実"
echo ""
echo "=========================================="
echo ""

python3 -m http.server "$PORT" --bind 0.0.0.0

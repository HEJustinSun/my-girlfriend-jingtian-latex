#!/bin/sh
# 孙哥桥 一键安装脚本
#   curl -fsSL <站点>/install.sh | sh            # 安装
#   curl -fsSL <站点>/install.sh | sh -s -- --run # 安装并立刻启动
# 脚本只做三件事：下载单文件 bridge.mjs 到 ~/.sunge、生成 sunge 启动命令、提示如何运行。
# 全部逻辑包在 main() 里：curl|sh 场景下即使传输被截断也不会执行半截脚本。
set -eu

SITE="__SITE_ORIGIN__"

say() { printf '%s\n' "$*"; }

main() {
  DIR="$HOME/.sunge"
  BIN_DIR="$DIR/bin"

  case "$SITE" in
    __*) say "错误：安装脚本需要从站点在线获取（站点会注入下载地址），不要直接从仓库运行。"; exit 1 ;;
  esac

  command -v curl >/dev/null 2>&1 || { say "错误：需要 curl。"; exit 1; }

  # 1) 运行时：优先 node (>=18)，退而求其次 bun
  RUNTIME=""
  if command -v node >/dev/null 2>&1; then
    MAJOR=$(node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)
    [ "$MAJOR" -ge 18 ] && RUNTIME="node"
  fi
  if [ -z "$RUNTIME" ] && command -v bun >/dev/null 2>&1; then
    RUNTIME="bun"
  fi
  if [ -z "$RUNTIME" ]; then
    say "未找到 Node.js (>=18) 或 Bun。请先安装 Node.js：https://nodejs.org/"
    exit 1
  fi

  # 2) 下载单文件桥（tmp + mv 原子替换）
  mkdir -p "$BIN_DIR"
  say "· 正在下载孙哥桥 → $DIR/bridge.mjs"
  curl -fsSL "$SITE/bridge.mjs" -o "$DIR/bridge.mjs.tmp"
  mv "$DIR/bridge.mjs.tmp" "$DIR/bridge.mjs"

  # 3) 生成启动命令
  cat > "$BIN_DIR/sunge" <<EOF
#!/bin/sh
exec $RUNTIME "\$HOME/.sunge/bridge.mjs" "\$@"
EOF
  chmod +x "$BIN_DIR/sunge"

  LAUNCH="$BIN_DIR/sunge"
  # 尽量放进 PATH（不动系统目录）：~/.local/bin 存在且可写时做个软链
  if [ -d "$HOME/.local/bin" ] && [ -w "$HOME/.local/bin" ]; then
    ln -sf "$BIN_DIR/sunge" "$HOME/.local/bin/sunge"
    case ":$PATH:" in *":$HOME/.local/bin:"*) LAUNCH="sunge" ;; esac
  fi

  VERSION=$($RUNTIME "$DIR/bridge.mjs" --version 2>/dev/null || echo '?')
  say ""
  say "✅ 孙哥桥 v$VERSION 安装完成（运行时：$RUNTIME）"
  say ""
  say "启动命令：  $LAUNCH"
  say "启动后回到网页即可开聊：$SITE"
  say "（Safari 用户启动后请直接打开 http://127.0.0.1:35827）"

  # 4) 可选：立即启动
  if [ "${1:-}" = "--run" ]; then
    say ""
    say "· 正在启动孙哥桥…（Ctrl+C 退出）"
    exec "$BIN_DIR/sunge" --site "$SITE"
  fi
}

main "$@"

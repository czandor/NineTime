#!/usr/bin/env bash
set -euo pipefail
platform="${1:-basalt}"
case "$platform" in aplite|basalt|chalk|diorite) ;; *) echo 'Unsupported platform.' >&2; exit 1 ;; esac
export PATH="/opt/ninetime-cli/bin:$HOME/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
command -v pebble >/dev/null || { echo 'Install pebble-tool and a Pebble SDK first.' >&2; exit 1; }
cd "$(dirname "$0")/../watchface"
if [ ! -f src/pkjs/site-config.json ]; then
    echo 'Run node tools/configure-watchface.cjs from the repository root first.' >&2
    exit 1
fi
mkdir -p /tmp/ninetime-emulator
if [ -n "${WAYLAND_DISPLAY:-}" ] || [ -S /tmp/.X11-unix/X0 ]; then
    pebble build
    pebble install --emulator "$platform"
    exit
fi
export DISPLAY=:99
if ! pgrep -f '^Xvfb :99 ' >/dev/null; then
    Xvfb "$DISPLAY" -screen 0 800x600x24 -nolisten tcp >/tmp/ninetime-emulator/display.log 2>&1 &
    for _ in {1..50}; do [ -S /tmp/.X11-unix/X99 ] && break; sleep 0.1; done
fi
if ! pgrep -f '^x11vnc .*rfbport 5901' >/dev/null; then
    x11vnc -display "$DISPLAY" -localhost -rfbport 5901 -nopw -forever -shared -bg -o /tmp/ninetime-emulator/vnc.log
fi
if ! pgrep -f 'websockify.*127.0.0.1:6080' >/dev/null; then
    websockify --web=/usr/share/novnc --daemon 127.0.0.1:6080 localhost:5901
fi
pebble build
pebble install --emulator "$platform"
echo 'Emulator display: http://127.0.0.1:6080/vnc.html?autoconnect=true&resize=scale'

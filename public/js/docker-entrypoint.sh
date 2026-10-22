#!/bin/sh
# Make the data folder (database, uploaded photos) writable, then run the site as the unprivileged "node" user.
set -e
DATA="${DATA_DIR:-/data}"
mkdir -p "$DATA"
if [ "$(id -u)" = "0" ]; then
  chown -R node:node "$DATA" 2>/dev/null || true
  exec setpriv --reuid=node --regid=node --init-groups "$@"
fi
exec "$@"

#!/usr/bin/env bash

source "$(dirname "$0")/utils.sh"

check_commit_template

npx --no-install commitlint --edit "$1" || {
  log_error "Commit message format error. Please refer to the guidelines in your browser."
  open_in_browser "$COMMIT_TEMPLATE_FILE"
  exit 1
}

exit 0

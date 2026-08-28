#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_directory="${1:-dist}"

while IFS= read -r edition; do
  [[ -z "$edition" || "$edition" == \#* ]] && continue
  "$project_root/scripts/build-edition.sh" "$edition" "$output_directory"
done < "$project_root/editions/locales.txt"

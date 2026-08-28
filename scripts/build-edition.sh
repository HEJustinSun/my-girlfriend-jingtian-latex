#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <locale> [output-directory]" >&2
  exit 64
fi

edition="$1"
output_directory="${2:-dist}"
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_file="$project_root/editions/$edition.tex"
build_directory="$project_root/build/editions/$edition"

if ! grep -Fxq -- "$edition" "$project_root/editions/locales.txt"; then
  echo "Unknown edition: $edition" >&2
  exit 64
fi

if [[ ! -f "$source_file" ]]; then
  echo "Missing edition source: $source_file" >&2
  exit 66
fi

mkdir -p "$build_directory" "$project_root/$output_directory"

# Pin PDF timestamps and identifiers to the source-edition commit for repeatable output.
export SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-1787833425}"
export FORCE_SOURCE_DATE="${FORCE_SOURCE_DATE:-1}"

if [[ -n "${TECTONIC:-}" ]]; then
  tectonic_command="$TECTONIC"
elif command -v tectonic >/dev/null 2>&1; then
  tectonic_command="$(command -v tectonic)"
else
  echo "Tectonic is required. Set TECTONIC or add tectonic to PATH." >&2
  exit 69
fi

(
  cd "$project_root"
  "$tectonic_command" -X compile \
    --keep-logs \
    --keep-intermediates \
    --outdir "$build_directory" \
    "$source_file" 2>&1 | tee "$build_directory/$edition.build.log"
)

install -m 0644 \
  "$build_directory/$edition.pdf" \
  "$project_root/$output_directory/my-girlfriend-jing-tian-$edition.pdf"

echo "Built $output_directory/my-girlfriend-jing-tian-$edition.pdf"

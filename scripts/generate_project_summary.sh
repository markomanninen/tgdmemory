#!/bin/bash

# scripts/generate-project-summary.sh (FINAL REVISED VERSION)
# Generates project structure summary, concatenates files, calculates stats.

# --- Configuration ---
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT="$SCRIPT_DIR/.."
OUTPUT_DIR="$PROJECT_ROOT/docs/project_summary"
TREE_FILE="$OUTPUT_DIR/project_structure.txt"
CONCAT_FILE="$OUTPUT_DIR/all_code.txt"
STATS_FILE="$OUTPUT_DIR/project_stats.txt"

# Extensions for file matching
# --- Add py ---
CODE_EXTENSIONS="js|jsx|ts|tsx|css|html|py"
# ------------
CONFIG_EXTENSIONS="json|yaml|yml|conf|env.example|dockerfile|dockerignore|gitignore|npmrc|prettierrc"
DOC_EXTENSIONS="md|txt"

# Directories to exclude
# --- Add Python specific dirs ---
EXCLUDE_DIRS="node_modules|.git|.yarn|.venv|dist|build|coverage|.DS_Store|.idea|.vscode|project_summary|assets|venv|__pycache__|.pytest_cache"
# ------------------------------

# Files to exclude (these will be exact file names to exclude)
EXCLUDE_FILES="package-lock.json|.env|\\.gitignore"

# ANSI Color Codes & Functions
COLOR_RESET='\033[0m'; COLOR_GREEN='\033[0;32m'; COLOR_YELLOW='\033[0;33m'; COLOR_BLUE='\033[0;34m'; COLOR_RED='\033[0;31m';
info() { echo -e "${COLOR_BLUE}INFO: $1${COLOR_RESET}"; }
warn() { echo -e "${COLOR_YELLOW}WARN: $1${COLOR_RESET}"; }
error() { echo -e "${COLOR_RED}ERROR: $1${COLOR_RESET}"; }
success() { echo -e "${COLOR_GREEN}SUCCESS: $1${COLOR_RESET}"; }

# --- Start Script ---
info "Starting Project Summary Generation..."
info "Output directory: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR" || { error "Failed to create output directory '$OUTPUT_DIR'"; exit 1; }
initial_pwd=$(pwd)
cd "$PROJECT_ROOT" || { error "Failed to change directory to project root '$PROJECT_ROOT'"; exit 1; }
info "Changed directory to project root: $(pwd)"

# --- Function to find relevant files (FINAL VERSION) ---
find_relevant_files() {
    local output_file=$1

    info "Finding files using simplified approach with additional exclusions..."

    # Find all files, then filter with grep
    # First exclude directories
    find . -type f | grep -v -E "/(${EXCLUDE_DIRS})/" |
    # Then exclude specific files by name
    grep -v -E "/(${EXCLUDE_FILES})$" |
    # Exclude common test file patterns (optional, adjust as needed)
    #grep -v -E "/test_.*\.py$|_test\.py$" |
    # Finally, include only files with our target extensions, plus .env.example which we want to keep
    # --- Update grep pattern to include py ---
    grep -E '\.(js|jsx|ts|tsx|py|json|yaml|yml|conf|env\.example|md|txt)$|Dockerfile|\.dockerignore|\.npmrc|\.prettierrc|html|css' > "$output_file"
    # -----------------------------------------

    # Check if the command succeeded
    if [ $? -eq 0 ]; then
        # Check if any files were found
        if [ ! -s "$output_file" ]; then
            warn "No matching files found after exclusion."
        fi
        return 0 # Success
    else
        error "File search failed."
        return 1 # Failure
    fi
}
# --- End find_relevant_files function ---

# --- Generate File Tree ---
info "Generating file tree with line counts ($TREE_FILE)..."
{ echo "Project Structure and Line Counts"; echo "================================="; echo "Generated on: $(date)"; echo ""; } > "$TREE_FILE"

# Use 'tree' if available, fallback to basic find list for structure
if command -v tree &> /dev/null; then
    info "Using 'tree' command for structure..."
    tree -a -I "$EXCLUDE_DIRS" --prune --matchdirs --noreport >> "$TREE_FILE" \
    || { warn "'tree' command failed, using basic 'find' list."; find . -maxdepth 1 -print >> "$TREE_FILE"; } # Simple fallback
else
    warn "'tree' command not found. Using basic 'find' list for structure."
    find . -maxdepth 1 -print >> "$TREE_FILE" # Just list top-level items
fi

echo "" >> "$TREE_FILE"; echo "Line Counts (Code + Config + Docs):"; echo "-----------------------------------" >> "$TREE_FILE";

# --- Calculate Line Counts ---
info "Calculating line counts..."
TMP_FILE_LIST_WC=$(mktemp "${OUTPUT_DIR}/tmp_wc_list.XXXXXX")
if ! find_relevant_files "$TMP_FILE_LIST_WC"; then error "Could not generate file list for line counts."; exit 1; fi

# Process file list if it's not empty
if [ -s "$TMP_FILE_LIST_WC" ]; then
    if ! cat "$TMP_FILE_LIST_WC" | xargs wc -l 2>/dev/null | grep -v ' total$' > "$TMP_FILE_LIST_WC.counts"; then warn "wc -l failed for some files."; fi
    if [ -s "$TMP_FILE_LIST_WC.counts" ]; then
        awk '{ printf "%6d %s\n", $1, $2 }' "$TMP_FILE_LIST_WC.counts" >> "$TREE_FILE"
        TOTAL_LINES=$(awk '{sum+=$1} END {print int(sum)}' "$TMP_FILE_LIST_WC.counts")
        TOTAL_FILES=$(wc -l < "$TMP_FILE_LIST_WC.counts" | awk '{print $1}')
        rm "$TMP_FILE_LIST_WC.counts"
    else TOTAL_LINES=0; TOTAL_FILES=0; echo "   (No relevant files found or wc failed)" >> "$TREE_FILE"; fi
else TOTAL_LINES=0; TOTAL_FILES=0; echo "   (No relevant files found for line count)" >> "$TREE_FILE"; fi
rm "$TMP_FILE_LIST_WC"

# Append totals to TREE_FILE
{ echo "-----------------------------------"; echo "Total Files Found: $TOTAL_FILES"; echo "Total Lines Found: $TOTAL_LINES"; } >> "$TREE_FILE"
success "File tree and line counts generated."

# --- Concatenate File Contents ---
info "Generating concatenated file ($CONCAT_FILE)..."
> "$CONCAT_FILE"
TMP_FILE_LIST_CAT=$(mktemp "${OUTPUT_DIR}/tmp_cat_list.XXXXXX")
if ! find_relevant_files "$TMP_FILE_LIST_CAT"; then error "Could not generate file list for concatenation."; exit 1; fi

if [ -s "$TMP_FILE_LIST_CAT" ]; then
    file_count_cat=0
    while IFS= read -r file; do
        if [ -r "$file" ]; then
            filename=$(basename "$file")
            extension="${filename##*.}"
            extension_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')

            # Determine comment style
            case "$filename" in
                Dockerfile)
                    comment_start="#"
                    comment_end=""
                    ;;
                *.js|*.jsx|*.ts|*.tsx|*.css)
                    comment_start="//"
                    comment_end=""
                    ;;
                *.html)
                    comment_start="<!--"
                    comment_end="-->"
                    ;;
                *.yaml|*.yml|*.conf|*.env|*.md|*.txt|.dockerignore|.gitignore|.npmrc|.prettierrc)
                    comment_start="#"
                    comment_end=""
                    ;;
                *.py)
                    comment_start="#"
                    comment_end=""
                    ;;
                *.json)
                    comment_start="//"  # Disable comment for JSON files
                    comment_end=""
                    ;;
                *)
                    comment_start="#"  # fallback
                    comment_end=""
                    ;;
            esac

            {
                #echo "################################################################################"
                if [ -n "$comment_start" ]; then
                    if [ -n "$comment_end" ]; then
                        echo "$comment_start FILE: $file $comment_end"
                    else
                        echo "$comment_start FILE: $file"
                    fi
                fi
                #echo "################################################################################"
                echo ""
                cat "$file"
                echo ""
            } >> "$CONCAT_FILE"

            file_count_cat=$((file_count_cat + 1))
        else
            warn "Skipping unreadable file: $file"
        fi
    done < "$TMP_FILE_LIST_CAT"
    info "Appended $file_count_cat files."
else echo "WARN: No files found to concatenate." >> "$CONCAT_FILE"; fi
rm "$TMP_FILE_LIST_CAT"
success "Concatenated file generated."

# --- Generate Stats File ---
info "Generating stats file ($STATS_FILE)..."
{ echo "Project Statistics"; echo "=================="; echo "Generated on: $(date)"; echo ""; echo "Total Relevant Files Count: $TOTAL_FILES"; echo "Total Lines of Code (Code+Config+Docs): $TOTAL_LINES"; echo ""; echo "Line Counts per Extension:"; echo "--------------------------"; } > "$STATS_FILE"

TMP_FILE_LIST_STATS=$(mktemp "${OUTPUT_DIR}/tmp_stats_list.XXXXXX")
if ! find_relevant_files "$TMP_FILE_LIST_STATS"; then error "Could not generate file list for statistics."; exit 1; fi

if [ -s "$TMP_FILE_LIST_STATS" ]; then
     if ! cat "$TMP_FILE_LIST_STATS" | xargs wc -l 2>/dev/null | grep -v ' total$' > "$TMP_FILE_LIST_STATS.counts"; then warn "wc -l failed during stats calculation."; fi
     if [ -s "$TMP_FILE_LIST_STATS.counts" ]; then
          # Use awk to process the line counts and filenames - FIXED VERSION
          awk '
          function get_ext(filename) {
              # Handle special files
              sub(".*/", "", filename);
              if (filename == "Dockerfile") return "dockerfile";
              if (filename == ".dockerignore") return "dockerignore";
              if (filename == ".gitignore") return "gitignore";
              if (filename == ".npmrc") return "npmrc";
              if (filename == ".prettierrc") return "prettierrc";

              # Extract extension using simpler string manipulation
              ext = filename
              pos = match(ext, "\\.[^.]*$")
              if (pos > 0) {
                  ext = substr(ext, pos+1)
                  return tolower(ext)
              }
              return "no_extension"
          }
          {
              current_ext = get_ext($2);
              lines[current_ext] += $1;
              counts[current_ext]++;
          }
          END {
              # --- Sort extensions alphabetically for consistent output ---
              PROCINFO["sorted_in"] = "@ind_str_asc"
              # ---------------------------------------------------------
              for (ext in counts) {
                  printf ".%-10s : %5d files, %7d lines\n", ext, counts[ext], lines[ext];
              }
          }' "$TMP_FILE_LIST_STATS.counts" >> "$STATS_FILE"
          rm "$TMP_FILE_LIST_STATS.counts"
     else echo "(No relevant files found or wc failed for stats)" >> "$STATS_FILE"; fi
else echo "(No relevant files found for stats)" >> "$STATS_FILE"; fi
rm "$TMP_FILE_LIST_STATS"

success "Stats file generated."

# --- Finish ---
info "-----------------------------------------------------"
success "Project summary generation complete!"
info "Output files:"
info "  Structure & Counts: $TREE_FILE"
info "  Concatenated Code:  $CONCAT_FILE"
info "  Statistics:         $STATS_FILE"
info "-----------------------------------------------------"

# Change back to original directory
cd "$initial_pwd" || exit 1

exit 0
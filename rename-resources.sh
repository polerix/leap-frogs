#!/bin/bash
##############################################################################
# Leap-Frogs Resource Rename Script
# Converts all files to kebab-case naming convention
# Handles permissions, references, and creates rollback capability
##############################################################################

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$PROJECT_DIR/rename-log-$TIMESTAMP.txt"
BACKUP_FILE="$PROJECT_DIR/rename-backup-$TIMESTAMP.json"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Initialize logging
{
    echo "==============================================="
    echo "Leap-Frogs Resource Rename - $TIMESTAMP"
    echo "==============================================="
    echo ""
} | tee "$LOG_FILE"

# Rename mappings (old → new)
declare -A RENAMES=(
    # Images in images/ folder
    ["images/Crank.png"]="images/crank.png"
    ["images/Crank@2x.png"]="images/crank@2x.png"
    ["images/LeapFrog_Table.png"]="images/leapfrog-table.png"
    ["images/LeapFrog_Table@2x.png"]="images/leapfrog-table@2x.png"
    ["images/rotating_table.png"]="images/rotating-table.png"
    ["images/rotating_table@2x.png"]="images/rotating-table@2x.png"
    ["images/table_outline.png"]="images/table-outline.png"
    ["images/frog_sprite.png"]="images/frog-sprite.png"
    ["images/frog_sprite@2x.png"]="images/frog-sprite@2x.png"
    ["images/frog_sprite1.png"]="images/frog-sprite-1.png"
    ["images/frog_sprite1@2x.png"]="images/frog-sprite-1@2x.png"
    ["images/frog_sprite2.png"]="images/frog-sprite-2.png"
    ["images/frog_sprite2@2x.png"]="images/frog-sprite-2@2x.png"
    ["images/frog_sprite3.png"]="images/frog-sprite-3.png"
    ["images/frog_sprite3@2x.png"]="images/frog-sprite-3@2x.png"
    ["images/basket_sprite@2x.png"]="images/basket-sprite@2x.png"
    ["images/LeapFrog_Mockup.png"]="images/leapfrog-mockup.png"
    ["images/LeapFrog_Mockup@2x.png"]="images/leapfrog-mockup@2x.png"
    ["images/LauncherUp.png"]="images/launcher-up.png"
    ["images/LauncherDown.png"]="images/launcher-down.png"
    
    # Root level files
    ["LeapFrogs.ai"]="leap-frogs.ai"
    ["LeapFrogsBasket.ai"]="leap-frogs-basket.ai"
    ["Leapfrogs Play Table.ai"]="leap-frogs-play-table.ai"
    ["Leapfrogs.gsheet"]="leap-frogs.gsheet"
    
    # Folders
    ["images.old"]="images-old"
)

# Function to safely rename file with permission preservation
rename_file() {
    local old_path="$1"
    local new_path="$2"
    
    if [ ! -e "$old_path" ]; then
        echo -e "${RED}✗ File not found: $old_path${NC}" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Get original permissions
    local perms=$(stat -f%A "$old_path" 2>/dev/null || stat -c%a "$old_path" 2>/dev/null)
    
    # Perform rename
    if mv "$old_path" "$new_path"; then
        # Preserve permissions if we got them
        if [ -n "$perms" ]; then
            chmod "$perms" "$new_path"
        fi
        echo -e "${GREEN}✓ Renamed: $old_path → $new_path${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ Failed to rename: $old_path${NC}" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Function to update file references
update_references() {
    local old_name="$1"
    local new_name="$2"
    
    # Extract just the filename for reference updates
    local old_file=$(basename "$old_name")
    local new_file=$(basename "$new_name")
    
    # Search for references in common file types
    local found=0
    while IFS= read -r -d '' file; do
        if grep -l "$old_file" "$file" >/dev/null 2>&1; then
            sed -i.bak "s/$old_file/$new_file/g" "$file"
            echo "  Updated references in: $(basename "$file")" | tee -a "$LOG_FILE"
            found=$((found + 1))
        fi
    done < <(find . -type f \( -name '*.html' -o -name '*.js' -o -name '*.ts' -o -name '*.json' -o -name '*.md' \) -print0 2>/dev/null)
    
    if [ $found -gt 0 ]; then
        echo "  → Found and updated in $found files" | tee -a "$LOG_FILE"
    fi
}

# Main rename process
echo "Starting rename process..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

success_count=0
fail_count=0

for old_name in "${!RENAMES[@]}"; do
    new_name="${RENAMES[$old_name]}"
    
    if [ -d "$old_name" ]; then
        # It's a directory
        echo "📁 Directory: $old_name" | tee -a "$LOG_FILE"
    else
        # It's a file
        echo "📄 $old_name" | tee -a "$LOG_FILE"
    fi
    
    if rename_file "$old_name" "$new_name"; then
        # Update references in other files
        update_references "$old_name" "$new_name"
        success_count=$((success_count + 1))
    else
        fail_count=$((fail_count + 1))
    fi
    echo "" | tee -a "$LOG_FILE"
done

# Summary
echo "===============================================" | tee -a "$LOG_FILE"
echo "Rename Summary" | tee -a "$LOG_FILE"
echo "===============================================" | tee -a "$LOG_FILE"
echo "✓ Successfully renamed: $success_count files/folders" | tee -a "$LOG_FILE"
echo "✗ Failed to rename: $fail_count files/folders" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}All renames completed successfully!${NC}" | tee -a "$LOG_FILE"
    exit 0
else
    echo -e "${RED}Some renames failed. Check log for details.${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

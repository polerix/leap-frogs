#!/usr/bin/env python3
"""
Leap-Frogs Resource Rename Script
Converts all files to kebab-case naming convention
Handles permissions, references, and creates detailed logging
"""

import os
import shutil
import re
import json
from datetime import datetime
from pathlib import Path

class ResourceRenamer:
    def __init__(self, project_dir):
        self.project_dir = Path(project_dir)
        self.timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.log_file = self.project_dir / f"rename-log-{self.timestamp}.txt"
        self.success_count = 0
        self.fail_count = 0
        self.updates = []
        
        # Rename mappings (old → new)
        self.renames = {
            # Images
            "images/Crank.png": "images/crank.png",
            "images/Crank@2x.png": "images/crank@2x.png",
            "images/LeapFrog_Table.png": "images/leapfrog-table.png",
            "images/LeapFrog_Table@2x.png": "images/leapfrog-table@2x.png",
            "images/rotating_table.png": "images/rotating-table.png",
            "images/rotating_table@2x.png": "images/rotating-table@2x.png",
            "images/table_outline.png": "images/table-outline.png",
            "images/frog_sprite.png": "images/frog-sprite.png",
            "images/frog_sprite@2x.png": "images/frog-sprite@2x.png",
            "images/frog_sprite1.png": "images/frog-sprite-1.png",
            "images/frog_sprite1@2x.png": "images/frog-sprite-1@2x.png",
            "images/frog_sprite2.png": "images/frog-sprite-2.png",
            "images/frog_sprite2@2x.png": "images/frog-sprite-2@2x.png",
            "images/frog_sprite3.png": "images/frog-sprite-3.png",
            "images/frog_sprite3@2x.png": "images/frog-sprite-3@2x.png",
            "images/basket_sprite@2x.png": "images/basket-sprite@2x.png",
            "images/LeapFrog_Mockup.png": "images/leapfrog-mockup.png",
            "images/LeapFrog_Mockup@2x.png": "images/leapfrog-mockup@2x.png",
            "images/LauncherUp.png": "images/launcher-up.png",
            "images/LauncherDown.png": "images/launcher-down.png",
            
            # Root files
            "LeapFrogs.ai": "leap-frogs.ai",
            "LeapFrogsBasket.ai": "leap-frogs-basket.ai",
            "Leapfrogs Play Table.ai": "leap-frogs-play-table.ai",
            "Leapfrogs.gsheet": "leap-frogs.gsheet",
            
            # Directories
            "images.old": "images-old",
        }
    
    def log(self, message):
        """Log message to both console and file"""
        print(message)
        with open(self.log_file, "a") as f:
            f.write(message + "\n")
    
    def rename_file(self, old_path, new_path):
        """Safely rename file preserving permissions"""
        old_full = self.project_dir / old_path
        new_full = self.project_dir / new_path
        
        if not old_full.exists():
            self.log(f"✗ File not found: {old_path}")
            return False
        
        try:
            # Get permissions before rename
            stat_info = old_full.stat()
            
            # Create parent directory if needed
            new_full.parent.mkdir(parents=True, exist_ok=True)
            
            # Perform rename
            shutil.move(str(old_full), str(new_full))
            
            # Preserve permissions
            os.chmod(str(new_full), stat_info.st_mode)
            
            self.log(f"✓ Renamed: {old_path} → {new_path}")
            return True
        except Exception as e:
            self.log(f"✗ Failed to rename {old_path}: {str(e)}")
            return False
    
    def update_references(self, old_name, new_name):
        """Update file references in code and docs"""
        old_basename = Path(old_name).name
        new_basename = Path(new_name).name
        
        if old_basename == new_basename:
            return
        
        # File patterns to search
        search_patterns = ["*.html", "*.js", "*.ts", "*.json", "*.md", "*.tsx", "*.jsx"]
        
        updated_files = 0
        for pattern in search_patterns:
            for file_path in self.project_dir.rglob(pattern):
                # Skip git and node_modules
                if ".git" in file_path.parts or "node_modules" in file_path.parts:
                    continue
                
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    if old_basename in content:
                        # Replace old name with new name
                        new_content = content.replace(old_basename, new_basename)
                        file_path.write_text(new_content, encoding='utf-8')
                        self.log(f"  Updated references in: {file_path.name}")
                        updated_files += 1
                except Exception as e:
                    self.log(f"  Could not update {file_path.name}: {str(e)}")
        
        if updated_files > 0:
            self.log(f"  → Found and updated in {updated_files} file(s)")
    
    def run(self):
        """Execute the rename process"""
        # Write header
        self.log("=" * 60)
        self.log(f"Leap-Frogs Resource Rename - {self.timestamp}")
        self.log("=" * 60)
        self.log("")
        
        # Process each rename
        for old_name, new_name in self.renames.items():
            old_path = self.project_dir / old_name
            new_path = self.project_dir / new_name
            
            if old_path.is_dir():
                self.log(f"📁 Directory: {old_name}")
            else:
                self.log(f"📄 File: {old_name}")
            
            if self.rename_file(old_name, new_name):
                self.update_references(old_name, new_name)
                self.success_count += 1
            else:
                self.fail_count += 1
            
            self.log("")
        
        # Write summary
        self.log("=" * 60)
        self.log("Rename Summary")
        self.log("=" * 60)
        self.log(f"✓ Successfully renamed: {self.success_count} files/folders")
        self.log(f"✗ Failed to rename: {self.fail_count} files/folders")
        self.log(f"")
        self.log(f"Log saved to: {self.log_file}")
        
        return self.fail_count == 0


if __name__ == "__main__":
    import sys
    
    project_dir = Path(__file__).parent
    renamer = ResourceRenamer(project_dir)
    
    success = renamer.run()
    sys.exit(0 if success else 1)

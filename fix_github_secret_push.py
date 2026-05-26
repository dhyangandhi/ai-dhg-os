import os
import subprocess
from pathlib import Path

# =========================
# CONFIG
# =========================

FILE_PATH = "backends/main.py"

# Replace this with the exact secret or unique part of it
SECRET_TEXT = "___"

# =========================
# HELPERS
# =========================

def run(cmd):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        raise SystemExit(f"\nCommand failed: {cmd}")

# =========================
# STEP 1: REMOVE SECRET
# =========================

path = Path(FILE_PATH)

if not path.exists():
    raise SystemExit(f"File not found: {FILE_PATH}")

content = path.read_text(encoding="utf-8")

if SECRET_TEXT in content:
    content = content.replace(SECRET_TEXT, "REMOVED_SECRET_")
    path.write_text(content, encoding="utf-8")
    print("Secret removed from file.")
else:
    print("Secret text not found in file.")

# =========================
# STEP 2: REMOVE FROM GIT HISTORY
# =========================

run(f'git filter-branch --force --tree-filter '
    f'"sed -i \'s/{SECRET_TEXT}/REMOVED_SECRET_/g\' {FILE_PATH} || true" '
    f'-- --all')

# =========================
# STEP 3: CLEANUP
# =========================

run("rm -rf .git/refs/original/")
run("git reflog expire --expire=now --all")
run("git gc --prune=now --aggressive")

print("\nDONE.")
print("\nNow manually run:")
print("git status")
print("git add .")
print('git commit -m "remove leaked secret"')
print("git push -u origin main --force")
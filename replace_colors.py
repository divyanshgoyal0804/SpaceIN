import os
import re

src_dir = "/Users/divyanshgoyal/aggregator/src"
globals_css = "/Users/divyanshgoyal/aggregator/src/app/globals.css"

# Replacements for typical hardcoded colors to CSS vars
replacements = {
    "#f59e0b": "var(--accent)",
    "rgba(245, 158, 11,": "rgba(var(--accent-rgb),",
    "rgba(163, 145, 113,": "rgba(var(--accent-rgb),",
    "#d97706": "var(--accent-hover)",
}

def process_file(path):
    with open(path, "r") as f:
        content = f.read()
    
    # We will manually handle globals.css later in this script
    if path == globals_css:
        return
        
    orig = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Specifically for React SVG fill attributes which don't allow var() if they are not in style?
    # Actually `fill="var(--accent)"` works perfectly in SVG inline in HTML/React.
    
    if orig != content:
        with open(path, "w") as f:
            f.write(content)
        print(f"Updated {path}")

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith((".tsx", ".ts", ".css")):
            process_file(os.path.join(root, f))

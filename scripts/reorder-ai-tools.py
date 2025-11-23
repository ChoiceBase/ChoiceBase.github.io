#!/usr/bin/env python3
"""
Reorder AI tools by popularity
Run: python scripts/reorder-ai-tools.py
"""

import json
import os

# Get the file path
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, '..', 'data', 'ai-tools.json')

# Read the JSON file
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add default popularity score of 50 for entries without it
for item in data:
    if 'popularity' not in item:
        item['popularity'] = 50

# Sort by popularity (descending), then by id
data.sort(key=lambda x: (-x.get('popularity', 50), int(x.get('id', 0))))

# Write back to file
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f"✅ Reordered {len(data)} AI tools by popularity")
print(f"Top 10:")
for i, tool in enumerate(data[:10], 1):
    print(f"  {i}. {tool['title']} (popularity: {tool.get('popularity', 50)})")



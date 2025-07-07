import json
import os
import glob
from collections import OrderedDict

INPUT_FOLDER = './json'
OUTPUT_FOLDER = './data'

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def clean_resources(resources):
    seen = set()
    cleaned = []
    for idx, item in enumerate(resources, start=1):
        title = item.get('title', '').strip() if item.get('title') else ''
        url = item.get('link') or item.get('url') or ''
        description = item.get('description', '').strip() if item.get('description') else ''
        tags = list(OrderedDict.fromkeys(item.get('tags', [])))

        if title and url:
            key = (title.lower(), url.lower())
            if key not in seen:
                seen.add(key)
                cleaned.append({
                    'id': str(idx),
                    'title': title,
                    'url': url,
                    'description': description,
                    'tags': tags
                })
    return cleaned

def process_all_files():
    files = glob.glob(os.path.join(INPUT_FOLDER, '*.json'))
    for file in files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = json.load(f)

            # If it's a dict with numbered keys → extract values
            if isinstance(content, dict):
                content = list(content.values())

            # If it's nested under 'resources'
            if isinstance(content, dict) and 'resources' in content:
                resources = content['resources']
            elif isinstance(content, list):
                resources = content
            else:
                resources = []

            cleaned = clean_resources(resources)

            output_filename = os.path.basename(file)
            output_path = os.path.join(OUTPUT_FOLDER, output_filename)

            with open(output_path, 'w', encoding='utf-8') as out_f:
                json.dump(cleaned, out_f, ensure_ascii=False, indent=2)

            print(f"✅ Saved cleaned file: {output_path}")

        except Exception as e:
            print(f"❌ Error processing {file}: {e}")

if __name__ == '__main__':
    process_all_files()

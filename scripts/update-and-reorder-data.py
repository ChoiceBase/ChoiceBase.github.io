#!/usr/bin/env python3
"""
Update IDs and reorder data files by popularity (users, free access, power)
Run: python scripts/update-and-reorder-data.py
"""

import json
import os
import re

def calculate_popularity(item, category_name):
    """Calculate popularity score based on multiple factors"""
    score = 50  # Base score
    
    tags = [t.lower() for t in item.get('tags', [])]
    title_lower = item.get('title', '').lower()
    desc_lower = item.get('description', '').lower()
    
    # Free access boost (high priority)
    if 'free' in tags:
        score += 20
    if 'open-source' in tags:
        score += 15
    
    # User count indicators (based on known popularity)
    if category_name == 'ai-tools':
        # Top tools by user count
        top_tools = {
            'chatgpt': 100, 'claude': 95, 'gemini': 94, 'bard': 94,
            'midjourney': 98, 'dall-e': 97, 'stable diffusion': 92,
            'github copilot': 96, 'hugging face': 91, 'perplexity': 79,
            'character.ai': 87, 'cursor': 86, 'notion ai': 88,
            'elevenlabs': 89, 'runway': 90, 'leonardo': 84
        }
        for tool_name, tool_score in top_tools.items():
            if tool_name in title_lower:
                score = max(score, tool_score)
                break
    
    elif category_name == 'jobs':
        # Popular job platforms
        popular_jobs = {
            'linkedin': 95, 'indeed': 94, 'glassdoor': 93, 'monster': 90,
            'ziprecruiter': 89, 'dice': 88, 'angel.co': 87, 'remoteok': 86,
            'flexjobs': 85, 'upwork': 84, 'fiverr': 83, 'freelancer': 82
        }
        for job_name, job_score in popular_jobs.items():
            if job_name in title_lower or job_name in desc_lower:
                score = max(score, job_score)
                break
    
    elif category_name == 'programming':
        # Popular languages
        popular_langs = {
            'python': 98, 'javascript': 97, 'java': 96, 'typescript': 95,
            'c++': 94, 'c#': 93, 'go': 92, 'rust': 91, 'php': 90,
            'swift': 89, 'kotlin': 88, 'ruby': 87, 'react': 86
        }
        for lang_name, lang_score in popular_langs.items():
            if lang_name in title_lower:
                score = max(score, lang_score)
                break
    
    elif category_name == 'upskilling':
        # Popular learning platforms
        popular_learn = {
            'coursera': 95, 'udemy': 94, 'edx': 93, 'khan academy': 92,
            'codecademy': 91, 'freecodecamp': 90, 'pluralsight': 89,
            'linkedin learning': 88, 'skillshare': 87, 'masterclass': 86
        }
        for learn_name, learn_score in popular_learn.items():
            if learn_name in title_lower or learn_name in desc_lower:
                score = max(score, learn_score)
                break
    
    # Power/feature indicators
    power_keywords = ['advanced', 'powerful', 'enterprise', 'professional', 
                     'comprehensive', 'full-featured', 'industry-leading']
    if any(keyword in desc_lower for keyword in power_keywords):
        score += 5
    
    # Accessibility boost
    if 'free' in tags and 'paid' not in tags:
        score += 10  # Completely free gets extra boost
    
    # Popular categories boost
    popular_categories = ['coding', 'programming', 'developer', 'ai', 
                         'machine learning', 'data science']
    if any(cat in desc_lower for cat in popular_categories):
        score += 3
    
    # Cap at 100, but allow existing high scores to remain
    existing = item.get('popularity', 0)
    if existing > 100:
        return existing  # Keep existing high scores
    return min(score, 100)  # Cap new calculations at 100

def update_and_reorder_file(file_path, category_name):
    """Update IDs and reorder by popularity"""
    print(f"\n📝 Processing {category_name}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Calculate and set popularity scores
    for item in data:
        # Keep existing high popularity scores, but recalculate if needed
        existing_pop = item.get('popularity', 0)
        new_pop = calculate_popularity(item, category_name)
        # Use the higher of existing or calculated
        item['popularity'] = max(existing_pop, new_pop)
    
    # Sort by popularity (descending), then alphabetically
    data.sort(key=lambda x: (-x.get('popularity', 50), x.get('title', '').lower()))
    
    # Update IDs sequentially starting from 1
    for idx, item in enumerate(data, 1):
        item['id'] = str(idx)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    
    print(f"✅ Updated {len(data)} entries")
    top5 = ', '.join([f"{item['title']} ({item.get('popularity', 50)})" for item in data[:5]])
    print(f"   Top 5: {top5}")
    return len(data)

# Process all data files
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, '..', 'data')

files_to_process = [
    ('ai-tools.json', 'ai-tools'),
    ('jobs.json', 'jobs'),
    ('programming.json', 'programming'),
    ('upskilling.json', 'upskilling'),
    ('others.json', 'others')
]

total = 0
for filename, category in files_to_process:
    file_path = os.path.join(data_dir, filename)
    if os.path.exists(file_path):
        count = update_and_reorder_file(file_path, category)
        total += count
    else:
        print(f"⚠️  {filename} not found, skipping...")

print(f"\n🎉 Complete! Updated {total} total entries across all files")

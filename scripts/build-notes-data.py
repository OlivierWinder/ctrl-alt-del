#!/usr/bin/env python3
"""Regenerate src/data/notesData.js from scripts/NOTES - Blad1.csv"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / 'NOTES - Blad1.csv'
OUT_PATH = ROOT.parent / 'src' / 'data' / 'notesData.js'


def main():
    notes = []
    with CSV_PATH.open(newline='', encoding='utf-8') as handle:
        for index, row in enumerate(csv.reader(handle)):
            if not row:
                continue
            title = (row[0] if len(row) > 0 else '').strip()
            body = (row[1] if len(row) > 1 else '').strip()
            if not title and not body:
                continue
            if not title:
                title = f'Note {index + 1}'
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') or f'note-{index + 1}'
            notes.append({'id': slug, 'title': title, 'body': body})

    seen = {}
    for note in notes:
        base = note['id']
        if base in seen:
            seen[base] += 1
            note['id'] = f'{base}-{seen[base]}'
        else:
            seen[base] = 1

    lines = [
        '// Auto-generated from NOTES - Blad1.csv — do not edit by hand.',
        '// Regenerate: python3 scripts/build-notes-data.py',
        '',
        'export const notes = [',
    ]
    for note in notes:
        lines.append('  {')
        lines.append(f"    id: {json.dumps(note['id'], ensure_ascii=False)},")
        lines.append(f"    title: {json.dumps(note['title'], ensure_ascii=False)},")
        lines.append(f"    body: {json.dumps(note['body'], ensure_ascii=False)},")
        lines.append('  },')
    lines.append('];')
    lines.append('')

    OUT_PATH.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Generated {OUT_PATH} ({len(notes)} notes)')


if __name__ == '__main__':
    main()

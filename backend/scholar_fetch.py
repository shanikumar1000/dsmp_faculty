#!/usr/bin/env python3

import sys
import json
from scholarly import scholarly

def fetch_scholar_data(scholar_id):
    """
    Fetch Google Scholar data for a given scholar ID

    Args:
        scholar_id: Google Scholar ID (usually a string like 'dQybjqkAAAAJ')

    Returns:
        dict with scholar metrics and publications
    """
    try:
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])

        publications = []
        if 'publications' in author and author['publications']:
            for pub in author['publications'][:50]:
                pub_filled = scholarly.fill(pub)
                publications.append({
                    'title': pub_filled.get('bib', {}).get('title', ''),
                    'journal': pub_filled.get('bib', {}).get('journal', ''),
                    'year': pub_filled.get('bib', {}).get('pub_year', 0),
                    'citations': pub_filled.get('num_citations', 0),
                    'doi': pub_filled.get('bib', {}).get('doi', '')
                })

        result = {
            'success': True,
            'total_publications': author.get('citedby', 0) or 0,
            'total_citations': author.get('citedby', 0) or 0,
            'h_index': author.get('hindex', 0) or 0,
            'i_index': author.get('i10index', 0) or 0,
            'publications': publications
        }

        return result
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Scholar ID required'}))
        sys.exit(1)

    scholar_id = sys.argv[1]
    result = fetch_scholar_data(scholar_id)
    print(json.dumps(result))

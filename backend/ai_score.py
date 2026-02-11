#!/usr/bin/env python3

import sys
import json

def normalize_value(value, min_val, max_val):
    """Normalize value to 0-100 scale"""
    if max_val == min_val:
        return 50
    return min(100, max(0, ((value - min_val) / (max_val - min_val)) * 100))

def calculate_performance_score(data):
    """
    Calculate faculty performance score using weighted rule-based approach

    Weights:
    - Publications: 40%
    - Citations: 30%
    - Workshops: 20%
    - Projects: 10%
    """
    try:
        publications = data.get('publications', 0)
        citations = data.get('citations', 0)
        workshops = data.get('workshops', 0)
        projects = data.get('projects', 0)

        # Normalize each metric (0-100 scale)
        # Using reasonable max values for normalization
        norm_publications = normalize_value(publications, 0, 50)
        norm_citations = normalize_value(citations, 0, 200)
        norm_workshops = normalize_value(workshops, 0, 20)
        norm_projects = normalize_value(projects, 0, 10)

        # Calculate weighted score
        score = (
            0.4 * norm_publications +
            0.3 * norm_citations +
            0.2 * norm_workshops +
            0.1 * norm_projects
        )

        # Round to 2 decimal places
        score = round(score, 2)

        # Classify into category
        if score >= 80:
            category = "Excellent"
        elif score >= 60:
            category = "Good"
        elif score >= 40:
            category = "Average"
        else:
            category = "Needs Improvement"

        return {
            'success': True,
            'score': score,
            'category': category
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Input data required'}))
        sys.exit(1)

    try:
        input_data = json.loads(sys.argv[1])
        result = calculate_performance_score(input_data)
        print(json.dumps(result))
    except json.JSONDecodeError:
        print(json.dumps({'success': False, 'error': 'Invalid JSON input'}))
        sys.exit(1)

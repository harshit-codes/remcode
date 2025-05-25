#!/usr/bin/env python3
"""
Vibe Sessions Analysis Tool (Basic Version)

Provides analysis of development sessions without external dependencies.
For advanced analysis, install pandas: pip install pandas
"""

import csv
import sys
from datetime import datetime
from pathlib import Path
from collections import Counter, defaultdict

def load_sessions(csv_path="sessions.csv"):
    """Load sessions CSV as list of dictionaries."""
    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except FileNotFoundError:
        print(f"❌ Sessions file not found: {csv_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading sessions: {e}")
        sys.exit(1)

def session_summary(sessions):
    """Generate overall session summary."""
    print("📊 VIBE SESSIONS SUMMARY")
    print("=" * 50)
    
    # Basic counts
    total_snapshots = len(sessions)
    unique_sessions = len(set(s['session_id'] for s in sessions))
    
    print(f"🎯 Total Sessions: {unique_sessions}")
    print(f"📸 Total Snapshots: {total_snapshots}")
    
    # Calculate average duration (skip empty values)
    durations = [int(s['duration_minutes']) for s in sessions if s['duration_minutes'] and s['duration_minutes'].isdigit()]
    avg_duration = sum(durations) / len(durations) if durations else 0
    print(f"⏱️  Average Duration: {avg_duration:.1f} minutes")
    
    # Session types
    session_types = Counter(s['session_type'] for s in sessions if s['session_type'])
    print("\n🔧 Session Types:")
    for session_type, count in session_types.items():
        print(f"  • {session_type}: {count} snapshots")
    
    # Progress status
    statuses = Counter(s['progress_status'] for s in sessions if s['progress_status'])
    print("\n📈 Progress Status:")
    for status, count in statuses.items():
        print(f"  • {status}: {count} snapshots")

def analyze_blockers(sessions):
    """Analyze blockers and issues across sessions."""
    print("\n🚫 BLOCKER ANALYSIS")
    print("=" * 50)
    
    # Find sessions with blockers
    blocked = [s for s in sessions if s['blockers'] and s['blockers'] not in ['', 'None']]
    
    if not blocked:
        print("✅ No blockers reported!")
        return
    
    print(f"🔍 Sessions with blockers: {len(blocked)}")
    
    print("\n📋 Recent Blockers:")
    for session in blocked[-5:]:  # Last 5
        print(f"  • {session['session_id']}: {session['blockers']}")
    
    # Issues analysis
    issues = [s for s in sessions if s['issues_encountered'] and s['issues_encountered'] not in ['', 'None']]
    
    if issues:
        print(f"\n🐛 Sessions with issues: {len(issues)}")
        print("\n📋 Recent Issues:")
        for session in issues[-5:]:  # Last 5
            print(f"  • {session['session_id']}: {session['issues_encountered']}")
            if session['resolutions'] and session['resolutions'] not in ['', 'None']:
                print(f"    ✅ Resolution: {session['resolutions']}")

def search_sessions(sessions, query):
    """Search sessions for specific terms."""
    print(f"\n🔍 SEARCH RESULTS FOR: '{query}'")
    print("=" * 50)
    
    # Search across text fields
    text_fields = ['session_focus', 'achievements', 'blockers', 'issues_encountered', 
                  'resolutions', 'key_learnings', 'technical_details', 'session_notes']
    
    matches = []
    for session in sessions:
        for field in text_fields:
            if session.get(field) and query.lower() in session[field].lower():
                matches.append(session)
                break
    
    if not matches:
        print("❌ No matches found")
        return
    
    print(f"✅ Found {len(matches)} matching snapshots")
    
    for session in matches:
        print(f"\n📸 {session['session_id']} - {session['snapshot_id']}")
        print(f"  📅 {session['timestamp']}")
        print(f"  🔧 {session['session_focus']}")

def main():
    """Main analysis function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze Vibe Sessions data')
    parser.add_argument('--csv', default='../sessions.csv', help='Path to sessions CSV file')
    parser.add_argument('--search', help='Search for specific term across sessions')
    parser.add_argument('--blockers-only', action='store_true', help='Show only blocker analysis')
    parser.add_argument('--summary-only', action='store_true', help='Show only summary')
    
    args = parser.parse_args()
    
    # Load data
    sessions = load_sessions(args.csv)
    
    if args.search:
        search_sessions(sessions, args.search)
        return
    
    if args.blockers_only:
        analyze_blockers(sessions)
        return
    
    if args.summary_only:
        session_summary(sessions)
        return
    
    # Full analysis
    session_summary(sessions)
    analyze_blockers(sessions)
    
    print("\n" + "=" * 50)
    print("📊 Analysis complete!")
    print("\nUsage examples:")
    print("  python session-stats.py --search 'model'")
    print("  python session-stats.py --blockers-only")
    print("  python session-stats.py --summary-only")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Launcher script for AI extension Tool standalone UI
"""

import sys
import os

# Add the current directory to the path so we can import the module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Launch the AI extension Tool standalone UI"""
    try:
        from AI_EXTENSION_tool.engine import run_ui
        print("Launching AI extension Tool...")
        result = run_ui()
        print("AI extension Tool closed.")
        return result
    except ImportError as e:
        print(f"Error importing AI extension Tool: {e}")
        print("Make sure you're in the correct directory and dependencies are installed.")
        return None
    except Exception as e:
        print(f"Error launching AI extension Tool: {e}")
        return None

if __name__ == "__main__":
    main() 
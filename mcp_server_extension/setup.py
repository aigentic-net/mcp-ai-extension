#!/usr/bin/env python3
"""
Setup script for AI extension Tool MCP Server - Extension Version
"""

from setuptools import setup, find_packages

setup(
    name="mcp-server-ai-extension",
    version="1.0.0",
    description="AI extension Tool MCP Server for VS Code Extension",
    py_modules=['server', 'engine', 'constants'],
    packages=['core', 'ui', 'utils'],
    install_requires=[
        "mcp>=1.0.0",
    ],
    entry_points={
        'console_scripts': [
            'mcp-server-ai-extension=server:main',
        ],
    },
    python_requires=">=3.8",
    author="AI extension Team",
    author_email="contact@aiextension.com",
    long_description="MCP server specifically designed for VS Code extension integration",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
) 
from langchain_core.tools import tool
import os
import requests
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def get_github_headers():
    """Function to build authenticated GitHub headers"""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers

@tool
def get_codebase_structure(owner: str, repo: str) -> str:
    """
    Fetches file and directory structure of a public GitHub repo. Should be used
    as a first step to map project layout, locate configuration files, and getting
    a sense of the overall structure of the repo.
    """

    tree_data = None
    for branch in ["main", "master"]:
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        response = requests.get(url, headers=get_github_headers())
        if response.status_code == 200:
            tree_data = response.json().get("tree", [])
            break
    
    if not tree_data:
        return f"Error: Could not retrieve repository map for {owner}/{repo}"
    
    file_paths = []
    ignored_dirs = (
        "node_modules/",
        ".git/",
        "__pycache__/",
        ".next/",
        "dist/",
        "build/",
        "venv/"
        ".env"
        )
    
    for item in tree_data:
        path = item.get("path", "")
        if item.get("type") == "blob" and not path.startswith(ignored_dirs): # blob = file
            file_paths.append(path)

    if not file_paths:
        return "Repo appears to be empty or contains ignored files (node_modules, .git, etc.)"
    
    return "Available files in this repository:\n" + "\n".join(file_paths)

@tool
def read_file(owner: str, repo: str, path: str) -> str:
    """
    Reads full text content of a specific file. Use when filepath is known
    (from mapping repo's structure) and need to analyze inline logic
    """

    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = get_github_headers()
    headers["Accept"] = "application/vnd.github.v3.raw" # returns raw text code

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return f"--- Content of file: {path} ---\n\n{response.text}"
    else:
        return f"Error: unable to read file '{path}': (Status code: {response.status_code})"

tools = [get_codebase_structure, read_file]
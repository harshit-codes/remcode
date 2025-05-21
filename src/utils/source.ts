import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SourceOptions {
  token?: string;
  cache?: string;
}

interface ResolvedSource {
  type: 'github' | 'local';
  name: string;
  path: string;
  // For GitHub sources
  owner?: string;
  repo?: string;
  ref?: string;
}

/**
 * Resolve a source path or URL to a local directory
 */
export async function resolveSource(source: string, options: SourceOptions = {}): Promise<ResolvedSource> {
  if (isGitHubUrl(source)) {
    return resolveGitHubSource(source, options);
  } else {
    return resolveLocalSource(source);
  }
}

/**
 * Check if a string is a GitHub URL
 */
function isGitHubUrl(source: string): boolean {
  return source.startsWith('https://github.com/') || source.startsWith('git@github.com:');
}

/**
 * Resolve a GitHub URL to a local directory
 */
async function resolveGitHubSource(url: string, options: SourceOptions): Promise<ResolvedSource> {
  // Parse GitHub URL
  let owner, repo, ref;
  
  if (url.startsWith('https://github.com/')) {
    const parts = url.replace('https://github.com/', '').split('/');
    owner = parts[0];
    repo = parts[1];
    ref = parts[3] || 'main';
  } else if (url.startsWith('git@github.com:')) {
    const parts = url.replace('git@github.com:', '').split('/');
    owner = parts[0];
    repo = parts[1].replace('.git', '');
    ref = 'main';
  } else {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  
  // Check if token is provided
  if (!options.token && !process.env.GITHUB_TOKEN) {
    throw new Error('GitHub token is required for accessing GitHub repositories');
  }
  
  // Create cache directory if it doesn't exist
  const cacheDir = options.cache || path.join(os.tmpdir(), 'remcode-cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  // Create a unique directory name for this repository
  const repoDir = path.join(cacheDir, `${owner}-${repo}-${Date.now()}`);
  
  // Clone the repository
  try {
    const token = options.token || process.env.GITHUB_TOKEN;
    const cloneUrl = `https://${token}@github.com/${owner}/${repo}.git`;
    
    await execAsync(`git clone --depth 1 ${cloneUrl} ${repoDir}`);
    
    if (ref && ref !== 'main' && ref !== 'master') {
      await execAsync(`cd ${repoDir} && git fetch --depth 1 origin ${ref} && git checkout ${ref}`);
    }
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    type: 'github',
    name: repo,
    path: repoDir,
    owner,
    repo,
    ref
  };
}

/**
 * Resolve a local path to an absolute path
 */
function resolveLocalSource(source: string): ResolvedSource {
  const absolutePath = path.resolve(process.cwd(), source);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local path does not exist: ${absolutePath}`);
  }
  
  if (!fs.statSync(absolutePath).isDirectory()) {
    throw new Error(`Local path is not a directory: ${absolutePath}`);
  }
  
  return {
    type: 'local',
    name: path.basename(absolutePath),
    path: absolutePath
  };
}

/**
 * Detect programming languages used in a directory
 */
export async function detectLanguages(directory: string): Promise<Record<string, number>> {
  const fileStats: Record<string, number> = {};
  const languages: Record<string, number> = {};
  
  // Map file extensions to languages
  const extensionMap: Record<string, string> = {
    '.py': 'python',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.rb': 'ruby',
    '.go': 'go',
    '.php': 'php',
    '.cs': 'csharp',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.rs': 'rust',
  };
  
  // Count files by extension
  function countFiles(dir: string): void {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        countFiles(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        fileStats[ext] = (fileStats[ext] || 0) + 1;
      }
    }
  }
  
  // Count files in the directory
  countFiles(directory);
  
  // Convert file extensions to languages
  for (const [ext, count] of Object.entries(fileStats)) {
    const language = extensionMap[ext];
    if (language) {
      languages[language] = (languages[language] || 0) + count;
    }
  }
  
  return languages;
}

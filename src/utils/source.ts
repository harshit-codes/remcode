import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import * as util from 'util';
import axios from 'axios';
import { getLogger } from './logger';

const logger = getLogger('Source');
const execAsync = util.promisify(child_process.exec);

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
 * Source types supported by the resolver
 */
export enum SourceType {
  LOCAL_PATH = 'local_path',
  GITHUB_REPO = 'github_repo',
  GITLAB_REPO = 'gitlab_repo',
  BITBUCKET_REPO = 'bitbucket_repo',
  GIT_REPO = 'git_repo',
  HTTP_URL = 'http_url',
  UNKNOWN = 'unknown'
}

/**
 * Parsed source information
 */
export interface ParsedSource {
  type: SourceType;
  // For Git repositories
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
  // For HTTP URLs
  url?: string;
  // For local paths
  localPath?: string;
  // Original source string
  originalSource: string;
}

/**
 * Resolve a source path or URL to a local directory
 */
export async function resolveSource(source: string, options: SourceOptions = {}): Promise<ResolvedSource> {
  const parsedSource = parseSource(source);
  
  if (!parsedSource) {
    throw new Error(`Unsupported source type: ${source}`);
  }
  
  switch (parsedSource.type) {
    case SourceType.GITHUB_REPO:
      return resolveGitHubSource(parsedSource, options);
    case SourceType.LOCAL_PATH:
      return resolveLocalSource(parsedSource.localPath);
    default:
      throw new Error(`Unsupported source type: ${parsedSource.type}`);
  }
}

/**
 * Parse a source string into its components
 */
function parseSource(source: string): ParsedSource | null {
  const parsers = [
    parseGitHubUrl,
    parseGitLabUrl,
    parseBitbucketUrl,
    parseGenericGitUrl,
    parseHttpUrl,
    parseLocalPath
  ];
  
  for (const parser of parsers) {
    const parsedSource = parser(source);
    if (parsedSource) return parsedSource;
  }
  
  return null;
}

/**
 * Parse a GitHub URL into its components
 */
function parseGitHubUrl(url: string): ParsedSource | null {
  // GitHub URL formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo/tree/branch
  // https://github.com/owner/repo/tree/branch/path/to/dir
  // https://github.com/owner/repo/blob/branch/path/to/file

  const githubRegex = /github\.com\/([\w.-]+)\/([\w.-]+)(?:\/(?:tree|blob)\/([\w.-]+)(?:\/(.+))?)?/i;
  const match = url.match(githubRegex);

  if (!match) return null;

  const [, owner, repo, branch = 'main', path = ''] = match;
  
  logger.debug(`Parsed GitHub URL: owner=${owner}, repo=${repo}, branch=${branch}, path=${path}`);
  
  return { 
    type: SourceType.GITHUB_REPO, 
    owner, 
    repo, 
    branch, 
    path,
    originalSource: url 
  };
}

/**
 * Parse a GitLab URL into its components
 */
function parseGitLabUrl(url: string): ParsedSource | null {
  // GitLab URL formats:
  // https://gitlab.com/owner/repo
  // https://gitlab.com/owner/repo/-/tree/branch
  // https://gitlab.com/owner/repo/-/tree/branch/path/to/dir
  // https://gitlab.com/owner/repo/-/blob/branch/path/to/file

  const gitlabRegex = /gitlab\.com\/([\w.-]+)\/([\w.-]+)(?:\/-\/(?:tree|blob)\/([\w.-]+)(?:\/(.+))?)?/i;
  const match = url.match(gitlabRegex);

  if (!match) return null;

  const [, owner, repo, branch = 'main', path = ''] = match;
  
  logger.debug(`Parsed GitLab URL: owner=${owner}, repo=${repo}, branch=${branch}, path=${path}`);
  
  return { 
    type: SourceType.GITLAB_REPO, 
    owner, 
    repo, 
    branch, 
    path,
    originalSource: url 
  };
}

/**
 * Parse a Bitbucket URL into its components
 */
function parseBitbucketUrl(url: string): ParsedSource | null {
  // Bitbucket URL formats:
  // https://bitbucket.org/owner/repo
  // https://bitbucket.org/owner/repo/src/branch
  // https://bitbucket.org/owner/repo/src/branch/path/to/file

  const bitbucketRegex = /bitbucket\.org\/([\w.-]+)\/([\w.-]+)(?:\/src\/([\w.-]+)(?:\/(.+))?)?/i;
  const match = url.match(bitbucketRegex);

  if (!match) return null;

  const [, owner, repo, branch = 'main', path = ''] = match;
  
  logger.debug(`Parsed Bitbucket URL: owner=${owner}, repo=${repo}, branch=${branch}, path=${path}`);
  
  return { 
    type: SourceType.BITBUCKET_REPO, 
    owner, 
    repo, 
    branch, 
    path,
    originalSource: url 
  };
}

/**
 * Parse a generic Git URL into its components
 */
function parseGenericGitUrl(url: string): ParsedSource | null {
  // Git URL formats:
  // https://example.com/repo.git
  // git@example.com:owner/repo.git
  
  const gitRegex = /(?:https?:\/\/|git@)([\w.-]+)(?::|\/)([\w.-]+\/[\w.-]+)(?:\.git)?(?:\/?|#([\w.-]+))?/i;
  const match = url.match(gitRegex);

  if (!match) return null;

  const [, domain, repoPath, branch = 'main'] = match;
  // Split owner/repo if possible
  const pathParts = repoPath.split('/');
  const repo = pathParts.pop() || '';
  const owner = pathParts.join('/');
  
  logger.debug(`Parsed Git URL: domain=${domain}, owner=${owner}, repo=${repo}, branch=${branch}`);
  
  return { 
    type: SourceType.GIT_REPO, 
    owner, 
    repo, 
    branch,
    originalSource: url 
  };
}

/**
 * Parse an HTTP URL
 */
function parseHttpUrl(url: string): ParsedSource | null {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    logger.debug(`Parsed HTTP URL: ${url}`);
    return {
      type: SourceType.HTTP_URL,
      url,
      originalSource: url
    };
  }
  
  return null;
}

/**
 * Parse a local path
 */
function parseLocalPath(source: string): ParsedSource | null {
  // Check if it's an absolute path or a relative path that exists
  if (path.isAbsolute(source) || fs.existsSync(path.resolve(process.cwd(), source))) {
    const resolvedPath = path.resolve(process.cwd(), source);
    logger.debug(`Parsed local path: ${resolvedPath}`);
    return {
      type: SourceType.LOCAL_PATH,
      localPath: resolvedPath,
      originalSource: source
    };
  }
  
  return null;
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

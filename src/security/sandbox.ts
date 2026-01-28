import { resolve, normalize, relative, basename, sep } from 'path';

/**
 * List of sensitive files/directories to block access to
 */
const BLOCKED_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  'credentials.json',
  'secrets.json',
  'id_rsa',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519',
  '.npmrc',
  '.pypirc',
];

const BLOCKED_DIRECTORIES = [
  '.git/config',
  '.ssh',
  'node_modules/.bin',
];

/**
 * Validate that a file path is safe to access
 * - Must be within the project directory (process.cwd())
 * - Must not be a sensitive file
 * - Must not attempt directory traversal
 */
export function validatePath(filePath: string): string {
  const projectRoot = process.cwd();

  // Resolve to absolute path and normalize
  const absolutePath = resolve(projectRoot, filePath);
  const normalizedPath = normalize(absolutePath);

  // Check if path is within project directory
  const relativePath = relative(projectRoot, normalizedPath);

  // If relative path starts with '..' or is an absolute path, it's outside project
  if (relativePath.startsWith('..') || resolve(relativePath) === relativePath) {
    throw new Error(
      `Access denied: Path is outside project directory.\n` +
      `Project root: ${projectRoot}\n` +
      `Attempted path: ${filePath}`
    );
  }

  // Check for blocked files
  const fileName = basename(normalizedPath);

  if (BLOCKED_FILES.includes(fileName)) {
    throw new Error(
      `Access denied: Cannot access sensitive file "${fileName}"`
    );
  }

  // Check for blocked directories
  const pathParts = normalizedPath.split(sep);

  for (const blockedDir of BLOCKED_DIRECTORIES) {
    const blockedParts = blockedDir.split('/');
    const matchesParts = blockedParts.every((part, i) => {
      const pathIndex = pathParts.length - blockedParts.length + i;
      return pathIndex >= 0 && pathParts[pathIndex] === part;
    });

    if (matchesParts) {
      throw new Error(
        `Access denied: Cannot access blocked directory "${blockedDir}"`
      );
    }
  }

  return normalizedPath;
}

/**
 * Check if a path is within the project directory (without throwing)
 */
export function isPathSafe(filePath: string): boolean {
  try {
    validatePath(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  return process.cwd();
}

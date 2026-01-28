import { describe, it, expect } from 'vitest';
import { validatePath, isPathSafe } from '../../src/security/sandbox.js';

describe('validatePath', () => {
  it('should allow paths within project directory', () => {
    const safePath = validatePath('src/index.ts');
    expect(safePath).toContain('src');
    expect(safePath).toContain('index.ts');
  });

  it('should throw on directory traversal attempts', () => {
    expect(() => validatePath('../../etc/passwd')).toThrow('outside project directory');
  });

  it('should throw on absolute paths outside project', () => {
    expect(() => validatePath('/etc/passwd')).toThrow('outside project directory');
  });

  it('should block .env files', () => {
    expect(() => validatePath('.env')).toThrow('sensitive file');
  });

  it('should block .env.local files', () => {
    expect(() => validatePath('.env.local')).toThrow('sensitive file');
  });

  it('should block SSH keys', () => {
    expect(() => validatePath('.ssh/id_rsa')).toThrow();
  });

  it('should normalize paths correctly', () => {
    const safePath = validatePath('./src/../src/./index.ts');
    expect(safePath).toContain('src');
    expect(safePath).toContain('index.ts');
  });
});

describe('isPathSafe', () => {
  it('should return true for safe paths', () => {
    expect(isPathSafe('src/index.ts')).toBe(true);
  });

  it('should return false for unsafe paths', () => {
    expect(isPathSafe('../../etc/passwd')).toBe(false);
  });

  it('should return false for sensitive files', () => {
    expect(isPathSafe('.env')).toBe(false);
  });
});

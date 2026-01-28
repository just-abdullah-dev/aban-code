import { describe, it, expect } from 'vitest';
import { isCommandAllowed, getBlockReason, isCommandSafe } from '../../src/security/command-filter.js';

describe('isCommandAllowed', () => {
  it('should allow safe npm commands', () => {
    expect(isCommandAllowed('npm install express')).toBe(true);
    expect(isCommandAllowed('npm run build')).toBe(true);
    expect(isCommandAllowed('npm test')).toBe(true);
  });

  it('should allow safe git commands', () => {
    expect(isCommandAllowed('git status')).toBe(true);
    expect(isCommandAllowed('git add .')).toBe(true);
    expect(isCommandAllowed('git commit -m "message"')).toBe(true);
  });

  it('should block rm -rf /', () => {
    expect(isCommandAllowed('rm -rf /')).toBe(false);
  });

  it('should block rm -rf *', () => {
    expect(isCommandAllowed('rm -rf *')).toBe(false);
  });

  it('should block sudo commands', () => {
    expect(isCommandAllowed('sudo rm -rf /var')).toBe(false);
  });

  it('should block dd commands', () => {
    expect(isCommandAllowed('dd if=/dev/zero of=/dev/sda')).toBe(false);
  });

  it('should block mkfs commands', () => {
    expect(isCommandAllowed('mkfs.ext4 /dev/sda1')).toBe(false);
  });

  it('should block chmod 777', () => {
    expect(isCommandAllowed('chmod 777 file.txt')).toBe(false);
  });

  it('should block shutdown commands', () => {
    expect(isCommandAllowed('shutdown now')).toBe(false);
    expect(isCommandAllowed('reboot')).toBe(false);
  });

  it('should allow ls commands', () => {
    expect(isCommandAllowed('ls -la')).toBe(true);
  });

  it('should allow cat commands', () => {
    expect(isCommandAllowed('cat file.txt')).toBe(true);
  });

  it('should allow python commands', () => {
    expect(isCommandAllowed('python script.py')).toBe(true);
    expect(isCommandAllowed('python3 app.py')).toBe(true);
  });
});

describe('getBlockReason', () => {
  it('should return reason for blocked commands', () => {
    const reason = getBlockReason('rm -rf /');
    expect(reason).toContain('dangerous pattern');
  });

  it('should return null for allowed commands', () => {
    const reason = getBlockReason('npm install');
    expect(reason).toBe(null);
  });
});

describe('isCommandSafe', () => {
  it('should identify safe commands', () => {
    expect(isCommandSafe('npm install')).toBe(true);
    expect(isCommandSafe('git status')).toBe(true);
  });

  it('should return false for unknown commands', () => {
    expect(isCommandSafe('unknown-command')).toBe(false);
  });

  it('should return false for dangerous commands', () => {
    expect(isCommandSafe('rm -rf /')).toBe(false);
  });
});

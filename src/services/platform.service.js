// @flow
import * as childProcess from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { remote } from 'electron';

import { PACKAGE_MANAGER } from '../config/app';

export const isWin = /^win/.test(os.platform());
export const isMac = /darwin/.test(os.platform());

// Returns path to the user's `Documents` directory
// For Windows Support
// Documents folder is much better place for project
// folders (Most programs use it as a default save location)
// Since there is a chance of being moved or users language
// might be different we are reading the value from Registry
// There might be a better solution but this seems ok so far
let winDocPath = '';
if (isWin) {
  const winDocumentsRegRecord = childProcess.execSync(
    'REG QUERY "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Personal',
    {
      encoding: 'utf8',
    }
  );
  const winDocPathArray = winDocumentsRegRecord.split(' ');
  winDocPath = winDocPathArray[winDocPathArray.length - 1]
    .replace('%USERPROFILE%\\', '')
    .replace(/\s/g, '');
}
export const windowsHomeDir = isWin ? path.join(os.homedir(), winDocPath) : '';

// Returns formatted command for Windows
export const formatCommandForPlatform = (command: string): string =>
  isWin ? `${command}.cmd` : command;

export const PACKAGE_MANAGER_CMD = path.join(
  remote.app.getAppPath(),
  'node_modules/yarn/bin',
  formatCommandForPlatform(PACKAGE_MANAGER)
);

// Forward the host env, and append the
// project's .bin directory to PATH to allow
// package scripts to function properly.
/**
 * For running tasks in a cross-platform manner, this helper does a few things:
 *  - Forward the host environment
 *  - Append the project's .bin directory to PATH to allow package scripts to
 *    function properly.
 *  - Add `FORCE_COLOR: true`, so that terminal output includes color codes.
 */
export const getBaseProjectEnvironment = (
  projectPath: string,
  currentEnvironment: Object = window.process.env
) => ({
  ...currentEnvironment,
  // NOTE: this option adds control characters to the output.
  // If at some point we need "raw" output with no control characters, we
  // should move this out into a "wrapping" function, and update current
  // callsites to use it.
  FORCE_COLOR: true,
  PATH:
    currentEnvironment.PATH +
    path.delimiter +
    path.join(projectPath, 'node_modules', '.bin'),
});

export const getCopyForOpeningFolder = () =>
  // For Mac users, use the more-common term 'Finder'.
  // For Windows and Linux users, 'folder' should be meaningful enough.
  isMac ? 'Open in Finder' : 'Open folder';

import fs from 'node:fs/promises'
import path from 'node:path'

import { lockFiles } from './package-manager.js'

/**
 * @typedef {{
 *  ignoreLockFile?: boolean
 * }} GetProjectRootDirectoryOptions
 */

/**
 * Get the project root directory.
 *
 * It will look for the project root directory by checking the existence of a
 * `package.json` file and one of the lock files in the directory.
 *
 * The search starts from the current working directory and goes up to the
 * directory. If the root directory is not found it returns null.
 *
 * Optionally, it can ignore the lock file and return the first directory with a
 * `package.json`. This is useful when the lock file is not needed. For example,
 * when listing the installed packages.
 *
 * @param {GetProjectRootDirectoryOptions | undefined} options
 * @returns {Promise<string | null>}
 */
export async function getProjectRootDirectory(options) {
  let currentDir = process.cwd()

  while (currentDir !== path.parse(currentDir).root) {
    const hasPackageJson = await fs
      .stat(path.join(currentDir, 'package.json'))
      .catch(() => null)

    if (hasPackageJson) {
      const files = await fs.readdir(currentDir)
      const hasLockFile = lockFiles.some((filename) => files.includes(filename))

      if (hasLockFile || options?.ignoreLockFile) {
        return currentDir
      }
    }

    currentDir = path.dirname(currentDir)
  }

  return null
}

/**
 * Check if the project is a TypeScript project.
 *
 * This function checks if the project is a TypeScript project by looking for a
 * `tsconfig.json` file in the project (or package) directory.
 *
 * **NOTE:** We can't use the `getProjectRootDirectory` function because when
 * working in monorepos the root directory might not have a `tsconfig.json` file.
 * The file will probably be in the package directory.
 *
 * @returns {Promise<boolean>}
 */
export async function isTypeScriptProject() {
  let currentDir = process.cwd()

  while (currentDir !== path.parse(currentDir).root) {
    const hasTSConfig = await fs
      .stat(path.join(currentDir, 'tsconfig.json'))
      .catch(() => null)

    if (hasTSConfig) {
      return true
    }

    currentDir = path.dirname(currentDir)
  }

  return false
}

/**
 * Get the project `package.json`.
 *
 * This function reads the `package.json` file from the project directory and
 * returns the parsed JSON object. If the file is not found it returns null.
 *
 * On monorepos, the returned `package.json` is the first one to appear in the
 * directory tree. If the command is being executed in a package directory, it
 * will return the `package.json` from that directory.
 *
 * @returns {Promise<import('type-fest').PackageJson | null>}
 */
export async function getProjectPackageJson() {
  const rootDir = await getProjectRootDirectory({ ignoreLockFile: true })
  if (rootDir) {
    const packageJsonPath = path.join(rootDir, 'package.json')
    return JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  }

  return null
}

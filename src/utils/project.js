import fs from 'node:fs/promises'
import path from 'node:path'

import { lockFiles } from './package-manager.js'

/**
 * Get the project root directory.
 *
 * It will look for the project root directory by checking the existence of a `package.json`
 * file and one of the lock files in the directory.
 *
 * The search starts from the current working directory and goes up to the
 * directory. If the project root directory is not found it returns null.
 *
 * @returns {Promise<string | null>}
 */
export async function getProjectRootDirectory() {
  let currentDir = process.cwd()

  while (currentDir !== path.parse(currentDir).root) {
    const hasPackageJson = await fs
      .stat(path.join(currentDir, 'package.json'))
      .catch(() => null)

    if (hasPackageJson) {
      const files = await fs.readdir(currentDir)
      const hasLockFile = lockFiles.some((filename) => files.includes(filename))

      if (hasLockFile) {
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

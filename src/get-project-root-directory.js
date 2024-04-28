import fs from 'node:fs/promises'
import path from 'node:path'

// List of lock files to look for in the project root directory
const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']

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

// * Get the project root directory by looking for the `package.json` file.
//  *
//  * The search starts from the current working directory and goes up to the root directory.
//  * If the `package.json` file is not found it will return null.

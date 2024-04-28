import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Get the project root directory by looking for the `package.json` file.
 *
 * The search starts from the current working directory and goes up to the root directory.
 * If the `package.json` file is not found it will return null.
 *
 * @returns {Promise<string | null>}
 */
export async function getProjectRootDirectory() {
  let currentDir = process.cwd()

  // BUG Does not work with monorepos
  while (currentDir !== path.parse(currentDir).root) {
    const hasPackageJson = await fs
      .stat(path.join(currentDir, 'package.json'))
      .catch(() => null)

    if (hasPackageJson) {
      return currentDir
    }

    currentDir = path.dirname(currentDir)
  }

  return null
}

import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Find the project root directory by looking for the `package.json` file.
 *
 * The search starts from the current working directory and goes up to the root directory.
 * If the `package.json` file is not found it will return null.
 *
 * @returns {Promise<string | null>}
 */
export async function findProjectRootDirectory() {
  let currentDir = process.cwd()

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

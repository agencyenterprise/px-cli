import fs from 'node:fs/promises'

import { findProjectRootDirectory } from './find-project-root-directory.js'

/** @typedef {"npm" | "pnpm" | "yarn"} PackageManager */

/**
 * Detect what is the project package manager to run the command.
 *
 * The package manager is detected by the name of the lock file in the project root directory.
 * If the lock file is not found it will return null.
 *
 * The supported package managers are:
 * - npm
 * - yarn
 * - pnpm
 *
 * @returns {Promise<PackageManager | null>}
 */
export async function detectPackageManager() {
  /** @type {PackageManager | null} */
  const rootDirectory = await findProjectRootDirectory()

  if (rootDirectory) {
    const files = await fs.readdir(rootDirectory)

    if (files.includes('package-lock.json')) {
      return 'npm'
    }

    if (files.includes('yarn.lock')) {
      return 'yarn'
    }

    if (files.includes('pnpm-lock.yaml')) {
      return 'pnpm'
    }
  }

  return null
}
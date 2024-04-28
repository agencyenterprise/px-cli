import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

import chalk from 'chalk'

import { detectPackageManager } from '../detect-package-manager.js'
import { getProjectRootDirectory } from '../get-project-root-directory.js'

/**
 * Install packages.
 *
 * This function installs the packages using the package manager and installs the
 * TypeScript declaration packages for the packages being installed.
 *
 * @param {import('commander').Command} program
 */
export async function installCommand(program) {
  const packageManager = await detectPackageManager()
  if (!packageManager) {
    return console.error(chalk.red('Package manager not found!'))
  }

  const packages = program.args.slice(1).filter((arg) => !arg.startsWith('-'))
  const declarationPackages = await getTypeScriptDeclarationPackages(packages)

  try {
    // TODO If installing dev dependencies install everything in one command
    execSync(`${packageManager} ${program.args.join(' ')}`, {
      stdio: 'inherit',
    })

    if (declarationPackages.length > 0) {
      const command = program.args[0]
      execSync(
        `${packageManager} ${command} -D ${declarationPackages.join(' ')}`,
        { stdio: 'inherit' },
      )
    }
  } catch {}
}

/**
 * Get TypeScript declaration packages to be installed.
 *
 * On TypeScript projects, we need to install the TypeScript declaration packages
 * for the packages being installed. This function will return the list of
 * TypeScript declaration packages that need to be installed.
 *
 * If the project is not a TypeScript project, it returns an empty array to skip
 * this step.
 *
 * @param {string[]} packages
 * @returns {Promise<string[]>}
 */
async function getTypeScriptDeclarationPackages(packages) {
  if (await isTypeScriptProject()) {
    /** @type {string[]} */
    const declarationPackages = []

    for (const pkg of packages) {
      const declarationPkg = composeDeclarationPackageName(pkg)

      // Check if the declaration package exists in the npm registry. It will
      // return a 404 if the package does not exist.
      const response = await fetch(
        `https://registry.npmjs.org/${declarationPkg}`,
      )

      if (response.ok) {
        declarationPackages.push(declarationPkg)
      }
    }

    return declarationPackages
  }

  return []
}

/**
 * Check if the project is a TypeScript project.
 *
 * This function checks if the project is a TypeScript project by looking for a
 * `tsconfig.json` file in the project root directory.
 *
 * @returns {Promise<boolean>}
 */
async function isTypeScriptProject() {
  const rootDirectory = await getProjectRootDirectory()
  const tsConfigPath = path.join(rootDirectory, 'tsconfig.json')

  try {
    await fs.access(tsConfigPath)
    return true
  } catch {
    return false
  }
}

/**
 * Compose the TypeScript declaration package name, according to the DefinitelyTyped
 * [naming convention](https://github.com/DefinitelyTyped/DefinitelyTyped#npm).
 *
 * For example:
 * - `react` -> `@types/react`
 * - `@babel/preset-env` -> `@types/babel__preset-env`
 *
 * @param {string} pkg
 * @returns string
 */
function composeDeclarationPackageName(pkg) {
  if (pkg.startsWith('@')) {
    const [scope, name] = pkg.slice(1).split('/')
    return `@types/${scope}__${name}`
  }

  return `@types/${pkg}`
}

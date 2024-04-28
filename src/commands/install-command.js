import chalk from 'chalk'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'
import { isTypeScriptProject } from '../utils/project.js'
import { composeDeclarationPackageName } from '../utils/typescript.js'

/**
 * Install packages.
 *
 * This function installs the packages using the detected package manager. It
 * also installs the TypeScript declaration packages for the installed packages
 * if the project is a TypeScript project.
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

  // TODO If installing dev dependencies install everything in one command
  const installCommand = `${packageManager} ${program.args.join(' ')}`
  executeCommand(installCommand)

  if (declarationPackages.length > 0) {
    const baseCommand = program.args[0]
    const declarationsCommand = `${packageManager} ${baseCommand} -D ${declarationPackages.join(' ')}`
    executeCommand(declarationsCommand)
  }
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

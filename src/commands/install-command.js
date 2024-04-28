import chalk from 'chalk'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'
import { isTypeScriptProject } from '../utils/project.js'
import { composeDeclarationPackageName } from '../utils/typescript.js'

const DEV_FLAGS = ['-D', '--dev', '--save-dev']

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

  const isDevInstall = DEV_FLAGS.some((flag) => program.args.includes(flag))
  let installCommand = `${packageManager} ${program.args.join(' ')}`

  // Install declaration packages in the same command if it's installing dev dependencies
  if (isDevInstall && declarationPackages.length > 0) {
    installCommand += ` ${declarationPackages.join(' ')}`
  }

  executeCommand(installCommand)

  if (!isDevInstall && declarationPackages.length > 0) {
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
    const declarationPackages = []

    for (const pkg of packages) {
      if (pkg.startsWith('@types')) {
        continue
      }

      // Check if the declaration package exists in the npm registry. It will
      // return a 404 if the package does not exist.
      // TODO Add a cache to avoid making multiple requests for the same package
      console.debug(chalk.gray(`Checking if ${pkg} has a declaration package`))
      const declarationPkg = composeDeclarationPackageName(pkg)
      const response = await fetch(
        `https://registry.npmjs.org/${declarationPkg}`,
      )

      if (response.ok) {
        console.debug(chalk.green(`Found declaration package for ${pkg}`))
        declarationPackages.push(declarationPkg)
      }
    }

    return declarationPackages
  }

  return []
}

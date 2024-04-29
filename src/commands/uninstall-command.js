import chalk from 'chalk'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'
import { getProjectPackageJson, isTypeScriptProject } from '../utils/project.js'
import { composeDeclarationPackageName } from '../utils/typescript.js'

/**
 * Uninstall packages from the project.
 *
 * Uninstall the packages from the project using the package manager. If the
 * project is a TypeScript project it will also remove the declaration packages.
 *
 * @param {import('commander').Command} program
 */
export async function uninstallCommand(program) {
  const packageManager = await detectPackageManager()
  if (!packageManager) {
    return console.error(chalk.red('Package manager not found!'))
  }

  const packages = program.args.slice(1).filter((arg) => !arg.startsWith('-'))
  const packagesToUninstall = []

  // Remove declaration packages if the project is a TypeScript project
  if (await isTypeScriptProject()) {
    const dependencies = await listProjectDependencies()

    for (const pkg of packages) {
      if (pkg.startsWith('@types')) {
        continue
      }

      const declarationPkg = composeDeclarationPackageName(pkg)
      if (
        dependencies.includes(declarationPkg) &&
        !packages.includes(declarationPkg)
      ) {
        packagesToUninstall.push(declarationPkg)
      }
    }
  }

  let command = `${packageManager} ${program.args.join(' ')}`
  if (packagesToUninstall.length > 0) {
    command += ` ${packagesToUninstall.join(' ')}`
  }

  executeCommand(command)
}

/**
 * List the project `dependencies` and `devDependencies`.
 *
 * @returns {Promise<string[]>}
 */
async function listProjectDependencies() {
  const packageJson = await getProjectPackageJson()
  if (packageJson) {
    const { dependencies = {}, devDependencies = {} } = packageJson
    return [...Object.keys(dependencies), ...Object.keys(devDependencies)]
  }

  return []
}

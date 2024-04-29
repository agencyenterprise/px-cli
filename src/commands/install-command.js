import chalk from 'chalk'
import _ from 'lodash'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'
import { isTypeScriptProject } from '../utils/project.js'
import { composeTypesPackageName } from '../utils/typescript.js'

const DEV_FLAGS = ['-D', '--dev', '--save-dev']

/**
 * Install packages.
 *
 * This function installs the packages using the detected package manager. It
 * also installs the TypeScript types declaration packages for the installed
 * packages if the project is a TypeScript project.
 *
 * @param {import('commander').Command} program
 */
export async function installCommand(program) {
  const packageManager = await detectPackageManager()
  if (!packageManager) {
    return console.error(chalk.red('Package manager not found!'))
  }

  const packages = program.args.slice(1).filter((arg) => !arg.startsWith('-'))
  const declarationPackages = await getTypeScriptTypesPackages(packages)

  const isDevInstall = DEV_FLAGS.some((flag) => program.args.includes(flag))
  let installCommand = `${packageManager} ${program.args.join(' ')}`

  // Install types declaration packages in the same command if it's installing dev dependencies
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
 * Get TypeScript types declaration packages to be installed.
 *
 * On TypeScript projects, we need to install the TypeScript types declaration
 * packages for the packages being installed. This function will return the list
 * of declaration packages that need to be installed.
 *
 * If the project does not use TypeScript, it returns an empty array to skip
 * this step.
 *
 * @param {string[]} packages
 * @returns {Promise<string[]>}
 */
async function getTypeScriptTypesPackages(packages) {
  if (await isTypeScriptProject()) {
    // TODO Add a cache to avoid making multiple requests for the same package
    // https://www.npmjs.com/package/configstore
    const typesPackages = await Promise.all(
      _.uniq(packages).map(async (pkg) => {
        if (!pkg.startsWith('@types')) {
          console.debug(chalk.gray(`Checking if ${pkg} has a types package`))
          const typesPackage = composeTypesPackageName(pkg)

          if (await isPackageOnRegistry(typesPackage)) {
            console.debug(chalk.green(`Found types package for ${pkg}`))
            return typesPackage
          }
        }

        return null
      }),
    )

    return typesPackages.filter(Boolean)
  }

  return []
}

/**
 * Check if package is available on the npm registry.
 *
 * It returns whether the package is available on the npm registry or not. It
 * also checks if the package is deprecated.
 *
 * @param {String} packageName
 * @returns {Promise<boolean>}
 */
async function isPackageOnRegistry(packageName) {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`)
  if (!response.ok) {
    return false
  }

  // Verify if package is not deprecated (e.g. @types/dotenv)
  const { versions = {} } = await response.json()
  const latestVersion = Object.keys(versions).pop()
  const isDeprecated = !!versions[latestVersion].deprecated

  if (isDeprecated) {
    return false
  }

  return true
}

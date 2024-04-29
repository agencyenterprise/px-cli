import chalk from 'chalk'
import _ from 'lodash'

import { config } from '../config.js'
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
  const typesPackages = await getTypeScriptTypesPackages(_.uniq(packages))

  const isDevInstall = DEV_FLAGS.some((flag) => program.args.includes(flag))
  let installCommand = `${packageManager} ${program.args.join(' ')}`

  // Install types declaration packages in the same command if it's installing dev dependencies
  if (isDevInstall && typesPackages.length > 0) {
    installCommand += ` ${typesPackages.join(' ')}`
  }

  executeCommand(installCommand)

  if (!isDevInstall && typesPackages.length > 0) {
    const baseCommand = program.args[0]
    const declarationsCommand = `${packageManager} ${baseCommand} -D ${typesPackages.join(' ')}`
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
    /** @type {string[]} */
    const packagesWithTypes = config.get('packagesWithTypes')

    /** @type {string[]} */
    const packagesWithoutTypes = config.get('packagesWithoutTypes')

    /** @type {[string, string | null][]} */
    const verifiedPackages = await Promise.all(
      packages.map(async (pkgName) => {
        if (pkgName.startsWith('@types')) {
          // Return null to don't include the package in the list
          return [pkgName, null]
        }

        // Skip verification if the package is already in one of the lists
        const typesPkgName = composeTypesPackageName(pkgName)

        if (packagesWithTypes.includes(pkgName)) {
          return [pkgName, typesPkgName]
        }

        if (packagesWithoutTypes.includes(pkgName)) {
          return [pkgName, null]
        }

        if (await isPackageOnRegistry(typesPkgName)) {
          return [pkgName, typesPkgName]
        }

        return [pkgName, null]
      }),
    )

    // Update the config with the verified packages
    for (const [pkgName, typesPkg] of verifiedPackages) {
      if (pkgName.startsWith('@types')) {
        continue
      }

      if (typesPkg) {
        packagesWithTypes.push(pkgName)
      } else {
        packagesWithoutTypes.push(pkgName)
      }
    }

    config.set('packagesWithTypes', _.uniq(packagesWithTypes))
    config.set('packagesWithoutTypes', _.uniq(packagesWithoutTypes))

    return verifiedPackages
      .filter(([, typesPkgName]) => Boolean(typesPkgName))
      .map(([, typesPkgName]) => typesPkgName)
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

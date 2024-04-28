import { execSync } from 'node:child_process'

import chalk from 'chalk'

import { detectPackageManager } from '../detect-package-manager.js'

/**
 * Fallback command to forward the command to the detected package manager.
 *
 * @param {import('commander').Command} program
 */
export async function fallbackCommand(program) {
  const packageManager = await detectPackageManager()
  if (!packageManager) {
    return console.error(chalk.red('Package manager not found!'))
  }

  const command = program.args.join(' ')
  try {
    execSync(`${packageManager} ${command}`, { stdio: 'inherit' })
  } catch {
    // Error is resolved by the package manager
  }
}

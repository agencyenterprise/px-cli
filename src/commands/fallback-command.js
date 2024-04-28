import chalk from 'chalk'

import { detectPackageManager } from '../detect-package-manager.js'
import { executeCommand } from '../execute-command.js'

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

  try {
    const command = `${packageManager} ${program.args.join(' ')}`
    executeCommand(command)
  } catch {
    // Error is resolved by the package manager
  }
}

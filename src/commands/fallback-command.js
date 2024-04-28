import chalk from 'chalk'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'

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

  const command = `${packageManager} ${program.args.join(' ')}`
  executeCommand(command)
}

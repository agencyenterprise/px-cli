import { execSync } from 'node:child_process'

import chalk from 'chalk'

/**
 * Run the command in the terminal.
 *
 * @param {string} command
 */
export function executeCommand(command) {
  console.log(chalk.gray(command))
  execSync(command, { stdio: 'inherit' })
}

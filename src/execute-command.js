import { execSync } from 'node:child_process'

import chalk from 'chalk'

/**
 * Run the command in the terminal.
 *
 * This function will execute the command in the terminal and log the command
 * before executing it. Failures are handled by the package manager.
 *
 * @param {string} command
 */
export function executeCommand(command) {
  try {
    console.log(chalk.gray(command))
    execSync(command, { stdio: 'inherit' })
  } catch {
    // Errors are resolved by the package manager
  }
}

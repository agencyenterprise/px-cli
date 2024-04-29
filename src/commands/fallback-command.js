import chalk from 'chalk'

import { executeCommand } from '../execute-command.js'
import { detectPackageManager } from '../utils/package-manager.js'
import { getProjectPackageJson } from '../utils/project.js'

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

  let managerCommand = program.args.join(' ').trim()

  // Append "run" to the command if it's a script and the package manager is npm.
  // The other managers don't require the "run" keyword.
  if (packageManager === 'npm' && !managerCommand.startsWith('run')) {
    const commandName = program.args[0]
    const projectScripts = await loadProjectScripts()
    const isScript = projectScripts.includes(commandName)

    if (isScript) {
      managerCommand = `run ${managerCommand}`
    }
  }

  const command = `${packageManager} ${managerCommand}`
  executeCommand(command)
}

/** @returns {Promise<string[]>} */
async function loadProjectScripts() {
  const packageJson = await getProjectPackageJson()
  return packageJson?.scripts ? Object.keys(packageJson.scripts) : []
}

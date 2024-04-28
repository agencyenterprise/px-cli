#!/usr/bin/env node
import { execSync } from 'node:child_process'

import chalk from 'chalk'
import { Command } from 'commander'

import { detectPackageManager } from './detect-package-manager.js'

const program = new Command()

program
  .name('px')
  .description('Package manager helper for JavaScript projects')
  .version('0.0.1')

program
  .command('* <command>')
  .description('Forward the command to the package manager')
  .allowUnknownOption()
  .action(async () => {
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
  })

program.parse()

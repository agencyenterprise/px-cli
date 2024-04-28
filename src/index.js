#!/usr/bin/env node --no-warnings=ExperimentalWarning
import { Command } from 'commander'

import pkgMetadata from '../package.json' with { type: 'json' }
import { fallbackCommand } from './commands/fallback-command.js'
import { installCommand } from './commands/install-command.js'

const program = new Command()

program
  .name('px')
  .description('Package manager executor for JavaScript projects')
  .version(pkgMetadata.version)

program
  .command('install <packages...>')
  .description('install packages')
  .alias('i')
  .alias('add')
  .allowUnknownOption()
  .action(() => installCommand(program))

program
  .command('* <command>')
  .description('forward the command to the package manager')
  .allowUnknownOption()
  .action(() => fallbackCommand(program))

program.parse()

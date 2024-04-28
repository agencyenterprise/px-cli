#!/usr/bin/env node --no-warnings=ExperimentalWarning
import { Command } from 'commander'

import pkgMetadata from '../package.json' with { type: 'json' }
import { fallbackCommand } from './commands/fallback-command.js'

const program = new Command()

program
  .name('px')
  .description('Package manager executor for JavaScript projects')
  .version(pkgMetadata.version)

program
  .command('* <command>')
  .description('Forward the command to the package manager')
  .allowUnknownOption()
  .action(() => fallbackCommand(program))

program.parse()

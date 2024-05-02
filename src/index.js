#!/usr/bin/env node
import { Command } from 'commander'

import { fallbackCommand } from './commands/fallback-command.js'
import { installCommand } from './commands/install-command.js'
import { uninstallCommand } from './commands/uninstall-command.js'
import { packageJson } from './config.js'

const program = new Command()

program
  .name('px')
  .description('Package manager eXecutor for JavaScript projects.')
  .version(packageJson.version)

program
  .command('install [packages...]')
  .description('install packages')
  .alias('i')
  .alias('add')
  .allowUnknownOption()
  .action(() => installCommand(program))

program
  .command('uninstall [packages...]')
  .description('uninstall packages')
  .alias('un')
  .alias('remove')
  .alias('rm')
  .allowUnknownOption()
  .action(() => uninstallCommand(program))

program
  .command('* <command>')
  .description('forward the command to the package manager')
  .allowUnknownOption()
  .action(() => fallbackCommand(program))

program.parse()

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import * as Types from '../types'

export const processArguments = (): Types.Args => {
  const usage = '\nUsage: openapi2types -i <schema_path> -o <output_path>'
  const argv = yargs(hideBin(process.argv))
    .usage(usage)
    .option('i', {
      alias: 'input',
      describe: 'JSON schema path',
      type: 'string',
      demandOption: true,
    })
    .option('o', { alias: 'output', describe: 'Output path', type: 'string', demandOption: true })
    .check(function (argv: Types.Args) {
      if (argv.i.endsWith('.json')) {
        return true
      }
      throw new Error(chalk.red('Argument check failed: input file is not a .json format'))
    })
    .help(true).argv as Types.Args

  return argv
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

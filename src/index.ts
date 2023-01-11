import path from 'path'
import { WriteStream, createWriteStream, readFileSync } from 'fs'
import chalk from 'chalk'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import * as types from './types'

const usage = '\nUsage: openapi2types -i <schema_path> -o <output_path>'
const argv = yargs(hideBin(process.argv))
  .usage(usage)
  .option('i', { alias: 'input', describe: 'JSON schema path', type: 'string', demandOption: true })
  .option('o', { alias: 'output', describe: 'Output path', type: 'string', demandOption: true })
  .check(function (argv: { i: string; o: string }) {
    if (argv.i.endsWith('.json')) {
      return true
    }
    throw new Error(chalk.red('Argument check failed: input file is not a .json format'))
  })
  .help(true).argv as { i: string; o: string }

const schemaPath = path.resolve(process.cwd(), argv.i)
const typesPath = path.resolve(process.cwd(), argv.o)

const parseOpenApiPropertyType = (property: types.Property): string => {
  if (property.type === 'string') {
    return 'string'
  }
  if (property.type === 'integer') {
    return 'number'
  }
  if (property.type === 'array') {
    return `${property.items.$ref.split('/').reverse()[0]}[]`
  }
  return 'unknown'
}

const writeProperties = (stream: WriteStream, properties: Record<string, types.Property>) => {
  for (const property in properties) {
    const hasComment = properties[property].description || properties[property].format
    if (hasComment) {
      stream.write(`\t//`)
    }
    if (properties[property].format) {
      stream.write(` [${properties[property].format}]`)
    }
    if (properties[property].description) {
      stream.write(` ${properties[property].description}`)
    }
    if (hasComment) {
      stream.write('\n')
    }
    stream.write(`\t${property}: ${parseOpenApiPropertyType(properties[property])};\n`)
  }
}

const prepareDefinitionWithAllOf = (
  definition: string,
  definitions: Record<string, types.Definition>,
): { extendTypes: string } => {
  if (!definitions[definition].properties) {
    definitions[definition].properties = {}
  }
  const allOf = definitions[definition].allOf
  const extendTypes: string[] = []
  if (allOf) {
    for (const part of allOf) {
      if (part.$ref) {
        const definitionKey = part.$ref.split('/').reverse()[0]
        extendTypes.push(definitionKey)
      }
      if (part.properties) {
        definitions[definition].properties = {
          ...definitions[definition].properties,
          ...part.properties,
        }
      }
    }
  }
  if (extendTypes.length) {
    extendTypes.push('')
  }
  return { extendTypes: extendTypes.join(' & ') }
}

const writeDefinition = (
  stream: WriteStream,
  definition: string,
  definitions: Record<string, types.Definition>,
): void => {
  const { extendTypes } = prepareDefinitionWithAllOf(definition, definitions)
  const properties = definitions[definition].properties
  if (properties) {
    stream.write(`export type ${definition} = ${extendTypes}{\n`)
    writeProperties(stream, properties)
    stream.write(`}\n\n`)
  }
}

const parseDefinitions = (schema: types.Schema) => {
  const definitions: Record<string, types.Definition> = schema['definitions']
  const fileStream = createWriteStream(typesPath)
  for (const definition in definitions) {
    writeDefinition(fileStream, definition, definitions)
    console.log(
      `${chalk.greenBright('Definition has been written')} - ${chalk.blueBright(definition)}`,
    )
  }
  fileStream.close()
}

const schema: types.Schema = JSON.parse(readFileSync(schemaPath).toString())

parseDefinitions(schema)

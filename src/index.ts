#!/usr/bin/env node
import path from 'path';
import { createWriteStream, readFileSync } from 'fs';
import chalk from 'chalk';
import { parseV2types, parseV3types } from './core';
import { processArguments } from './utils';
import * as Types from './types';

const parsedArguments = processArguments();

const schemaPath = path.resolve(process.cwd(), parsedArguments.i);
const typesPath = path.resolve(process.cwd(), parsedArguments.o);

const main = (input: string, output: string) => {
  const schema: Types.Schema = JSON.parse(readFileSync(input).toString());
  if (!schema) {
    return console.log(chalk.yellowBright(`Schema file ${schemaPath} is empty`));
  }
  const writeStream = createWriteStream(output);
  const version = schema.swagger;
  console.log(chalk.bgBlueBright(`Starting parse ${input}`));
  if (version.startsWith('2')) {
    parseV2types(schema, writeStream);
  } else if (version.startsWith('3')) {
    parseV3types(schema, writeStream);
  }
  writeStream.close();
  console.log(chalk.bgGreenBright(`Types file was successfully generated ${output}`));
};

main(schemaPath, typesPath);

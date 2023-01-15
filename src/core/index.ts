import { WriteStream } from 'fs';
import chalk from 'chalk';
import * as Types from '../types';
import { capitalize } from '../utils';

const parseRefName = (value?: string) => capitalize(value?.split('/').reverse()[0] || '');

const parseOpenApiPropertyType = (property: Types.Property): string => {
  const parsedTypes: string[] = [];
  switch (property.type) {
    case 'string':
      parsedTypes.push('string');
      break;
    case 'integer':
      parsedTypes.push('number');
      break;
    case 'array':
      parsedTypes.push(`${parseRefName(property.items.$ref)}[]`);
      break;
    default:
      parsedTypes.push('unknown');
      break;
  }
  if (property.nullable) {
    parsedTypes.push('null');
  }
  return parsedTypes.join(' | ');
};

const writeProperties = (
  stream: WriteStream,
  properties: Types.Properties,
  required: Types.Definition['required'],
) => {
  for (const property in properties) {
    const hasComment = properties[property].description || properties[property].format;
    const isRequired = required?.includes(property) || !required?.length;
    const isRef = properties[property].$ref;
    if (hasComment) {
      stream.write(`\t//`);
    }
    if (properties[property].format) {
      stream.write(` [${properties[property].format}]`);
    }
    if (properties[property].description) {
      stream.write(` ${properties[property].description}`);
    }
    if (hasComment) {
      stream.write('\n');
    }
    stream.write('\t');
    if (properties[property].readOnly) {
      stream.write('readonly ');
    }
    stream.write(property);
    if (isRequired) {
      stream.write(': ');
    } else {
      stream.write('?: ');
    }
    if (isRef) {
      stream.write(parseRefName(properties[property].$ref));
    } else {
      stream.write(parseOpenApiPropertyType(properties[property]));
    }
    stream.write(';\n');
  }
};

const prepareDefinitionWithAllOf = (
  definition: string,
  definitions: Types.Definitions,
): { extendTypes: string } => {
  if (!definitions[definition]?.properties) {
    definitions[definition].properties = {};
  }
  const allOf = definitions[definition].allOf;
  const extendTypes: string[] = [];
  if (allOf) {
    for (const part of allOf) {
      if (part.$ref) {
        const definitionKey = parseRefName(part.$ref);
        extendTypes.push(definitionKey);
      }
      if (part.properties) {
        definitions[definition].properties = {
          ...definitions[definition].properties,
          ...part.properties,
        };
      }
    }
  }
  if (extendTypes.length) {
    extendTypes.push('');
  }
  return { extendTypes: extendTypes.join(' & ') };
};

const writeArrayType = (
  stream: WriteStream,
  definition: string,
  definitions: Types.Definitions,
) => {
  const ref = definitions[definition].items?.$ref;
  if (ref) {
    stream.write(`export type ${definition} = ${parseRefName(ref)}[]\n\n`);
  }
};

const writeObjectType = (
  stream: WriteStream,
  definition: string,
  definitions: Types.Definitions,
) => {
  const { extendTypes } = prepareDefinitionWithAllOf(definition, definitions);
  const properties = definitions[definition].properties;
  if (properties && Object.keys(properties).length) {
    stream.write(`export type ${capitalize(definition)} = ${extendTypes}{\n`);
    writeProperties(stream, properties, definitions[definition].required);
    stream.write(`}\n\n`);
  }
};

const writeType = (
  stream: WriteStream,
  definition: string,
  definitions: Types.Definitions,
): void => {
  if (definitions[definition].type === 'array') {
    return writeArrayType(stream, definition, definitions);
  }
  return writeObjectType(stream, definition, definitions);
};

export const parseV2types = (schema: Types.Schema, writeStream: WriteStream) => {
  const definitions = schema['definitions'];
  if (!definitions || !Object.keys(definitions).length) {
    return console.log(chalk.yellowBright('There are v2 no definitions in schema'));
  }
  for (const definition in definitions) {
    writeType(writeStream, definition, definitions);
    console.log(`${chalk.greenBright('Type has been written')} - ${chalk.blueBright(definition)}`);
  }
};

export const parseV3types = (schema: Types.Schema, writeStream: WriteStream) => {
  const componentsSchemas = schema.components?.schemas;
  if (!componentsSchemas || !Object.keys(componentsSchemas).length) {
    return console.log(chalk.yellowBright('There are no v3 components.schemas in schema'));
  }
  for (const componentsSchema in componentsSchemas) {
    writeType(writeStream, componentsSchema, componentsSchemas);
    console.log(
      `${chalk.greenBright('Type has been written')} - ${chalk.blueBright(componentsSchema)}`,
    );
  }
};

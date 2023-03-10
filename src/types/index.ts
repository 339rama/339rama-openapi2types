export type Args = { i: string; o: string };

export type Method = 'get' | 'put' | 'patch' | 'post' | 'delete';

export type HttpStatus =
  | '200'
  | '201'
  | '202'
  | '203'
  | '204'
  | '205'
  | '206'
  | '207'
  | '208'
  | '226'
  | '300'
  | '301'
  | '302'
  | '303'
  | '304'
  | '305'
  | '306'
  | '307'
  | '308'
  | '400'
  | '401'
  | '402'
  | '403'
  | '404'
  | '405'
  | '406'
  | '407'
  | '408'
  | '409'
  | '410'
  | '411'
  | '412'
  | '413'
  | '414'
  | '415'
  | '416'
  | '417'
  | '418'
  | '420'
  | '422'
  | '423'
  | '424'
  | '425'
  | '426'
  | '428'
  | '429'
  | '431'
  | '444'
  | '449'
  | '450'
  | '451'
  | '499'
  | '500'
  | '501'
  | '502'
  | '503'
  | '504'
  | '505'
  | '506'
  | '507'
  | '508'
  | '509'
  | '510'
  | '511'
  | '598'
  | '599';

export type Parameter = {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type: 'number' | 'string';
  format: string;
};

export type ResponseArray = {
  description: string;
  schema: {
    type: 'array';
    items: {
      $ref: string;
    };
  };
};

export type ResponseItem = {
  description: string;
  schema: {
    $ref: string;
  };
};

export type Response = ResponseArray | ResponseItem;

export type Path = Record<
  Method,
  {
    summary?: string;
    description?: string;
    parameters: Parameter[];
    tags: string[];
    responses: Record<HttpStatus, Response>;
  }
>;

export type Paths = Record<string, Path>;

export type Property =
  | {
      type: undefined;
      item: undefined;
      description: undefined;
      format: undefined;
      nullable: undefined;
      readOnly: undefined;
      $ref: string;
    }
  | {
      type: 'string' | 'integer';
      item: undefined;
      description?: string;
      format?: string;
      nullable?: boolean;
      readOnly?: boolean;
      $ref: undefined;
    }
  | {
      type: 'array';
      items: { $ref: string };
      description?: string;
      format?: string;
      nullable?: boolean;
      readOnly?: boolean;
      $ref: undefined;
    };

export type Properties = Record<string, Property>;

export type DefinitionWithProperties = {
  properties: Properties;
  type: undefined;
  allOf: undefined;
  items: undefined;
  required?: string[];
};

export type DefinitionWithArrayItems = {
  properties: Properties;
  type: 'array';
  allOf: undefined;
  items: { $ref: string };
  required: undefined;
};

export type AllOf =
  | { $ref: string; properties: undefined }
  | { $ref: undefined; properties: Properties };

export type DefinitionWithReference = {
  properties: undefined;
  type: 'object';
  allOf: AllOf[];
  items: undefined;
  required: string[];
};

export type Definition =
  | DefinitionWithProperties
  | DefinitionWithReference
  | DefinitionWithArrayItems;

export type Definitions = Record<string, Definition>;

export type Components = {
  schemas: Definitions;
};

export type Schema = {
  swagger: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  host: string;
  schemes: string[];
  basePath: string;
  produces: string[];
  paths: Paths;
  definitions?: Definitions;
  components?: Components;
};

import { AttributeDefinition } from "../../../../prisma/generated/client";

export type Failure = {
  code: string | number,
  message: string
};

export type Validator = {
  validate: (() => Promise<Boolean>)
  fail: (() => Failure)
};

export type Validation = (def: AttributeDefinition, input: string) => Validator;

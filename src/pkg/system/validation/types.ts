import { AttributeDefinition } from "../../../../prisma/generated/client";
import { ValidationError } from "./error";

export type Failure = ValidationError;

export type Validator = {
  validate: (() => Promise<Boolean>)
  fail: (() => Failure)
};

export type Validation = (def: AttributeDefinition, input: string) => Validator;

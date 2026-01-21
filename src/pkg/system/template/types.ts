import { AttributeDefinition } from "../../../../prisma/generated/client";
import { ValidationError } from "../../error/error";
import { NAAttributeDefinition } from "../dto/types";

export type Failure = ValidationError;

export type Validator = {
  validate: (() => Promise<boolean>)
  fail: (() => Failure)
};

export type ValidatorOption = {
  throwError: boolean
  insert: boolean
};

export type Validation = (
  def: AttributeDefinition | NAAttributeDefinition,
  input: string
) => Validator;

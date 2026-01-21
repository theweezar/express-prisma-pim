import { AttributeDefinition, AttributeValueType } from "../../../../prisma/generated/client";
import {
  NAAttributeDefinition,
  NAAttributeDefinitionRecord,
} from "../dto/types";
import { Validation, ValidatorOption } from "./types";
import * as rule from "./rule";
import _ from "../../_";
import { ValidationError } from "../../error/error";

export async function startValidationProcess(
  definition: AttributeDefinition | NAAttributeDefinition,
  input: unknown,
  validations: Validation[]
): Promise<string | ValidationError> {
  const inputValue = String(input).trim();
  for (const validationFn of validations) {
    const validation = validationFn(definition, inputValue);
    const result = await validation.validate();
    if (!result) {
      return validation.fail();
    }
  }
  return inputValue;
}

export async function validate(
  definitions: AttributeDefinition[],
  input: Map<string, unknown>,
  options: Partial<ValidatorOption> = {}
): Promise<true | ValidationError> {
  const _options = {
    throwError: true,
    insert: true,
    ...options
  };
  const defMap = _.indexBy(definitions, 'key');
  for (const [code, value] of input.entries()) {
    let def = defMap.get(code) || NAAttributeDefinitionRecord;

    if (def.attributeValueType === AttributeValueType.NA) def.key = code;

    const validations: Validation[] = [
      rule.notFound,
      rule.required,
      rule.mustBeBoolean,
      rule.mustBeNumber,
      rule.mustBeArray,
      rule.mustBeDatetime,
      rule.minLength,
      rule.maxLength,
    ];

    if (_options.insert) {
      validations.push(rule.primaryUnique);
    }

    const result = await startValidationProcess(def, value, validations);
    if (result instanceof Error) {
      if (_options.throwError) throw result;
      else return result;
    }
  }
  return true;
}
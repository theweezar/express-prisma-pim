import { AttributeDefinition } from "../../../../prisma/generated/client";
import { NA_AttributeDefinition } from "../dto/types";
import { Validation } from "./types";
import * as rule from "./rule";
import _ from "../../_";
import { ValidationError } from "./error";

export async function _validateValueFollowDefinition(
  definition: AttributeDefinition,
  input: unknown
): Promise<string | ValidationError> {
  const inputValue = String(input).trim();
  const validations: Validation[] = [
    rule.notFound,
    rule.required,
    rule.mustBeBoolean,
    rule.mustBeNumber,
    rule.mustBeArray,
    rule.mustBeDatetime,
    rule.minLength,
    rule.maxLength,
    rule.primaryUnique
  ];

  for (const initValidation of validations) {
    const validation = initValidation(definition, inputValue);
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
  throwError: boolean = true
): Promise<true | ValidationError> {
  const defMap = _.indexBy(definitions, 'key');
  for (const [code, value] of input.entries()) {
    let def = defMap.get(code);
    if (!def) {
      def = NA_AttributeDefinition;
      def.key = code;
    }
    const result = await _validateValueFollowDefinition(def, value);
    if (result instanceof Error) {
      if (throwError) throw result;
      else return result;
    }
  }
  return true;
}
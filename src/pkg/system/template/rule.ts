import {
  SystemEntityType,
  AttributeValueType
} from "../../../../prisma/generated/client";
import { Validation } from "./types";
import { ValidationError } from "../../error/error";
import attributeValueDTO from '../dto/attributeValue';
import _ from "../../_";

export const notFound: Validation = (def, input) => ({
  validate: async () => {
    if (def.systemEntityType === SystemEntityType.NA
      && def.attributeValueType === AttributeValueType.NA) {
      return false;
    }
    return true;
  },
  fail: () => new ValidationError(
    `Unknown attribute.`,
    `The attribute '${def.key}' does not exist.`
  )
});

export const required: Validation = (def, input) => ({
  validate: async () => {
    return !(
      (def.required || def.primary)
      && !_.hasValue(input)
    );
  },
  fail: () => new ValidationError(
    `Attribute is required.`,
    `The required attribute '${def.key}' is missing.`
  )
});

export const primaryUnique: Validation = (def, input) => ({
  validate: async () => {
    if (def.primary) {
      const value = await attributeValueDTO.getAttributeByTypeAndPrimary(def.systemEntityType, input);
      return !value;
    }
    return true;
  },
  fail: () => new ValidationError(
    `Primary attribute must be unique.`,
    `The primary attribute '${def.key}' is not unique.`
  )
});

export const minLength: Validation = (def, input) => ({
  validate: async () => {
    return !(def.minlength && input.length < def.minlength);
  },
  fail: () => new ValidationError(
    `String must be at least the minimum length.`,
    `The value '${input}' has ${input.length} characters but minimum for '${def.key}' is ${def.minlength}.`
  )
});

export const maxLength: Validation = (def, input) => ({
  validate: async () => {
    return !(def.maxlength && input.length > def.maxlength);
  },
  fail: () => new ValidationError(
    `String must not exceed the maximum length.`,
    `The value '${input}' has ${input.length} characters but maximum for '${def.key}' is ${def.maxlength}.`
  )
});

export const mustBeBoolean: Validation = (def, input) => ({
  validate: async () => {
    if (def.attributeValueType === AttributeValueType.BOOLEAN && _.hasValue(input)) {
      return [true, 'true', false, 'false'].some(cst => cst === input);
    }
    return true;
  },
  fail: () => new ValidationError(
    `Value must be a boolean.`,
    `The value '${input}' for '${def.key}' is not a valid boolean. Accepted values: true, false, 'true', 'false'.`
  )
});

export const mustBeNumber: Validation = (def, input) => ({
  validate: async () => {
    return !(
      def.attributeValueType === AttributeValueType.NUMBER
      && _.hasValue(input)
      && isNaN(Number(input))
    );
  },
  fail: () => new ValidationError(
    `Value must be a number.`,
    `The value '${input}' for '${def.key}' cannot be converted to a number.`
  )
});

export const mustBeArray: Validation = (def, input) => ({
  validate: async () => {
    if (def.attributeValueType === AttributeValueType.ARRAY && _.hasValue(input)) {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return true;
      } catch (error) { }
      return false;
    }
    return true;
  },
  fail: () => new ValidationError(
    `Value must be an array.`,
    `The value '${input}' for '${def.key}' is not a valid JSON array.`
  )
});

export const mustBeDatetime: Validation = (def, input) => ({
  validate: async () => {
    return !(
      (
        def.attributeValueType === AttributeValueType.DATE
        || def.attributeValueType === AttributeValueType.DATETIME
      )
      && _.hasValue(input)
      && isNaN(Date.parse(input))
    );
  },
  fail: () => new ValidationError(
    `Value must be a valid date or datetime.`,
    `The value '${input}' for '${def.key}' cannot be parsed as a valid date or datetime.`
  )
});
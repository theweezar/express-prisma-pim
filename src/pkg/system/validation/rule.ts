import {
  SystemEntityType,
  AttributeValueType
} from "../../../../prisma/generated/client";
import { Validation } from "./types";

export const notFound: Validation = (def, input) => ({
  validate: async () => {
    if (def.systemEntityType === SystemEntityType.NA
      && def.attributeValueType === AttributeValueType.NA) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Unknown attribute '${def.key}'.`
  })
});

export const required: Validation = (def, input) => ({
  validate: async () => {
    if (def.required && (!input || input === '')) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' (${def.label}) is required.`
  })
});

export const primaryUnique: Validation = (def, input) => ({
  validate: async () => {
    // TODO: Move Validate uniqueness to another function, use find ...or...
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}': (${input}) is not unique.`
  })
});

export const minLength: Validation = (def, input) => ({
  validate: async () => {
    if (def.minlength && input.length < def.minlength) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' must be at least ${def.minlength} characters.`
  })
});

export const maxLength: Validation = (def, input) => ({
  validate: async () => {
    if (def.maxlength && input.length > def.maxlength) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' must be at most ${def.maxlength} characters.`
  })
});

export const mustBeBoolean: Validation = (def, input) => ({
  validate: async () => {
    if (def.attributeValueType === AttributeValueType.BOOLEAN) {
      return [true, 'true', false, 'false'].some(cst => cst === input);
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' (${def.label}) must be a boolean.`
  })
});

export const mustBeNumber: Validation = (def, input) => ({
  validate: async () => {
    if (def.attributeValueType === AttributeValueType.NUMBER && isNaN(Number(input))) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' (${def.label}) must be a number.`
  })
});

export const mustBeArray: Validation = (def, input) => ({
  validate: async () => {
    if (def.attributeValueType === AttributeValueType.ARRAY) {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return true;
      } catch (error) { }
    }
    return false;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' (${def.label}) must be an array.`
  })
});

export const mustBeDatetime: Validation = (def, input) => ({
  validate: async () => {
    if (
      (
        def.attributeValueType === AttributeValueType.DATE
        || def.attributeValueType === AttributeValueType.DATETIME
      )
      && isNaN(Date.parse(input))
    ) {
      return false;
    }
    return true;
  },
  fail: () => ({
    code: def.key,
    message: `Attribute '${def.key}' (${def.label}) must be a valid date or datetime.`
  })
});
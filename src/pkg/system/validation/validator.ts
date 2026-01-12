import { AttributeDefinition } from "../../../../prisma/generated/client";

function validateInputType(input: unknown): asserts input is Map<string, unknown> {
  if (!(input instanceof Map)) throw new Error('Input must be a Map<string, unknown>')
}

function _validateAttributeDefinition(
  definition: AttributeDefinition,
  input: unknown
) {
  const inputValue = String(input).trim();

  // Validate required fields
  if (definition.required && (!inputValue || inputValue === '')) {
    throw new Error(
      `Attribute '${definition.key}' (${definition.label}) is required`
    );
  }

  // TODO: Move Validate uniqueness to another function, use find ...or...
  // if (definition.unique && inputValue) { }

  // Validate length constraints
  if (inputValue) {
    if (definition.minlength && inputValue.length < definition.minlength) {
      throw new Error(
        `Attribute '${definition.key}' must be at least ${definition.minlength} characters.`
      );
    }
    if (definition.maxlength && inputValue.length > definition.maxlength) {
      throw new Error(
        `Attribute '${definition.key}' must be at most ${definition.maxlength} characters.`
      );
    }
  } else if (definition.minlength && definition.minlength > 0) {
    throw new Error(
      `Attribute '${definition.key}' must be at least ${definition.minlength} characters.`
    );
  }

  return inputValue;
}

function validateEntityDefinition(
  definitions: AttributeDefinition[],
  input: Map<string, unknown>
) {
  const defMap = new Map(definitions.map(d => [d.key, d]));
  for (const [code, value] of input.entries()) {
    const def = defMap.get(code);
    if (!def) throw new Error(`Unknown attribute: ${code}`);
    _validateAttributeDefinition(def, value)
  }
}

export function validate(
  definitions: AttributeDefinition[],
  input: Map<string, unknown>
) {
  validateInputType(input);
  validateEntityDefinition(definitions, input);
}
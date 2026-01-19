import {
  AttributeDefinition,
  SystemEntityType,
  AttributeValueType
} from '../prisma/generated/client';
import attributeDef from '../prisma/json/attributeDef.json';

export function createMockAttributeDefinitions(): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];

  attributeDef.forEach(entity => {
    entity.definition.forEach((attr, i) => {
      definitions.push({
        ID: i,
        key: attr.key,
        label: attr.label,
        systemEntityType: entity.type as SystemEntityType,
        attributeValueType: attr.attributeValueType as AttributeValueType,
        primary: attr.primary || false,
        required: attr.required || false,
        unique: attr.unique || false,
        minlength: attr.minlength || null,
        maxlength: attr.maxlength || null
      });
    });
  });

  return definitions;
}

export function createMockEntity(): Map<string, unknown> {
  return new Map([
    ['productID', 'tech-sling-099'],
    ['productName', 'Pro-Travel Sling Bag'],
    ['material', '70% NYLON + 30% POLYESTER'],
    ['dimensionHeight', '27.0'],
    ['dimensionWidth', '18.0'],
    ['dimensionLength', '6.5'],
    ['weight', '0.32'],
    ['active', 'true'],
  ]);
}
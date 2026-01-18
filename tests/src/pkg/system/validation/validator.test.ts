import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  AttributeDefinition,
  SystemEntityType,
  AttributeValueType
} from '../../../../../prisma/generated/client';
import {
  _validateValueFollowDefinition,
  validate
} from '../../../../../src/pkg/system/validation/validator';
import attributeDef from '../../../../../prisma/json/attributeDef.json';

let mockAttributeDefinitions: AttributeDefinition[];

function createMockAttributeDefinitions(): AttributeDefinition[] {
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

function createMockEntity(): Map<string, unknown> {
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

describe('Validator', () => {
  beforeAll(() => {
    mockAttributeDefinitions = createMockAttributeDefinitions();
  });

  describe('_validateValueFollowDefinition', () => {
    it('should return trimmed string value for valid input', async () => {
      const productIDDef = mockAttributeDefinitions.find(d => d.key === 'productID')!;
      const result = await _validateValueFollowDefinition(productIDDef, '  tech-sling-099  ');
      expect(result).toBe('tech-sling-099');
    });

    it('should return Error for missing required field', async () => {
      const productIDDef = mockAttributeDefinitions.find(d => d.key === 'productID')!;
      const result = await _validateValueFollowDefinition(productIDDef, '');
      expect(result).toBeInstanceOf(Error);
    });

    it('should handle boolean type validation', async () => {
      const activeDef = mockAttributeDefinitions.find(d => d.key === 'active')!;
      const result = await _validateValueFollowDefinition(activeDef, 'true');
      expect(result).toBe('true');
    });

    it('should handle number type validation', async () => {
      const heightDef = mockAttributeDefinitions.find(d => d.key === 'dimensionHeight')!;
      const result = await _validateValueFollowDefinition(heightDef, '27.0');
      expect(result).toBe('27.0');
    });
  });

  describe('validate', () => {
    it('should validate all values in tech-sling map successfully', async () => {
      const techSlingMap = createMockEntity();
      const result = await validate(mockAttributeDefinitions, techSlingMap, false);
      expect(result).toBe(true);
    });

    it('should return Error when throwError is false', async () => {
      const invalidMap = new Map([
        ['productID', ''], // Empty required field
        ['productName', 'Test'],
      ]);
      const result = await validate(mockAttributeDefinitions, invalidMap, false);
      expect(result).toBeInstanceOf(Error);
    });

    it('should throw Error when throwError is true', async () => {
      const invalidMap = new Map([
        ['productID', ''], // Empty required field
      ]);
      await expect(validate(mockAttributeDefinitions, invalidMap, true)).rejects.toThrow();
    });

    it('should handle unknown attribute keys gracefully', async () => {
      const mapWithUnknown = new Map([
        ['productID', 'test-001'],
        ['productName', 'Test Product'],
        ['unknownField', 'some value'],
      ]);
      const result = await validate(mockAttributeDefinitions, mapWithUnknown, false);
      expect(result).toBe(true);
    });
  });
});
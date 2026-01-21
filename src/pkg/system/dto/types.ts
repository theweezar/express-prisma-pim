import {
  SystemEntity,
  SystemEntityType,
  AttributeValue,
  AttributeValueType,
  AttributeDefinition,
  AttributeGroupDefinition,
  AttributeGroupAssignment,
} from '../../../../prisma/generated/client';
import { AttributeGroupDefinitionCreateInput } from '../../../../prisma/generated/models';

export type AttributeValueJoinAttributeDefinition = AttributeValue & {
  attributeDefinition: AttributeDefinition;
};

export type AttributeGroupAssignmentJoinAttributeDefinition = AttributeGroupAssignment & {
  attributeDefinition: AttributeDefinition;
};

export type SystemEntityJoinAttributes = SystemEntity & {
  attributeValues: AttributeValueJoinAttributeDefinition[];
};

export type AttributeGroupDefinitionJoinAssignments = AttributeGroupDefinition & {
  attributeGroupAssignments: AttributeGroupAssignmentJoinAttributeDefinition[]
};

export type AttributeGroupAssignmentCreateManyInput = {
  groupDef: AttributeGroupDefinition
  attrDef: AttributeDefinition
  ordinal: number
};

export type SystemEntityWithAttributeValues = SystemEntity & {
  attributeValues: AttributeValueJoinAttributeDefinition[];
};

export type AttributeByTypeAndPrimary = AttributeValue & {
  attributeDefinition: AttributeDefinition;
  entity: SystemEntity & {
    attributeValues: AttributeValueJoinAttributeDefinition[];
  };
};

export type NAAttributeDefinition = Omit<AttributeDefinition, 'ID' | 'createdAt' | 'updatedAt' | 'version'>;

export const NAAttributeDefinitionRecord: NAAttributeDefinition = {
  label: '',
  key: '',
  systemEntityType: SystemEntityType.NA,
  attributeValueType: AttributeValueType.NA,
  primary: false,
  required: false,
  unique: false,
  minlength: null,
  maxlength: null
} as const;

/**
 * Utility type to make certain keys of a type optional
 * Omit<T, K>: Creates a type by omitting keys K from type T
 * Partial<Pick<T, K>>: Creates a type with only keys K from type T, making them optional
 * The intersection (&) combines these two types to form the final type
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AttributeGroupDefinitionOptOrdinalCreateInput = Optional<AttributeGroupDefinitionCreateInput, 'ordinal'>;

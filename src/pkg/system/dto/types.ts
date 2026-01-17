import {
  SystemEntity,
  AttributeValue,
  AttributeDefinition,
  AttributeGroupDefinition,
  AttributeGroupAssignment
} from '../../../../prisma/generated/client';

export type SystemEntityJoinAttributes = SystemEntity & {
  attributeValues: (
    AttributeValue & {
      attributeDefinition: AttributeDefinition;
    }
  )[];
};

export type AttributeGroupDefinitionJoinAssignments = AttributeGroupDefinition & {
  attributeGroupAssignments: (
    AttributeGroupAssignment & {
      attributeDefinition: AttributeDefinition;
    }
  )[]
};

export type AttributeGroupAssignmentCreateManyInput = {
  groupDef: AttributeGroupDefinition
  attrDef: AttributeDefinition
  ordinal: number
};

export type AttributeValueJoinDefinition = AttributeValue & {
  attributeDefinition: AttributeDefinition;
};

export type SystemEntityWithAttributeValues = SystemEntity & {
  attributeValues: AttributeValueJoinDefinition[];
};

export type AttributeByTypeAndPrimary = AttributeValue & {
  attributeDefinition: AttributeDefinition;
  entity: SystemEntity & {
    attributeValues: AttributeValueJoinDefinition[];
  };
};

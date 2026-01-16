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

export type AttributeGroupWithDefinitions = AttributeGroupDefinition & {
  attributeGroupAssignments: (AttributeGroupAssignment & {
    attributeDefinition: AttributeDefinition;
  })[];
};
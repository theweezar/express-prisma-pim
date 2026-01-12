import { prisma } from '../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition
} from '../../../prisma/generated/client';
import {
  AttributeDefinitionCreateInput,
  AttributeValueCreateManyInput
} from '../../../prisma/generated/models';
import { validate } from './validation/validator';
import _ from '../_';

async function queryAttributeDefinition(type: SystemEntityType) {
  return await prisma.attributeDefinition.findMany({
    where: {
      systemEntityType: type
    }
  });
}

async function querySystemEntity(type: SystemEntityType, UUID: string) {
  return await prisma.systemEntity.findUnique({
    where: {
      UUID,
      systemEntityType: type
    },
    include: {
      attributeValues: {
        include: {
          attributeDefinition: true,
        },
      },
    },
  });
}

async function createAttributeDefinition(input: AttributeDefinitionCreateInput) {
  return await prisma.attributeDefinition.create({
    data: input,
  });
}

async function createAttributeDefinitions(input: AttributeDefinitionCreateInput[]) {
  return await prisma.attributeDefinition.createMany({
    data: input,
  });
}

async function _createSystemEntity(
  definitions: AttributeDefinition[],
  type: SystemEntityType,
  input: Map<string, string>
) {
  return await prisma.$transaction(async (prisma) => {
    // Create the system entity
    const systemEntity = await prisma.systemEntity.create({
      data: {
        systemEntityType: type,
      },
    });

    // Merge input and template
    const attributeValueData: AttributeValueCreateManyInput[] = [];

    for (const definition of definitions) {
      const inputValue = input.get(definition.key);

      attributeValueData.push({
        value: inputValue,
        entityUUID: systemEntity.UUID,
        attributeID: definition.ID,
      });
    }

    // Create all attribute values
    if (attributeValueData.length > 0) {
      await prisma.attributeValue.createMany({
        data: attributeValueData,
      });
    }
  });
}

// createSystemEntity(SystemEntityType.PRODUCT, {pid: bla bla, name: vvv})
async function createSystemEntity(
  type: SystemEntityType,
  input: Map<string, unknown>
) {
  // Get attribute definitions for this entity type (template)
  const attributeDefinitions = await queryAttributeDefinition(type);

  validate(attributeDefinitions, input);

  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);

  await _createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function querySystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
): Promise<SystemEntity | null> {
  const result = await prisma.attributeValue.findFirst({
    where: {
      entity: {
        systemEntityType: type
      },
      attributeDefinition: {
        primary: true
      },
      value: primaryValue
    },
    include: {
      entity: {
        include: {
          attributeValues: {
            include: {
              attributeDefinition: true
            }
          }
        }
      }
    }
  })
  return (result && result.entity) ? result.entity : null;
}

async function _updateSystemEntity(
  entity: SystemEntity,
  definitions: AttributeDefinition[],
  input: Map<string, string>
) {
  return await prisma.$transaction(async (prisma) => {
    for (const definition of definitions) {
      const inputValue = input.get(definition.key);
      await prisma.attributeValue.upsert({
        where: {
          entityUUID_attributeID: {
            entityUUID: entity.UUID,
            attributeID: definition.ID,
          },
        },
        update: {
          value: inputValue,
        },
        create: {
          value: inputValue,
          entityUUID: entity.UUID,
          attributeID: definition.ID,
        },
      });
    }
  });
}

async function updateSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string,
  input: Map<string, unknown>
) {
  // Check if system entity exists
  const existingEntity = await querySystemEntityByPrimary(type, primaryValue);
  if (!existingEntity) {
    throw new Error(`System entity with primary ${primaryValue} not found`);
  }

  const attributeDefinitions = await queryAttributeDefinition(type);

  validate(attributeDefinitions, input);

  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);

  await _updateSystemEntity(existingEntity, attributeDefinitions, inputTemplate);
}

async function _deleteSystemEntity(entity: SystemEntity) {
  await prisma.$transaction(async (prisma) => {
    // First delete all attribute values associated with this entity
    await prisma.attributeValue.deleteMany({
      where: {
        entityUUID: entity.UUID,
      },
    });

    // Then delete the system entity itself
    await prisma.systemEntity.delete({
      where: {
        UUID: entity.UUID,
        systemEntityType: entity.systemEntityType,
      },
    });
  });
}

async function deleteSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  // Check if system entity exists
  const existingEntity = await querySystemEntityByPrimary(type, primaryValue);
  if (!existingEntity) {
    throw new Error(`System entity with primary ${primaryValue} not found`);
  }

  await _deleteSystemEntity(existingEntity);
}


export default {
  createAttributeDefinition,
  createAttributeDefinitions,
  querySystemEntity,
  querySystemEntityByPrimary,
  createSystemEntity,
  updateSystemEntityByPrimary,
  deleteSystemEntityByPrimary
};
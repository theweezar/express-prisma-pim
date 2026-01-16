import { prisma } from '../../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition
} from '../../../../prisma/generated/client';
import {
  AttributeValueCreateManyInput
} from '../../../../prisma/generated/models';
import AttributeRepository from './AttributeRepository';
import { SystemEntityJoinAttributes } from './types';

async function getSystemEntityByID(
  type: SystemEntityType,
  UUID: string
): Promise<SystemEntityJoinAttributes | null> {
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

async function createSystemEntity(
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
      await AttributeRepository.createMany(attributeValueData);
    }
  });
}

async function updateSystemEntity(
  entity: SystemEntity,
  definitions: AttributeDefinition[],
  input: Map<string, string>
) {
  return await prisma.$transaction(async () => {
    for (const definition of definitions) {
      const inputValue = input.get(definition.key);
      AttributeRepository.upsertValue(entity, definition, inputValue)
    }
  });
}

async function deleteSystemEntity(entity: SystemEntity) {
  await prisma.$transaction(async (prisma) => {
    // First delete all attribute values associated with this entity
    await AttributeRepository.deleteMany(entity);

    // Then delete the system entity itself
    await prisma.systemEntity.delete({
      where: {
        UUID: entity.UUID,
        systemEntityType: entity.systemEntityType,
      },
    });
  });
}

export default {
  getSystemEntityByID,
  createSystemEntity,
  updateSystemEntity,
  deleteSystemEntity
}
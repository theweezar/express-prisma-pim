import { prisma } from '../../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition
} from '../../../../prisma/generated/client';
import {
  AttributeValueCreateManyInput
} from '../../../../prisma/generated/models';

async function createMany(data: AttributeValueCreateManyInput[]) {
  await prisma.attributeValue.createMany({
    data: data,
  });
}

async function getAttributeDefinitions(type: SystemEntityType) {
  return await prisma.attributeDefinition.findMany({
    where: {
      systemEntityType: type
    }
  });
}

async function getAttributeDefinition(
  type: SystemEntityType,
  ID: number | string
): Promise<AttributeDefinition | null> {
  return await prisma.attributeDefinition.findUnique({
    where: {
      ID: Number(ID),
      systemEntityType: type
    }
  });
}

async function getAttributeByTypeAndPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  return await prisma.attributeValue.findFirst({
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
  });
}

async function upsertValue(
  entity: SystemEntity,
  definition: AttributeDefinition,
  value?: string
) {
  await prisma.attributeValue.upsert({
    where: {
      entityUUID_attributeID: {
        entityUUID: entity.UUID,
        attributeID: definition.ID,
      },
    },
    update: {
      value: value,
    },
    create: {
      value: value,
      entityUUID: entity.UUID,
      attributeID: definition.ID,
    },
  });
}

async function deleteMany(entity: SystemEntity) {
  await prisma.attributeValue.deleteMany({
    where: {
      entityUUID: entity.UUID,
    },
  });
}

export default {
  createMany,
  getAttributeDefinitions,
  getAttributeDefinition,
  getAttributeByTypeAndPrimary,
  upsertValue,
  deleteMany
}
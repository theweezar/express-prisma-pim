import {
  DTOPrismaClient,
  prisma,
} from '../../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition,
} from '../../../../prisma/generated/client';
import {
  AttributeValueCreateManyInput
} from '../../../../prisma/generated/models';

async function getAttributeDefinitions(
  type: SystemEntityType
) {
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

async function createMany(
  pc: DTOPrismaClient,
  data: AttributeValueCreateManyInput[]
) {
  await pc.attributeValue.createMany({
    data: data,
  });
}

async function upsertValue(
  pc: DTOPrismaClient,
  entity: SystemEntity,
  definition: AttributeDefinition,
  value?: string
) {
  await pc.attributeValue.upsert({
    where: {
      entityID_attributeID: {
        entityID: entity.ID,
        attributeID: definition.ID,
      },
    },
    update: {
      value: value,
    },
    create: {
      value: value,
      entityID: entity.ID,
      attributeID: definition.ID,
    },
  });
}

async function deleteMany(
  pc: DTOPrismaClient,
  entity: SystemEntity
) {
  await pc.attributeValue.deleteMany({
    where: {
      entityID: entity.ID,
    },
  });
}

export default {
  getAttributeDefinitions,
  getAttributeDefinition,
  getAttributeByTypeAndPrimary,
  createMany: async (
    data: AttributeValueCreateManyInput[]
  ) => {
    await createMany(prisma, data);
  },
  upsertValue: async (
    entity: SystemEntity,
    definition: AttributeDefinition,
    value?: string
  ) => {
    await upsertValue(prisma, entity, definition, value);
  },
  deleteMany: async (
    entity: SystemEntity
  ) => {
    await deleteMany(prisma, entity);
  },
  wrapTx: (tx: DTOPrismaClient) => {
    return {
      createMany: async (
        data: AttributeValueCreateManyInput[]
      ) => {
        await createMany(tx, data);
      },
      upsertValue: async (
        entity: SystemEntity,
        definition: AttributeDefinition,
        value?: string
      ) => {
        await upsertValue(tx, entity, definition, value);
      },
      deleteMany: async (
        entity: SystemEntity
      ) => {
        await deleteMany(tx, entity);
      }
    }
  }
};
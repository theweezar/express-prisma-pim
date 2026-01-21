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

async function getByTypeAndPrimary(
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
    }
  });
}

async function getManyByTypeAndPrimary(
  type: SystemEntityType,
  primaryValues: string[]
) {
  return await prisma.attributeValue.findMany({
    where: {
      entity: {
        systemEntityType: type
      },
      attributeDefinition: {
        primary: true
      },
      value: {
        in: primaryValues
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
  getByTypeAndPrimary,
  getManyByTypeAndPrimary,
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
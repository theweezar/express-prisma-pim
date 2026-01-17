import { DTOPrismaClient, prisma } from '../../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType
} from '../../../../prisma/generated/client';
import { SystemEntityJoinAttributes } from './types';

async function getSystemEntityByID(
  type: SystemEntityType,
  ID: number | string
): Promise<SystemEntityJoinAttributes | null> {
  return await prisma.systemEntity.findUnique({
    where: {
      ID: Number(ID),
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

async function getSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
): Promise<SystemEntityJoinAttributes | null> {
  return await prisma.systemEntity.findFirst({
    where: {
      systemEntityType: type,
      attributeValues: {
        some: {
          value: primaryValue,
          attributeDefinition: {
            primary: true
          }
        }
      }
    },
    include: {
      attributeValues: {
        include: {
          attributeDefinition: true
        }
      }
    }
  })
}

async function create(
  pc: DTOPrismaClient,
  type: SystemEntityType
) {
  return await pc.systemEntity.create({
    data: {
      systemEntityType: type,
    },
  });
}

async function remove(
  pc: DTOPrismaClient,
  entity: SystemEntity
) {
  await pc.systemEntity.delete({
    where: {
      ID: entity.ID,
      systemEntityType: entity.systemEntityType,
    },
  });
}

export default {
  getSystemEntityByID,
  getSystemEntityByPrimary,
  create: async (
    type: SystemEntityType
  ) => {
    return await create(prisma, type);
  },
  remove: async (
    entity: SystemEntity
  ) => {
    await remove(prisma, entity);
  },
  wrapTx: (tx: DTOPrismaClient) => {
    return {
      create: async (type: SystemEntityType) => {
        return await create(tx, type);
      },
      remove: async (entity: SystemEntity) => {
        return await remove(tx, entity);
      },
    }
  }
}
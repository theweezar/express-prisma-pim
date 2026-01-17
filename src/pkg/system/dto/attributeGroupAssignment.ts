import { DTOPrismaClient, prisma } from '../../../../prisma/connection';
import {
  AttributeDefinition,
  AttributeGroupDefinition,
  AttributeGroupAssignment
} from '../../../../prisma/generated/client';
import { AttributeGroupAssignmentCreateManyInput } from './types';

async function create(
  pc: DTOPrismaClient,
  groupDef: AttributeGroupDefinition,
  attrDef: AttributeDefinition,
  ordinal: number
): Promise<AttributeGroupAssignment> {
  return await pc.attributeGroupAssignment.create({
    data: {
      attributeGroupDefinitionID: groupDef.ID,
      attributeDefinitionID: attrDef.ID,
      ordinal: ordinal
    }
  });
}

async function createMany(
  pc: DTOPrismaClient,
  data: AttributeGroupAssignmentCreateManyInput[]
) {
  const _data = data.map(obj => ({
    attributeGroupDefinitionID: obj.groupDef.ID,
    attributeDefinitionID: obj.attrDef.ID,
    ordinal: obj.ordinal
  }));
  return await pc.attributeGroupAssignment.createMany({
    data: _data
  });
}

async function remove(
  pc: DTOPrismaClient,
  groupDef: AttributeGroupDefinition,
  attrDef: AttributeDefinition,
) {
  await pc.attributeGroupAssignment.deleteMany({
    where: {
      attributeGroupDefinitionID: groupDef.ID,
      attributeDefinitionID: attrDef.ID,
    }
  });
}

export default {
  create: async (
    groupDef: AttributeGroupDefinition,
    attrDef: AttributeDefinition,
    ordinal: number
  ) => {
    return await create(prisma, groupDef, attrDef, ordinal);
  },
  createMany: async (
    data: AttributeGroupAssignmentCreateManyInput[]
  ) => {
    return await createMany(prisma, data);
  },
  remove: async (
    groupDef: AttributeGroupDefinition,
    attrDef: AttributeDefinition
  ) => {
    return await remove(prisma, groupDef, attrDef);
  },
  wrapTx: (tx: DTOPrismaClient) => {
    return {
      create: async (
        groupDef: AttributeGroupDefinition,
        attrDef: AttributeDefinition,
        ordinal: number
      ) => {
        return await create(tx, groupDef, attrDef, ordinal);
      },
      createMany: async (
        data: AttributeGroupAssignmentCreateManyInput[]
      ) => {
        return await createMany(tx, data);
      },
      remove: async (
        groupDef: AttributeGroupDefinition,
        attrDef: AttributeDefinition
      ) => {
        return await remove(tx, groupDef, attrDef);
      }
    }
  }
}
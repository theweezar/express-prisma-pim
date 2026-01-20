import { DTOPrismaClient, prisma } from '../../../../prisma/connection';
import {
  AttributeGroupDefinition,
  SystemEntityType
} from '../../../../prisma/generated/client';
import {
  AttributeGroupDefinitionCreateInput,
  AttributeGroupDefinitionCreateManyInput,
} from '../../../../prisma/generated/models';
import { AttributeGroupDefinitionJoinAssignments } from './types';

async function create(
  pc: DTOPrismaClient,
  group: AttributeGroupDefinitionCreateInput
): Promise<AttributeGroupDefinition> {
  return await pc.attributeGroupDefinition.create({
    data: group
  });
}

async function createMany(
  pc: DTOPrismaClient,
  groups: AttributeGroupDefinitionCreateManyInput[]
) {
  return await pc.attributeGroupDefinition.createMany({
    data: groups
  });
}

async function createManyAndReturn(
  pc: DTOPrismaClient,
  groups: AttributeGroupDefinitionCreateManyInput[]
): Promise<AttributeGroupDefinition[]> {
  return await pc.attributeGroupDefinition.createManyAndReturn({
    data: groups
  });
}

async function getByID(ID: number | string): Promise<AttributeGroupDefinition | null> {
  return await prisma.attributeGroupDefinition.findUnique({
    where: {
      ID: Number(ID)
    }
  });
}

async function getGroupsByEntityType(
  type: SystemEntityType
): Promise<AttributeGroupDefinition[]> {
  return await prisma.attributeGroupDefinition.findMany({
    where: {
      systemEntityType: type
    }
  });
}

async function getGroupsJoinAssignmentsByEntityType(
  type: SystemEntityType
): Promise<AttributeGroupDefinitionJoinAssignments[]> {
  return await prisma.attributeGroupDefinition.findMany({
    where: {
      systemEntityType: type
    },
    include: {
      attributeGroupAssignments: {
        include: {
          attributeDefinition: true
        },
        orderBy: {
          ordinal: "asc"
        }
      }
    },
    orderBy: {
      ordinal: "asc"
    }
  });
}

async function countGroupsForEntityType(
  type: SystemEntityType
): Promise<number> {
  return await prisma.attributeGroupDefinition.count({
    where: {
      systemEntityType: type
    }
  });
}

async function getGroupJoinAssignmentsByID(
  type: SystemEntityType,
  ID: number | string
): Promise<AttributeGroupDefinitionJoinAssignments | null> {
  return await prisma.attributeGroupDefinition.findUnique({
    where: {
      ID: Number(ID),
      systemEntityType: type
    },
    include: {
      attributeGroupAssignments: {
        include: {
          attributeDefinition: true
        }
      }
    }
  });
}

async function update(
  pc: DTOPrismaClient,
  groupDef: AttributeGroupDefinition,
  updates: Partial<AttributeGroupDefinitionCreateInput>
): Promise<AttributeGroupDefinition> {
  return await pc.attributeGroupDefinition.update({
    where: { ID: groupDef.ID },
    data: updates
  });
}

async function remove(
  pc: DTOPrismaClient,
  groupDef: AttributeGroupDefinition
): Promise<AttributeGroupDefinition> {
  return await pc.attributeGroupDefinition.delete({
    where: { ID: groupDef.ID }
  });
}

export default {
  getByID,
  getGroupJoinAssignmentsByID,
  getGroupsJoinAssignmentsByEntityType,
  getGroupsByEntityType,
  countGroupsForEntityType,
  create: async (group: AttributeGroupDefinitionCreateInput): Promise<AttributeGroupDefinition> => {
    return await create(prisma, group);
  },
  createMany: async (groups: AttributeGroupDefinitionCreateManyInput[]) => {
    return await createMany(prisma, groups);
  },
  createManyAndReturn: async (groups: AttributeGroupDefinitionCreateManyInput[]): Promise<AttributeGroupDefinition[]> => {
    return await createManyAndReturn(prisma, groups);
  },
  update: async (groupDef: AttributeGroupDefinition, updates: Partial<AttributeGroupDefinitionCreateInput>): Promise<AttributeGroupDefinition> => {
    return await update(prisma, groupDef, updates);
  },
  remove: async (groupDef: AttributeGroupDefinition): Promise<AttributeGroupDefinition> => {
    return await remove(prisma, groupDef);
  },
  wrapTx: (tx: DTOPrismaClient) => {
    return {
      create: async (group: AttributeGroupDefinitionCreateInput): Promise<AttributeGroupDefinition> => {
        return await create(tx, group);
      },
      createMany: async (groups: AttributeGroupDefinitionCreateManyInput[]) => {
        return await createMany(tx, groups);
      },
      createManyAndReturn: async (groups: AttributeGroupDefinitionCreateManyInput[]): Promise<AttributeGroupDefinition[]> => {
        return await createManyAndReturn(tx, groups);
      },
      update: async (groupDef: AttributeGroupDefinition, updates: Partial<AttributeGroupDefinitionCreateInput>): Promise<AttributeGroupDefinition> => {
        return await update(tx, groupDef, updates);
      },
      remove: async (groupDef: AttributeGroupDefinition): Promise<AttributeGroupDefinition> => {
        return await remove(tx, groupDef);
      }
    }
  }
}
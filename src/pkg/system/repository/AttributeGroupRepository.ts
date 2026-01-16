import { prisma } from '../../../../prisma/connection';
import {
  AttributeDefinition,
  AttributeGroupDefinition,
  AttributeGroupAssignment,
  SystemEntityType
} from '../../../../prisma/generated/client';
import {
  AttributeGroupDefinitionCreateInput,
} from '../../../../prisma/generated/models';
import { AttributeGroupDefinitionJoinAssignments } from './types';

async function createGroup(
  group: AttributeGroupDefinitionCreateInput
): Promise<AttributeGroupDefinition> {
  return await prisma.attributeGroupDefinition.create({
    data: group
  });
}

async function getGroupByID(ID: number | string): Promise<AttributeGroupDefinition | null> {
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
        }
      }
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

async function assignToGroup(
  group: AttributeGroupDefinition,
  attribute: AttributeDefinition,
  ordinal: number
): Promise<AttributeGroupAssignment> {
  return await prisma.attributeGroupAssignment.create({
    data: {
      attributeGroupDefinitionID: group.ID,
      attributeDefinitionID: attribute.ID,
      ordinal: ordinal
    }
  });
}

async function unassignFromGroup(
  group: AttributeGroupDefinition,
  attribute: AttributeDefinition,
) {
  await prisma.attributeGroupAssignment.deleteMany({
    where: {
      attributeGroupDefinitionID: group.ID,
      attributeDefinitionID: attribute.ID,
    }
  });
}

async function getLastOrdinalInGroup(
  group: AttributeGroupDefinition
): Promise<number> {
  const lastAssignment = await prisma.attributeGroupAssignment.findFirst({
    where: {
      attributeGroupDefinitionID: group.ID
    },
    orderBy: {
      ordinal: 'desc'
    }
  });

  return lastAssignment ? lastAssignment.ordinal : -1;
}

export default {
  createGroup,
  getGroupByID,
  getGroupJoinAssignmentsByID,
  getGroupsJoinAssignmentsByEntityType,
  getGroupsByEntityType,
  countGroupsForEntityType,
  assignToGroup,
  unassignFromGroup,
  getLastOrdinalInGroup
}
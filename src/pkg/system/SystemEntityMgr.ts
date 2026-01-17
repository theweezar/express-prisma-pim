import { prisma } from '../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition,
  AttributeGroupDefinition,
} from '../../../prisma/generated/client';
import {
  AttributeDefinitionCreateInput,
  AttributeValueCreateManyInput
} from '../../../prisma/generated/models';
import { validate } from './validation/validator';
import _ from '../_';
import systemEntityDTO from './dto/systemEntity';
import attributeValueDTO from './dto/attributeValue';
import attributeDefinitionDTO from './dto/attributeDefinition';
import attributeGroupDefinitionDTO from './dto/attributeGroupDefinition';
import attributeGroupAssignmentDTO from './dto/attributeGroupAssignment';
import { AttributeGroupDefinitionJoinAssignments } from './dto/types';

const SystemEntityTX = {
  createSystemEntity: async (
    definitions: AttributeDefinition[],
    type: SystemEntityType,
    input: Map<string, string>
  ) => {
    return await prisma.$transaction(async (prisma) => {
      // Create the system entity
      const seWrapTx = systemEntityDTO.wrapTx(prisma);
      const attrWrapTx = attributeValueDTO.wrapTx(prisma);
      const systemEntity = await seWrapTx.create(type);

      // Merge input and template
      const attributeValueData: AttributeValueCreateManyInput[] = definitions.map(def => {
        const inputValue = input.get(def.key);
        return {
          value: inputValue,
          entityID: systemEntity.ID,
          attributeID: def.ID,
        };
      });

      // Create all attribute values
      if (attributeValueData.length > 0) {
        await attrWrapTx.createMany(attributeValueData);
      }
    });
  },
  deleteSystemEntity: async (
    entity: SystemEntity
  ) => {
    await prisma.$transaction(async (prisma) => {
      const seWrapTx = systemEntityDTO.wrapTx(prisma);
      const attrWrapTx = attributeValueDTO.wrapTx(prisma);
      await attrWrapTx.deleteMany(entity);
      await seWrapTx.remove(entity);
    });
  },
  updateSystemEntity: async (
    entity: SystemEntity,
    definitions: AttributeDefinition[],
    input: Map<string, string>
  ) => {
    return await prisma.$transaction(async () => {
      const attrWrapTx = attributeValueDTO.wrapTx(prisma);
      for (const def of definitions) {
        const inputValue = input.get(def.key);
        await attrWrapTx.upsertValue(entity, def, inputValue)
      }
    });
  }
};

async function getSystemEntity(
  type: SystemEntityType,
  ID: number | string
) {
  return await systemEntityDTO.getSystemEntityByID(type, ID);
}

async function createAttributeDefinition(input: AttributeDefinitionCreateInput) {
  return await attributeDefinitionDTO.create(input);
}

async function createAttributeDefinitions(input: AttributeDefinitionCreateInput[]) {
  return await attributeDefinitionDTO.createMany(input);
}

async function createSystemEntity(
  type: SystemEntityType,
  input: Map<string, unknown>
) {
  const attributeDefinitions = await attributeValueDTO.getAttributeDefinitions(type);
  validate(attributeDefinitions, input);
  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);
  await SystemEntityTX.createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function getSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  return await systemEntityDTO.getSystemEntityByPrimary(type, primaryValue);
}

async function updateSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string,
  input: Map<string, unknown>
) {
  // Check if system entity exists
  const existingEntity = await getSystemEntityByPrimary(type, primaryValue);
  if (!existingEntity) {
    throw new Error(`System entity with primary ${primaryValue} not found`);
  }

  const attributeDefinitions = await attributeValueDTO.getAttributeDefinitions(type);
  validate(attributeDefinitions, input);
  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);
  // await SystemEntityTX.updateSystemEntity(existingEntity, attributeDefinitions, inputTemplate);
}

async function deleteSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  // Check if system entity exists
  const existingEntity = await getSystemEntityByPrimary(type, primaryValue);
  if (!existingEntity) {
    throw new Error(`System entity with primary ${primaryValue} not found`);
  }

  // await SystemEntityTX.deleteSystemEntity(existingEntity);
}

async function createAttributeGroupDefinition(
  type: SystemEntityType,
  key: string,
  label: string
): Promise<AttributeGroupDefinition> {
  const groupsCount = await attributeGroupDefinitionDTO.countGroupsForEntityType(type);
  return await attributeGroupDefinitionDTO.create({
    key,
    label,
    systemEntityType: type,
    ordinal: groupsCount + 1
  });
}

async function assignAttributeToGroup(
  type: SystemEntityType,
  groupID: string,
  attributeID: string
) {
  const group = await attributeGroupDefinitionDTO.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await attributeValueDTO.getAttributeDefinition(type, attributeID);
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  const lastOrdinal = group.attributeGroupAssignments.length;

  await attributeGroupAssignmentDTO.create(group, attribute, lastOrdinal + 1);
}

async function unassignAttributeFromGroup(
  type: SystemEntityType,
  groupID: string,
  attributeID: string
) {
  const group = await attributeGroupDefinitionDTO.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await attributeValueDTO.getAttributeDefinition(type, attributeID);
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  await attributeGroupAssignmentDTO.remove(group, attribute);
}

async function getGroupsByEntityType(
  type: SystemEntityType
): Promise<AttributeGroupDefinition[]> {
  return await attributeGroupDefinitionDTO.getGroupsByEntityType(type);
}

async function getGroupsJoinAssignmentsByEntityType(
  type: SystemEntityType
): Promise<AttributeGroupDefinitionJoinAssignments[]> {
  return await attributeGroupDefinitionDTO.getGroupsJoinAssignmentsByEntityType(type);
}

export default {
  // Select
  getSystemEntity,
  getSystemEntityByPrimary,
  getGroupsByEntityType,
  getGroupsJoinAssignmentsByEntityType,

  // Create
  createAttributeDefinition,
  createAttributeDefinitions,
  createSystemEntity,
  createAttributeGroupDefinition,

  // Update
  updateSystemEntityByPrimary,

  // Delete
  deleteSystemEntityByPrimary,
  assignAttributeToGroup,
  unassignAttributeFromGroup,
};
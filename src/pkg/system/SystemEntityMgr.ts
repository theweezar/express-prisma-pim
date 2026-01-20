import { prisma } from '../../../prisma/connection';
import {
  SystemEntity,
  SystemEntityType,
  AttributeDefinition,
  AttributeGroupDefinition,
} from '../../../prisma/generated/client';
import {
  AttributeValueCreateManyInput
} from '../../../prisma/generated/models';
import { validate } from './validation/validator';
import _ from '../_';
import systemEntityDTO from './dto/systemEntity';
import attributeValueDTO from './dto/attributeValue';
import attributeGroupDefinitionDTO from './dto/attributeGroupDefinition';
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

async function getSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string
) {
  return await systemEntityDTO.getSystemEntityByUUID(type, UUID);
}

async function createSystemEntity(
  type: SystemEntityType,
  input: Map<string, unknown>
) {
  const attributeDefinitions = await attributeValueDTO.getAttributeDefinitions(type);
  await validate(attributeDefinitions, input);
  const inputTemplate = _.projectToTemplate(_.uniqueValuesOf(attributeDefinitions, 'key'), input);
  await SystemEntityTX.createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function getSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  return await systemEntityDTO.getSystemEntityByPrimary(type, primaryValue);
}

async function getSystemEntityByPrimaryOrThrowError(
  type: SystemEntityType,
  primaryValue: string
) {
  const entity = await getSystemEntityByPrimary(type, primaryValue);
  if (!entity) {
    throw new Error(`System entity with primary ${primaryValue} not found`);
  }
  return entity;
}

async function getSystemEntityByUUIDOrThrowError(
  type: SystemEntityType,
  UUID: string
) {
  const entity = await getSystemEntityByUUID(type, UUID);
  if (!entity) {
    throw new Error(`System entity with UUID ${UUID} not found`);
  }
  return entity;
}

async function updateSystemEntity(
  entity: SystemEntity,
  input: Map<string, unknown>
) {
  const attributeDefinitions = await attributeValueDTO.getAttributeDefinitions(entity.systemEntityType);
  await validate(attributeDefinitions, input);
  const inputTemplate = _.projectToTemplate(_.uniqueValuesOf(attributeDefinitions, 'key'), input);
  await SystemEntityTX.updateSystemEntity(entity, attributeDefinitions, inputTemplate);
}

async function updateSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string,
  input: Map<string, unknown>
) {
  const entity = await getSystemEntityByPrimaryOrThrowError(type, primaryValue);
  await updateSystemEntity(entity, input);
}

async function updateSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string,
  input: Map<string, unknown>
) {
  const entity = await getSystemEntityByUUIDOrThrowError(type, UUID);
  await updateSystemEntity(entity, input);
}

async function deleteSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  const entity = await getSystemEntityByPrimaryOrThrowError(type, primaryValue);
  await SystemEntityTX.deleteSystemEntity(entity);
}

async function deleteSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string
) {
  const entity = await getSystemEntityByUUIDOrThrowError(type, UUID);
  await SystemEntityTX.deleteSystemEntity(entity);
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
  getSystemEntity,
  getSystemEntityByUUID,
  getSystemEntityByPrimary,
  getGroupsByEntityType,
  getGroupsJoinAssignmentsByEntityType,
  createSystemEntity,
  updateSystemEntityByPrimary,
  updateSystemEntityByUUID,
  deleteSystemEntityByPrimary,
  deleteSystemEntityByUUID
};
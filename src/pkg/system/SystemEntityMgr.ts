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
import { validate } from './template/validator';
import _ from '../_';
import systemEntityDTO from './dto/systemEntity';
import attributeValueDTO from './dto/attributeValue';
import attributeGroupDefinitionDTO from './dto/attributeGroupDefinition';
import attributeDefinitionDTO from './dto/attributeDefinition';
import { AttributeGroupDefinitionJoinAssignments } from './dto/types';
import { BadRequestError, EntityNotFoundError, InternalServerError, ValidationError } from '../error/error';
import attributeMgr from './attributeMgr';

type EntityInputTemplate = Map<string, unknown>;

const TemplateService = {
  createTemplate: async (
    definitions: AttributeDefinition[],
    type: SystemEntityType,
    input: EntityInputTemplate
  ) => {
    const primary = await attributeMgr.getPrimaryAttributeDefinitionByEntityTypeOrFail(type);

    if (!input.get(primary.key)) throw new BadRequestError(`Type ${type} primary value not found.`);

    return _.projectToTemplate(_.uniqueValuesOf(definitions, 'key'), input);
  }
}

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
    return await prisma.$transaction(async (prisma) => {
      const seWrapTx = systemEntityDTO.wrapTx(prisma);
      const attrWrapTx = attributeValueDTO.wrapTx(prisma);
      seWrapTx.update(entity);
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

async function getSystemEntities(
  type: SystemEntityType
) {
  return await systemEntityDTO.getSystemEntitiesByType(type);
}

async function getSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string
) {
  return await systemEntityDTO.getSystemEntityByUUID(type, UUID);
}

async function createSystemEntity(
  type: SystemEntityType,
  input: EntityInputTemplate
) {
  const attributeDefinitions = await attributeMgr.getAttributeDefinitionsByEntityType(type);
  await validate(attributeDefinitions, input);
  const inputTemplate = await TemplateService.createTemplate(attributeDefinitions, type, input);
  await SystemEntityTX.createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function createSystemEntities(
  type: SystemEntityType,
  inputs: EntityInputTemplate[]
) {
  const attributeDefinitions = await attributeMgr.getAttributeDefinitionsByEntityType(type);
  const primaryDef = await attributeMgr.getPrimaryAttributeDefinitionByEntityTypeOrFail(type);
  const primaryValues = inputs.map(input => {
    const val = input.get(primaryDef.key);
    return _.hasValue(val) ? String(val) : null;
  }).filter(v => v !== null);
  const existings = await attributeMgr.getAttributeValuesByTypeAndPrimary(type, primaryValues);
  if (existings.length > 0) {
    const values = _.uniqueValuesOf(existings, 'value');
    throw new ValidationError(
      'Primary attribute must be unique',
      `The following primary values are already in use: ${Array.from(values).join(', ')}`
    );
  }

  for (const input of inputs) {
    await validate(attributeDefinitions, input, { insert: false });
  }

  // TODO: Continue developing createSystemEntities handler
  // const inputTemplate = await TemplateService.createTemplate(attributeDefinitions, type, input);
  // await SystemEntityTX.createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function getSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  return await systemEntityDTO.getSystemEntityByPrimary(type, primaryValue);
}

async function getSystemEntityByPrimaryOrFail(
  type: SystemEntityType,
  primaryValue: string
) {
  const entity = await getSystemEntityByPrimary(type, primaryValue);
  if (!entity) {
    throw new EntityNotFoundError(`Entity${type} with primary ${primaryValue} not found.`);
  }
  return entity;
}

async function getSystemEntityByUUIDOrFail(
  type: SystemEntityType,
  UUID: string
) {
  const entity = await getSystemEntityByUUID(type, UUID);
  if (!entity) {
    throw new EntityNotFoundError(`Entity ${type} with UUID ${UUID} not found.`);
  }
  return entity;
}

async function updateSystemEntity(
  entity: SystemEntity,
  input: EntityInputTemplate
) {
  const attributeDefinitions = await attributeDefinitionDTO.getByType(entity.systemEntityType);
  await validate(attributeDefinitions, input, { insert: false });
  const inputTemplate = await TemplateService.createTemplate(attributeDefinitions, entity.systemEntityType, input);
  await SystemEntityTX.updateSystemEntity(entity, attributeDefinitions, inputTemplate);
}

async function updateSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string,
  input: EntityInputTemplate
) {
  const entity = await getSystemEntityByPrimaryOrFail(type, primaryValue);
  await updateSystemEntity(entity, input);
}

async function updateSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string,
  input: EntityInputTemplate
) {
  const entity = await getSystemEntityByUUIDOrFail(type, UUID);
  await updateSystemEntity(entity, input);
}

async function deleteSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  const entity = await getSystemEntityByPrimaryOrFail(type, primaryValue);
  await SystemEntityTX.deleteSystemEntity(entity);
}

async function deleteSystemEntityByUUID(
  type: SystemEntityType,
  UUID: string
) {
  const entity = await getSystemEntityByUUIDOrFail(type, UUID);
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
  getSystemEntities,
  getSystemEntityByUUID,
  getSystemEntityByPrimary,
  getGroupsByEntityType,
  getGroupsJoinAssignmentsByEntityType,
  createSystemEntity,
  createSystemEntities,
  updateSystemEntity,
  updateSystemEntityByPrimary,
  updateSystemEntityByUUID,
  deleteSystemEntityByPrimary,
  deleteSystemEntityByUUID
};
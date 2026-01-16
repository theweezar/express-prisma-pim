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
import SystemEntityRepository from './repository/SystemEntityRepository';
import AttributeRepository from './repository/AttributeRepository';
import AttributeGroupRepository from './repository/AttributeGroupRepository';

async function getSystemEntity(
  type: SystemEntityType,
  UUID: string
) {
  return await SystemEntityRepository.getSystemEntityByID(type, UUID);
}

async function createAttributeDefinition(input: AttributeDefinitionCreateInput) {
  return await prisma.attributeDefinition.create({
    data: input,
  });
}

async function createAttributeDefinitions(input: AttributeDefinitionCreateInput[]) {
  return await prisma.attributeDefinition.createMany({
    data: input,
  });
}

// createSystemEntity(SystemEntityType.PRODUCT, {pid: bla bla, name: vvv})
async function createSystemEntity(
  type: SystemEntityType,
  input: Map<string, unknown>
) {
  // Get attribute definitions for this entity type (template)
  const attributeDefinitions = await AttributeRepository.getAttributeDefinitions(type);

  validate(attributeDefinitions, input);

  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);

  await SystemEntityRepository.createSystemEntity(attributeDefinitions, type, inputTemplate);
}

async function getSystemEntityByPrimary(
  type: SystemEntityType,
  primaryValue: string
): Promise<SystemEntity | null> {
  const result = await AttributeRepository.getAttributeByTypeAndPrimary(type, primaryValue);
  return (result && result.entity) ? result.entity : null;
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

  const attributeDefinitions = await AttributeRepository.getAttributeDefinitions(type);

  validate(attributeDefinitions, input);

  const inputTemplate = _.fillTemplateMap(_.mapToSet(attributeDefinitions, 'key'), input);

  await SystemEntityRepository.updateSystemEntity(existingEntity, attributeDefinitions, inputTemplate);
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

  await SystemEntityRepository.deleteSystemEntity(existingEntity);
}

async function createAttributeGroupDefinition(
  type: SystemEntityType,
  key: string,
  label: string
): Promise<AttributeGroupDefinition> {
  const groupsCount = await AttributeGroupRepository.countGroupsForEntityType(type);
  return await AttributeGroupRepository.createGroup({
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
  const group = await AttributeGroupRepository.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await AttributeRepository.getAttributeDefinition(type, attributeID);
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  const lastOrdinal = group.attributeGroupAssignments.length;

  await AttributeGroupRepository.assignToGroup(
    group,
    attribute,
    lastOrdinal + 1
  );
}

async function unassignAttributeFromGroup(
  type: SystemEntityType,
  groupID: string,
  attributeID: string
) {
  const group = await AttributeGroupRepository.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await AttributeRepository.getAttributeDefinition(type, attributeID);
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  await AttributeGroupRepository.unassignFromGroup(
    group,
    attribute
  );
}

async function getGroupsByEntityType(
  type: SystemEntityType
): Promise<AttributeGroupDefinition[]> {
  return await AttributeGroupRepository.getGroupsByEntityType(type);
}

export default {
  createAttributeDefinition,
  createAttributeDefinitions,
  getSystemEntity,
  getSystemEntityByPrimary,
  createSystemEntity,
  updateSystemEntityByPrimary,
  deleteSystemEntityByPrimary,
  createAttributeGroupDefinition,
  assignAttributeToGroup,
  unassignAttributeFromGroup,
  getGroupsByEntityType
};
import {
  SystemEntityType,
  AttributeDefinition,
  AttributeGroupDefinition
} from '../../../prisma/generated/client';
import {
  AttributeDefinitionCreateInput,
  AttributeDefinitionCreateManyInput,
  AttributeGroupDefinitionCreateInput,
  AttributeGroupDefinitionCreateManyInput
} from '../../../prisma/generated/models';
import attributeValueDTO from './dto/attributeValue';
import attributeDefinitionDTO from './dto/attributeDefinition';
import attributeGroupDefinitionDTO from './dto/attributeGroupDefinition';
import attributeGroupAssignmentDTO from './dto/attributeGroupAssignment';
import {
  AttributeGroupAssignmentCreateManyInput,
  AttributeGroupDefinitionJoinAssignments,
  AttributeGroupDefinitionOptOrdinalCreateInput
} from './dto/types';
import { InternalServerError } from '../error/error';

async function createAttributeDefinition(input: AttributeDefinitionCreateInput) {
  return await attributeDefinitionDTO.create(input);
}

async function createAttributeDefinitions(input: AttributeDefinitionCreateManyInput[]) {
  return await attributeDefinitionDTO.createManyAndReturn(input);
}

async function getAttributeValueByTypeAndPrimary(
  type: SystemEntityType,
  primaryValue: string
) {
  return await attributeValueDTO.getByTypeAndPrimary(type, primaryValue);
}

async function getAttributeValuesByTypeAndPrimary(
  type: SystemEntityType,
  primaryValues: string[]
) {
  return await attributeValueDTO.getManyByTypeAndPrimary(type, primaryValues);
}

async function getAttributeDefinitionByID(id: number) {
  return await attributeDefinitionDTO.getByID(id);
}

async function getAttributeDefinitionsByEntityType(type: SystemEntityType) {
  return await attributeDefinitionDTO.getByType(type);
}

async function getPrimaryAttributeDefinitionByEntityType(type: SystemEntityType) {
  return await attributeDefinitionDTO.getPrimaryByType(type);
}

async function getPrimaryAttributeDefinitionByEntityTypeOrFail(type: SystemEntityType) {
  const def = await attributeDefinitionDTO.getPrimaryByType(type);
  if (!def) throw new InternalServerError(`Type ${type} primary definition not found.`);
  return def;
}

async function updateAttributeDefinition(def: AttributeDefinition, updates: Partial<AttributeDefinitionCreateInput>) {
  return await attributeDefinitionDTO.update(def, updates);
}

async function deleteAttributeDefinition(def: AttributeDefinition) {
  return await attributeDefinitionDTO.remove(def);
}

async function createAttributeGroupDefinition(
  input: AttributeGroupDefinitionOptOrdinalCreateInput
): Promise<AttributeGroupDefinition> {
  let newOrd = input.ordinal; // Should not init number in this line. Number(null) == 0
  const isNum = newOrd !== null && !isNaN(Number(newOrd));
  newOrd = isNum ? Number(newOrd)
    : (await attributeGroupDefinitionDTO.countGroupsForEntityType(input.systemEntityType)) + 1;
  return await attributeGroupDefinitionDTO.create({
    ...input,
    ordinal: newOrd
  });
}

async function createAttributeGroupDefinitions(
  groups: AttributeGroupDefinitionCreateManyInput[]
): Promise<AttributeGroupDefinition[]> {
  return await attributeGroupDefinitionDTO.createManyAndReturn(groups)
}

async function getAttributeGroupByID(id: number) {
  return await attributeGroupDefinitionDTO.getByID(id);
}

async function updateAttributeGroup(
  groupDef: AttributeGroupDefinition,
  updates: Partial<AttributeGroupDefinitionCreateInput>
) {
  return await attributeGroupDefinitionDTO.update(groupDef, updates);
}

async function deleteAttributeGroup(groupDef: AttributeGroupDefinition) {
  return await attributeGroupDefinitionDTO.remove(groupDef);
}

async function createAttributeGroupAssignment(
  groupDef: AttributeGroupDefinitionJoinAssignments,
  attrDef: AttributeDefinition
) {
  const ord = groupDef.attributeGroupAssignments.length + 1;
  return await attributeGroupAssignmentDTO.create(groupDef, attrDef, ord);
}

async function createAttributeGroupAssignments(
  data: AttributeGroupAssignmentCreateManyInput[]
) {
  return await attributeGroupAssignmentDTO.createManyAndReturn(data);
}

async function assignAttributeToGroup(
  type: SystemEntityType,
  groupID: string,
  attributeID: number | string
) {
  const group = await attributeGroupDefinitionDTO.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await getAttributeDefinitionByID(Number(attributeID));
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  const lastOrdinal = group.attributeGroupAssignments.length;

  await attributeGroupAssignmentDTO.create(group, attribute, lastOrdinal + 1);
}

async function unassignAttributeFromGroup(
  type: SystemEntityType,
  groupID: string,
  attributeID: number | string
) {
  const group = await attributeGroupDefinitionDTO.getGroupJoinAssignmentsByID(type, groupID);
  if (!group) {
    throw new Error(`Attribute group with ID ${groupID} not found`);
  }

  const attribute = await getAttributeDefinitionByID(Number(attributeID));
  if (!attribute) {
    throw new Error(`Attribute definition with ID ${attributeID} not found`);
  }

  await attributeGroupAssignmentDTO.remove(group, attribute);
}

async function getAttributeGroupAssignmentByID(id: number) {
  return await attributeGroupAssignmentDTO.getByID(id);
}

async function deleteAttributeGroupAssignment(id: number) {
  // const assignment = await attributeGroupAssignmentDTO.getByID(id);
  // if (!assignment) {
  //   throw new Error(`Attribute group assignment with ID ${id} not found`);
  // }
  // return await attributeGroupAssignmentDTO.remove(assignment);
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
  createAttributeDefinition,
  createAttributeDefinitions,
  createAttributeGroupDefinition,
  createAttributeGroupDefinitions,
  createAttributeGroupAssignment,
  createAttributeGroupAssignments,

  getAttributeValueByTypeAndPrimary,
  getAttributeValuesByTypeAndPrimary,
  getAttributeDefinitionByID,
  getAttributeDefinitionsByEntityType,
  getAttributeGroupByID,
  getAttributeGroupAssignmentByID,
  getPrimaryAttributeDefinitionByEntityType,
  getPrimaryAttributeDefinitionByEntityTypeOrFail,
  getGroupsByEntityType,
  getGroupsJoinAssignmentsByEntityType,

  updateAttributeGroup,
  updateAttributeDefinition,

  deleteAttributeGroup,
  deleteAttributeDefinition,
  deleteAttributeGroupAssignment,

  assignAttributeToGroup,
  unassignAttributeFromGroup,
};
import 'dotenv/config';
import {
  SystemEntityType,
  AttributeValueType,
  AttributeGroupDefinition,
  AttributeDefinition
} from './prisma/generated/client';
import { prisma } from './prisma/connection';
import attributeDef from './prisma/json/attributeDef.json';
import SystemEntityMgr from './src/pkg/system/systemEntityMgr';
import {
  AttributeDefinitionCreateManyInput,
  AttributeGroupDefinitionCreateManyInput
} from './prisma/generated/models';

import systemEntityDTO from './src/pkg/system/dto/systemEntity';
import attributeValueDTO from './src/pkg/system/dto/attributeValue';
import attributeDefinitionDTO from './src/pkg/system/dto/attributeDefinition';
import attributeGroupDefinitionDTO from './src/pkg/system/dto/attributeGroupDefinition';
import attributeGroupAssignmentDTO from './src/pkg/system/dto/attributeGroupAssignment';
import _ from './src/pkg/_';

async function createAllAttributeDefinition() {
  const attributeDefinitionData: AttributeDefinitionCreateManyInput[] = [];
  const groupsData: AttributeGroupDefinitionCreateManyInput[] = [];
  const assignmentData: { gkey: string, akey: string, ord: number }[] = [];

  attributeDef.forEach(entity => {
    const defs = entity.definition.map(attr => ({
      key: attr.key,
      label: attr.label,
      systemEntityType: entity.type as SystemEntityType,
      attributeValueType: attr.attributeValueType as AttributeValueType,
      primary: !!(attr.primary),
      required: attr.required,
      unique: attr.unique,
    }));
    attributeDefinitionData.push(...defs);

    const groups = entity.group.map((g, i) => ({
      key: g.key,
      label: g.label,
      systemEntityType: entity.type as SystemEntityType,
      ordinal: i + 1,
    }));
    groupsData.push(...groups);

    assignmentData.push(
      ...entity.group.flatMap((g, i) => {
        return g.assignments.map((aga, j) => ({
          gkey: g.key,
          akey: aga,
          ord: j + 1
        }));
      })
    )
  });

  const attrDefs = await attributeDefinitionDTO.createManyAndReturn(attributeDefinitionData);
  const attrGroupDefs = await attributeGroupDefinitionDTO.createManyAndReturn(groupsData);

  const attrDefMap = _.arrayToMap(attrDefs, "key");
  const attrGroupDefMap = _.arrayToMap(attrGroupDefs, "key");

  const agaInput = assignmentData.map(aga => {
    const gDef = attrGroupDefMap.get(aga.gkey);
    const aDef = attrDefMap.get(aga.akey);
    if (gDef && aDef) return {
      groupDef: gDef,
      attrDef: aDef,
      ordinal: aga.ord
    };
    return null;
  }).filter(inp => inp !== null);

  await attributeGroupAssignmentDTO.createMany(agaInput);
}

async function deleteAllTables() {
  await prisma.attributeValue.deleteMany();
  await prisma.systemEntity.deleteMany();
  await prisma.attributeGroupAssignment.deleteMany();
  await prisma.attributeGroupDefinition.deleteMany();
  await prisma.attributeDefinition.deleteMany();
}

async function main() {
  console.log(`Start seeding ...`);

  await deleteAllTables();
  await createAllAttributeDefinition();

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['productID', 'basic-0001'],
      ['productName', 'Basic Outfit'],
      ['active', 'true']
    ])
  )

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['productID', 'tech-sling-099'],
      ['productName', 'Pro-Travel Sling Bag'],
      ['material', '70% NYLON + 30% POLYESTER'],
      ['dimensionHeight', '27.0'],
      ['dimensionWidth', '18.0'],
      ['dimensionLength', '6.5'],
      ['weight', '0.32'],
      ['active', 'true'],
    ])
  )

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['productID', 'cargo-pants-v2'],
      ['productName', 'Utility Cargo Pants'],
      ['ean', '8801234567890'],
      ['active', 'false']
    ])
  );

  // await SystemEntityMgr.deleteSystemEntityByPrimary(SystemEntityType.PRODUCT, 'basic-2039')

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

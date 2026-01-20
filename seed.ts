import {
  SystemEntityType,
  AttributeValueType
} from './prisma/generated/client';
import { prisma } from './prisma/connection';
import attributeDef from './prisma/json/attributeDef.json';
import systemEntityMgr from './src/pkg/system/systemEntityMgr';
import attributeMgr from './src/pkg/system/attributeMgr';
import {
  AttributeDefinitionCreateManyInput,
  AttributeGroupDefinitionCreateManyInput
} from './prisma/generated/models';

import _ from './src/pkg/_';

async function createAllAttributeDefinition() {
  const mockAttrDefs: AttributeDefinitionCreateManyInput[] = [];
  const mockGroupDefs: AttributeGroupDefinitionCreateManyInput[] = [];
  const assignments: { gkey: string, akey: string, ord: number }[] = [];

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
    mockAttrDefs.push(...defs);

    const groups = entity.group.map((g, i) => ({
      key: g.key,
      label: g.label,
      systemEntityType: entity.type as SystemEntityType,
      ordinal: i + 1,
    }));
    mockGroupDefs.push(...groups);

    assignments.push(
      ...entity.group.flatMap((g, i) => {
        return g.assignments.map((aga, j) => ({
          gkey: g.key,
          akey: aga,
          ord: j + 1
        }));
      })
    )
  });

  const attrDefs = await attributeMgr.createAttributeDefinitions(mockAttrDefs);
  const attrGroupDefs = await attributeMgr.createAttributeGroupDefinitions(mockGroupDefs);

  const attrDefMap = _.indexBy(attrDefs, "key");
  const attrGroupDefMap = _.indexBy(attrGroupDefs, "key");

  const mockAMs = assignments.map(aga => {
    const gDef = attrGroupDefMap.get(aga.gkey);
    const aDef = attrDefMap.get(aga.akey);
    if (gDef && aDef) return {
      groupDef: gDef,
      attrDef: aDef,
      ordinal: aga.ord
    };
    return null;
  }).filter(inp => inp !== null);

  await attributeMgr.createAttributeGroupAssignments(mockAMs);
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

  // await systemEntityMgr.createSystemEntity(
  //   SystemEntityType.PRODUCT,
  //   new Map([
  //     ['productID', 'basic-0001'],
  //     ['productName', 'Basic Outfit'],
  //     ['active', 'true']
  //   ])
  // )

  // await systemEntityMgr.createSystemEntity(
  //   SystemEntityType.PRODUCT,
  //   new Map([
  //     ['productID', 'tech-sling-099'],
  //     ['productName', 'Pro-Travel Sling Bag'],
  //     ['material', '70% NYLON + 30% POLYESTER'],
  //     ['dimensionHeight', '27.0'],
  //     ['dimensionWidth', '18.0'],
  //     ['dimensionLength', '6.5'],
  //     ['weight', '0.32'],
  //     ['active', 'true'],
  //   ])
  // )

  // await systemEntityMgr.createSystemEntity(
  //   SystemEntityType.PRODUCT,
  //   new Map([
  //     ['productID', 'cargo-pants-v2'],
  //     ['productName', 'Utility Cargo Pants'],
  //     ['ean', '8801234567890'],
  //     ['active', 'false']
  //   ])
  // );

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

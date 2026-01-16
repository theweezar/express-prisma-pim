import 'dotenv/config';
import { SystemEntityType, AttributeValueType } from './prisma/generated/client';
import { prisma } from './prisma/connection';
import attributeDef from './prisma/json/attributeDef.json';
import SystemEntityMgr from './src/pkg/system/SystemEntityMgr';
import {
  AttributeDefinitionCreateManyInput,
  AttributeGroupDefinitionCreateManyInput
} from './prisma/generated/models';

async function createAllAttributeDefinition() {
  const attributeDefinitionData: AttributeDefinitionCreateManyInput[] = [];
  const groupsData: AttributeGroupDefinitionCreateManyInput[] = [];

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

    const groups = entity.group.map((g, idx) => ({
      key: g.key,
      label: g.label,
      systemEntityType: entity.type as SystemEntityType,
      ordinal: idx + 1,
    }));
    groupsData.push(...groups);
  });

  await prisma.attributeDefinition.createMany({
    data: attributeDefinitionData,
  });

  await prisma.attributeGroupDefinition.createMany({
    data: groupsData,
  });
}

async function deleteAllTables() {
  await prisma.attributeValue.deleteMany();
  await prisma.attributeDefinition.deleteMany();
  await prisma.systemEntity.deleteMany();
  await prisma.attributeGroupAssignment.deleteMany();
  await prisma.attributeGroupDefinition.deleteMany();
}

async function main() {
  console.log(`Start seeding ...`);

  await deleteAllTables();
  await createAllAttributeDefinition();

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['productID', 'basic-2039'],
      ['productName', 'Basic Outfit'],
      ['active', 'true']
    ])
  )

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['productID', 'jean-1938'],
      ['productName', 'Jeans'],
      ['active', 'true']
    ])
  )

  // await SystemEntityMgr.updateSystemEntityByPrimary(
  //   SystemEntityType.PRODUCT,
  //   'jean-1938',
  //   new Map([
  //     ['productID', 'jean-1938'],
  //     ['name', 'Long Jeans'],
  //     ['active', 'false']
  //   ])
  // )

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

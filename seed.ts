import 'dotenv/config';
import { SystemEntityType, AttributeValueType } from './prisma/generated/client';
import { prisma } from './prisma/connection';
import attributeDef from './prisma/json/attributeDef.json';
import SystemEntityMgr from './src/pkg/system/SystemEntityMgr';

async function createAllAttributeDefinition() {
  const attributeDefinitionData = attributeDef.flatMap(entity =>
    entity.definition.map(attr => ({
      key: attr.key,
      label: attr.label,
      systemEntityType: entity.type as SystemEntityType,
      attributeValueType: attr.attributeValueType as AttributeValueType,
      primary: !!(attr.primary),
      required: attr.required,
      unique: attr.unique,
    }))
  );

  await prisma.attributeDefinition.createMany({
    data: attributeDefinitionData,
  });
}

async function deleteAllTables() {
  await prisma.attributeValue.deleteMany();
  await prisma.attributeDefinition.deleteMany();
  await prisma.systemEntity.deleteMany();
}

async function main() {
  console.log(`Start seeding ...`);

  await deleteAllTables();
  await createAllAttributeDefinition();

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['pid', 'basic-2039'],
      ['name', 'Basic Outfit'],
      ['active', 'true']
    ])
  )

  await SystemEntityMgr.createSystemEntity(
    SystemEntityType.PRODUCT,
    new Map([
      ['pid', 'jean-1938'],
      ['name', 'Jeans'],
      ['active', 'true']
    ])
  )

  await SystemEntityMgr.updateSystemEntityByPrimary(
    SystemEntityType.PRODUCT,
    'jean-1938',
    new Map([
      ['pid', 'jean-1938'],
      ['name', 'Long Jeans'],
      ['active', 'false']
    ])
  )

  await SystemEntityMgr.deleteSystemEntityByPrimary(SystemEntityType.PRODUCT, 'basic-2039')

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

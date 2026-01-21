import { DTOPrismaClient, prisma } from '../../../../prisma/connection';
import {
  AttributeDefinitionCreateInput,
} from '../../../../prisma/generated/models';
import { AttributeDefinition, SystemEntityType } from '../../../../prisma/generated/client';

async function getByType(
  type: SystemEntityType
) {
  return await prisma.attributeDefinition.findMany({
    where: {
      systemEntityType: type
    },
  });
}

async function getByID(
  ID: number
) {
  return await prisma.attributeDefinition.findUnique({
    where: { ID },
  });
}

async function getByKey(
  key: string
) {
  return await prisma.attributeDefinition.findFirst({
    where: { key },
  });
}

async function getByTypeAndKey(
  type: SystemEntityType,
  key: string
) {
  return await prisma.attributeDefinition.findUnique({
    where: {
      systemEntityType_key: {
        systemEntityType: type,
        key: key
      }
    },
  });
}

async function getPrimaryByType(
  type: SystemEntityType,
) {
  return await prisma.attributeDefinition.findFirst({
    where: {
      systemEntityType: type,
      primary: true
    },
  });
}

async function create(
  pc: DTOPrismaClient,
  input: AttributeDefinitionCreateInput
) {
  return await pc.attributeDefinition.create({
    data: input,
  });
}

async function createMany(
  pc: DTOPrismaClient,
  input: AttributeDefinitionCreateInput[]
) {
  return await pc.attributeDefinition.createMany({
    data: input,
  });
}

async function createManyAndReturn(
  pc: DTOPrismaClient,
  input: AttributeDefinitionCreateInput[]
): Promise<AttributeDefinition[]> {
  return await pc.attributeDefinition.createManyAndReturn({
    data: input,
  });
}

async function update(
  pc: DTOPrismaClient,
  attrDef: AttributeDefinition,
  updates: Partial<AttributeDefinitionCreateInput>
) {
  return await pc.attributeDefinition.update({
    where: { ID: attrDef.ID },
    data: updates,
  });
}

async function remove(
  pc: DTOPrismaClient,
  attrDef: AttributeDefinition
) {
  return await pc.attributeDefinition.delete({
    where: { ID: attrDef.ID },
  });
}

export default {
  getByType,
  getByID,
  getByKey,
  getByTypeAndKey,
  getPrimaryByType,
  create: async (input: AttributeDefinitionCreateInput) => {
    return await create(prisma, input);
  },
  createMany: async (input: AttributeDefinitionCreateInput[]) => {
    return await createMany(prisma, input);
  },
  createManyAndReturn: async (input: AttributeDefinitionCreateInput[]): Promise<AttributeDefinition[]> => {
    return await createManyAndReturn(prisma, input);
  },
  update: async (attrDef: AttributeDefinition, updates: Partial<AttributeDefinitionCreateInput>) => {
    return await update(prisma, attrDef, updates);
  },
  remove: async (attrDef: AttributeDefinition) => {
    return await remove(prisma, attrDef);
  },
  wrapTx: (tx: DTOPrismaClient) => {
    return {
      create: async (input: AttributeDefinitionCreateInput) => {
        return await create(tx, input);
      },
      createMany: async (input: AttributeDefinitionCreateInput[]) => {
        return await createMany(tx, input);
      },
      createManyAndReturn: async (input: AttributeDefinitionCreateInput[]): Promise<AttributeDefinition[]> => {
        return await createManyAndReturn(tx, input);
      },
      update: async (attrDef: AttributeDefinition, updates: Partial<AttributeDefinitionCreateInput>) => {
        return await update(tx, attrDef, updates);
      },
      remove: async (attrDef: AttributeDefinition) => {
        return await remove(tx, attrDef);
      },
    };
  },
};
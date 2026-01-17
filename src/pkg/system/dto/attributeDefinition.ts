import { DTOPrismaClient, prisma } from '../../../../prisma/connection';
import {
  AttributeDefinitionCreateInput,
} from '../../../../prisma/generated/models';
import { AttributeDefinition } from '../../../../prisma/generated/client';

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

export default {
  create: async (input: AttributeDefinitionCreateInput) => {
    return await create(prisma, input);
  },
  createMany: async (input: AttributeDefinitionCreateInput[]) => {
    return await createMany(prisma, input);
  },
  createManyAndReturn: async (input: AttributeDefinitionCreateInput[]): Promise<AttributeDefinition[]> => {
    return await createManyAndReturn(prisma, input);
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
    };
  },
};
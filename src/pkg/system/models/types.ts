import {
  SystemEntityType
} from "../../../../prisma/generated/client";
import { AttributeValue } from "../../../../prisma/generated/client";

export type EntityDetail = {
  ID: number
  UUID: string
  systemEntityType: SystemEntityType
  attribute: Record<string, AttributeValue>
  createdAt: Date
  updatedAt: Date
}

type AttributeGroup = {
  key: string
  label: string
  ordinal: number
  attributes: AttributeValue[]
}

export type EntityOnForm = EntityDetail & {
  groups: AttributeGroup[]
}

type AttributeValueRecord = Record<string, any>

export type EntityDetailAPIResponse = Omit<EntityDetail, 'attribute'> & {
  attribute: AttributeValueRecord
}
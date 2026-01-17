import {
  SystemEntityType,
  AttributeValueType
} from "../../../../prisma/generated/client";

type AttributeValue = {
  value: string | null
  label: string
  type: AttributeValueType
  primary: boolean
  required: boolean
  unique: boolean
  minlength: number | null
  maxlength: number | null
  ordinal: number
}

export type EntityDetail = {
  ID: number
  UUID: string
  systemEntityType: SystemEntityType
  attribute: Record<string, AttributeValue>
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
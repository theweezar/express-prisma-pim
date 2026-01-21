import { AttributeDefinition } from '../../../../prisma/generated/client';
import { AttributeValueType } from '../../../../prisma/generated/enums';
import {
  AttributeGroupDefinitionJoinAssignments,
  AttributeValueJoinAttributeDefinition,
  SystemEntityJoinAttributes
} from '../dto/types';
import {
  EntityDetail,
  EntityDetailAPIResponse,
  EntityOnForm
} from './types';
import _ from '../../_';

export function toEntityDetail(
  entity: SystemEntityJoinAttributes
): EntityDetail {
  const attribute = entity.attributeValues.reduce((acc, av) => {
    const attr = av.attributeDefinition;
    acc[attr.key] = {
      value: av.value,
      label: attr.label,
      type: attr.systemEntityType,
      primary: attr.primary,
      required: attr.required,
      unique: attr.unique,
      minlength: attr.minlength,
      maxlength: attr.maxlength,
    };
    return acc;
  }, {} as Record<string, any>);

  return {
    ID: entity.ID,
    UUID: entity.UUID,
    systemEntityType: entity.systemEntityType,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    attribute: attribute
  };
}

export function toEntityOnForm(
  entity: SystemEntityJoinAttributes,
  groups: AttributeGroupDefinitionJoinAssignments[]
): EntityOnForm {
  const entityDetail = toEntityDetail(entity);

  const groupMap = groups.map(gd => {
    const group = {
      key: gd.key,
      label: gd.label,
      ordinal: gd.ordinal,
      attributes: [] as any[]
    };

    if (gd.attributeGroupAssignments.length > 0) {
      group.attributes = gd.attributeGroupAssignments.map(aga => {
        const attrDef = aga.attributeDefinition;
        return {
          value: entityDetail.attribute[attrDef.key]?.value || null,
          label: attrDef.label,
          type: attrDef.systemEntityType,
          primary: attrDef.primary,
          required: attrDef.required,
          unique: attrDef.unique,
          minlength: attrDef.minlength,
          maxlength: attrDef.maxlength,
        };
      });
    }

    return group;
  });

  return {
    ...entityDetail,
    groups: groupMap
  };
}

function convertToType(av: AttributeValueJoinAttributeDefinition) {
  const attr = av.attributeDefinition;
  if (attr.attributeValueType === AttributeValueType.STRING) return av.value;
  if (attr.attributeValueType === AttributeValueType.NUMBER) {
    if (_.hasValue(av.value)) return Number(av.value);
    else return null;
  }
  if (attr.attributeValueType === AttributeValueType.BOOLEAN) return Boolean(av.value);
  if (attr.attributeValueType === AttributeValueType.DATE) {
    if (av.value) return new Date(av.value);
    else return null;
  }
}

export function toEntityDetailAPIResponse(
  entity: SystemEntityJoinAttributes
): EntityDetailAPIResponse {
  const attribute = entity.attributeValues.reduce((acc, av) => {
    const attr = av.attributeDefinition;
    acc[attr.key] = convertToType(av);
    return acc;
  }, {} as Record<string, any>);

  return {
    ID: entity.ID,
    UUID: entity.UUID,
    systemEntityType: entity.systemEntityType,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    attribute: attribute
  };
}
import { Router, Request, Response, NextFunction } from 'express';
import { SystemEntityType, AttributeValueType } from '../../../prisma/generated/client';
import attributeMgr from '../../pkg/system/attributeMgr';

const router = Router();

// POST /attribute-definitions - Create a new attribute definition
router.post('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const {
      key,
      label,
      systemEntityType,
      attributeValueType,
      primary = false,
      required = false,
      unique = false,
      minlength,
      maxlength
    } = req.body;

    if (!key || !label || !systemEntityType || !attributeValueType) {
      return res.status(400).json({
        error: 'Missing required fields: key, label, systemEntityType, attributeValueType'
      });
    }

    if (!Object.values(SystemEntityType).includes(systemEntityType)) {
      return res.status(400).json({
        error: 'Invalid systemEntityType',
        validTypes: Object.values(SystemEntityType)
      });
    }

    if (!Object.values(AttributeValueType).includes(attributeValueType)) {
      return res.status(400).json({
        error: 'Invalid attributeValueType',
        validTypes: Object.values(AttributeValueType)
      });
    }

    const definition = await attributeMgr.createAttributeDefinition({
      key,
      label,
      systemEntityType,
      attributeValueType,
      primary,
      required,
      unique,
      minlength: minlength || null,
      maxlength: maxlength || null
    });

    res.status(201).json(definition);
  } catch (error) {
    NextFunction(error);
  }
});

// GET /attribute-definitions - List attribute definitions by entity type
// router.get('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { entityType } = req.query;

//     if (!entityType || !Object.values(SystemEntityType).includes(entityType as string)) {
//       return res.status(400).json({
//         error: 'Invalid or missing entityType parameter',
//         validTypes: Object.values(SystemEntityType)
//       });
//     }

//     const definitions = await attributeMgr.getAttributeDefinitionsByEntityType(entityType as SystemEntityType);
//     res.status(200).json(definitions);
//   } catch (error) {
//     NextFunction(error);
//   }
// });

// GET /attribute-definitions/:id - Get attribute definition by ID
router.get('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { id } = req.params;
    const definition = await attributeMgr.getAttributeDefinitionByID(Number(id));

    if (!definition) {
      return res.status(404).json({ error: 'Attribute definition not found' });
    }

    res.status(200).json(definition);
  } catch (error) {
    NextFunction(error);
  }
});

// PATCH /attribute-definitions/:id - Update attribute definition
router.patch('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const definition = await attributeMgr.getAttributeDefinitionByID(Number(id));
    if (!definition) {
      return res.status(404).json({ error: 'Attribute definition not found' });
    }

    const updated = await attributeMgr.updateAttributeDefinition(definition, updates);
    res.status(200).json(updated);
  } catch (error) {
    NextFunction(error);
  }
});

// DELETE /attribute-definitions/:id - Delete attribute definition
router.delete('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { id } = req.params;
    const definition = await attributeMgr.getAttributeDefinitionByID(Number(id));

    if (!definition) {
      return res.status(404).json({ error: 'Attribute definition not found' });
    }

    await attributeMgr.deleteAttributeDefinition(definition);
    res.status(200).json({ message: 'Attribute definition deleted successfully' });
  } catch (error) {
    NextFunction(error);
  }
});

export default router;

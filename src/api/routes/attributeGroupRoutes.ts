import { Router, Request, Response, NextFunction } from 'express';
import { SystemEntityType } from '../../../prisma/generated/client';
import attributeMgr from '../../pkg/system/attributeMgr';

const router = Router();

// POST /attribute-groups - Create a new attribute group
router.post('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { key, label, systemEntityType, ordinal } = req.body;

    if (!key || !label || !systemEntityType) {
      return res.status(400).json({
        error: 'Missing required fields: key, label, systemEntityType'
      });
    }

    if (!Object.values(SystemEntityType).includes(systemEntityType)) {
      return res.status(400).json({
        error: 'Invalid systemEntityType',
        validTypes: Object.values(SystemEntityType)
      });
    }

    const group = await attributeMgr.createAttributeGroupDefinition({
      key,
      label,
      systemEntityType,
      ordinal: ordinal || null
    });

    res.status(201).json(group);
  } catch (error) {
    NextFunction(error);
  }
});

// GET /attribute-groups - List attribute groups by entity type
// router.get('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { entityType } = req.query;

//     if (!entityType || !Object.values(SystemEntityType).includes(entityType as string)) {
//       return res.status(400).json({
//         error: 'Invalid or missing entityType parameter',
//         validTypes: Object.values(SystemEntityType)
//       });
//     }

//     const groups = await attributeMgr.getGroupsJoinAssignmentsByEntityType(entityType as SystemEntityType);
//     res.status(200).json(groups);
//   } catch (error) {
//     NextFunction(error);
//   }
// });

// PATCH /attribute-groups/:id - Update attribute group
// router.patch('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const group = await attributeMgr.getAttributeGroupByID(Number(id));
//     if (!group) {
//       return res.status(404).json({ error: 'Attribute group not found' });
//     }

//     const updated = await attributeMgr.updateAttributeGroup(Number(id), updates);
//     res.status(200).json(updated);
//   } catch (error) {
//     NextFunction(error);
//   }
// });

// DELETE /attribute-groups/:id - Delete attribute group
// router.delete('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const group = await attributeMgr.getAttributeGroupByID(Number(id));

//     if (!group) {
//       return res.status(404).json({ error: 'Attribute group not found' });
//     }

//     await attributeMgr.deleteAttributeGroup(Number(id));
//     res.status(200).json({ message: 'Attribute group deleted successfully' });
//   } catch (error) {
//     NextFunction(error);
//   }
// });

export default router;

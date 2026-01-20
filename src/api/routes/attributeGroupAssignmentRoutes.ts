import { Router, Request, Response, NextFunction } from 'express';
import { SystemEntityType } from '../../../prisma/generated/client';
import attributeMgr from '../../pkg/system/attributeMgr';

const router = Router();

// POST /attribute-group-assignments - Assign attribute to group
router.post('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { systemEntityType, groupID, attributeID } = req.body;

    if (!systemEntityType || !groupID || !attributeID) {
      return res.status(400).json({
        error: 'Missing required fields: systemEntityType, groupID, attributeID'
      });
    }

    if (!Object.values(SystemEntityType).includes(systemEntityType)) {
      return res.status(400).json({
        error: 'Invalid systemEntityType',
        validTypes: Object.values(SystemEntityType)
      });
    }

    await attributeMgr.assignAttributeToGroup(systemEntityType, groupID, attributeID);

    res.status(201).json({ message: 'Attribute assigned to group successfully' });
  } catch (error) {
    NextFunction(error);
  }
});

// DELETE /attribute-group-assignments/:id - Unassign attribute from group
router.delete('/:id', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { id } = req.params;
    const assignment = await attributeMgr.getAttributeGroupAssignmentByID(Number(id));

    if (!assignment) {
      return res.status(404).json({ error: 'Attribute group assignment not found' });
    }

    await attributeMgr.deleteAttributeGroupAssignment(Number(id));
    res.status(200).json({ message: 'Attribute unassigned from group successfully' });
  } catch (error) {
    NextFunction(error);
  }
});

export default router;

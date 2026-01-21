import { Router, Request, Response, NextFunction } from 'express';
import { SystemEntityType } from '../../../prisma/generated/client';
import { InvalidTypeError, EntityNotFoundError } from '../../pkg/error/error';
import { toEntityDetailAPIResponse } from '../../pkg/system/models/adapter';
import systemEntityMgr from '../../pkg/system/systemEntityMgr';
import requireType from '../middleware/requireType';

const router = Router({
  // Need this to merge "type" into router.
  mergeParams: true
});

router.use(requireType);

// POST /entities/:type - Create a new system entity
router.post('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type } = req.params;
    const { attributes } = req.body;

    if (!attributes || typeof attributes !== 'object') {
      throw new InvalidTypeError('Attributes must be provided as an object');
    }

    const inputMap = new Map(Object.entries(attributes));
    await systemEntityMgr.createSystemEntity(type as SystemEntityType, inputMap);

    res.status(201).json({ success: true });
  } catch (error) {
    NextFunction(error);
  }
});

// GET /entities/:type - List entities by type
router.get('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type } = req.params;
    const entities = await systemEntityMgr.getSystemEntities(type as SystemEntityType);
    const entitiesRes = entities.map(entity => (toEntityDetailAPIResponse(entity)));
    res.status(200).json({ data: entitiesRes });
  } catch (error) {
    NextFunction(error);
  }
});

// GET /entities/:type/:uuid - Get entity by UUID
router.get('/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, uuid } = req.params;
    const entity = await systemEntityMgr.getSystemEntityByUUID(type as SystemEntityType, uuid);

    if (!entity) {
      throw new EntityNotFoundError(`${type} not found`);
    }

    res.status(200).json({
      data: toEntityDetailAPIResponse(entity)
    });
  } catch (error) {
    NextFunction(error);
  }
});

// PATCH /entities/:type/:uuid - Update entity
router.patch('/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, uuid } = req.params;
    const { attributes } = req.body;

    if (!attributes || typeof attributes !== 'object') {
      throw new InvalidTypeError('Attributes must be provided as an object');
    }

    const inputMap = new Map(Object.entries(attributes));
    await systemEntityMgr.updateSystemEntityByUUID(type as SystemEntityType, uuid, inputMap);

    res.status(200).json({ success: true });
  } catch (error) {
    NextFunction(error);
  }
});

// DELETE /entities/:uuid - Delete entity
router.delete('/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, uuid } = req.params;
    await systemEntityMgr.deleteSystemEntityByUUID(type as SystemEntityType, uuid);
    res.status(200).json({ success: true });
  } catch (error) {
    NextFunction(error);
  }
});

export default router;

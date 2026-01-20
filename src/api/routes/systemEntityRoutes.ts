import { Router, Request, Response, NextFunction } from 'express';
import { SystemEntityType } from '../../../prisma/generated/client';
import systemEntityMgr from '../../pkg/system/systemEntityMgr';
import { InvalidEntityTypeError, InvalidTypeError, EntityNotFoundError } from '../../pkg/system/validation/error';
import { toEntityDetail } from '../../pkg/system/models/adapter';

const router = Router();

function isValidType(type: any) {
  return !!(type && type !== SystemEntityType.NA && ((type as string) in SystemEntityType));
}

// POST /entities - Create a new system entity
router.post('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, attributes } = req.body;

    if (!isValidType(type)) {
      return res.status(400).json({ error: (new InvalidEntityTypeError(`${type} does not exist`)).toObject() });
    }

    if (!attributes || typeof attributes !== 'object') {
      return res.status(400).json({ error: (new InvalidTypeError('Attributes must be provided as an object').toObject()) });
    }

    const inputMap = new Map(Object.entries(attributes));
    await systemEntityMgr.createSystemEntity(type, inputMap);

    res.status(201).json({
      success: true,
      message: 'Entity created successfully'
    });
  } catch (error) {
    NextFunction(error);
  }
});

// GET /entities - List entities by type
// router.get('/', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { type } = req.query;

//     if (!isValidType(type)) {
//       return res.status(400).json({ error: (new InvalidEntityTypeError(`${type} does not exist`)).toObject() });
//     }

//     // const groups = await systemEntityMgr.getSystemEntity()
//     res.status(200).json({});
//   } catch (error) {
//     NextFunction(error);
//   }
// });

// GET /entities/:uuid - Get entity by UUID
router.get('/:type/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, uuid } = req.params;

    if (!isValidType(type)) {
      return res.status(400).json({ error: (new InvalidEntityTypeError(`${type} does not exist`)).toObject() });
    }

    const entity = await systemEntityMgr.getSystemEntityByUUID(type as SystemEntityType, uuid);

    if (!entity) {
      return res.status(404).json({ error: (new EntityNotFoundError(`${type} not found`)).toObject() });
    }

    res.status(200).json(toEntityDetail(entity));
  } catch (error) {
    NextFunction(error);
  }
});

// PATCH /entities/:uuid - Update entity
// router.patch('/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
//   try {
//     const { uuid } = req.params;
//     const { attributes } = req.body;

//     if (!attributes || typeof attributes !== 'object') {
//       return res.status(400).json({ error: 'Attributes must be provided as an object' });
//     }

//     const entity = await systemEntityMgr.getSystemEntityByUUID(SystemEntityType.PRODUCT, uuid);
//     if (!entity) {
//       return res.status(404).json({ error: 'Entity not found' });
//     }

//     const inputMap = new Map(Object.entries(attributes));
//     await systemEntityMgr.updateSystemEntityByUUID(entity, inputMap);

//     res.status(200).json({ message: 'Entity updated successfully' });
//   } catch (error) {
//     NextFunction(error);
//   }
// });

// DELETE /entities/:uuid - Delete entity
router.delete('/:type/:uuid', async (req: Request, res: Response, NextFunction: NextFunction) => {
  try {
    const { type, uuid } = req.params;

    if (!isValidType(type)) {
      return res.status(400).json({ error: (new InvalidEntityTypeError(`${type} does not exist`)).toObject() });
    }

    const entity = await systemEntityMgr.getSystemEntityByUUID(type as SystemEntityType, uuid);

    if (!entity) {
      return res.status(404).json({ error: (new EntityNotFoundError(`${type} not found`)).toObject() });
    }

    await systemEntityMgr.deleteSystemEntityByUUID(entity.systemEntityType, uuid);
    res.status(200).json({ message: 'Entity deleted successfully' });
  } catch (error) {
    NextFunction(error);
  }
});

export default router;

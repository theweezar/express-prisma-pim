import { Request, Response, NextFunction } from 'express';
import { InvalidEntityTypeError } from '../../pkg/error/error';
import { SystemEntityType } from '../../../prisma/generated/enums';

function isValidType(type: any) {
  return !!(
    type && type !== SystemEntityType.NA
    && ((type as string) in SystemEntityType)
  );
}

export const requireType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { type } = req.params;

  console.log(req.path);

  if (!isValidType(type)) {
    const err = new InvalidEntityTypeError(`${type} does not exist`);
    return res.status(err.getStatusCode()).json({
      success: false,
      error: err.toJSON()
    });
  }

  next();
};

export default requireType;

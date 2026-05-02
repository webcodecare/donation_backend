import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', auth(Role.ADMIN), UserController.GetAllUsers);
router
  .route('/:id')
  .get(auth(Role.ADMIN), UserController.GetSingleUser)
  .delete(auth(Role.ADMIN), UserController.DeleteUser);

export const userRouter = router;

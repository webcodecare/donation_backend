import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import AuthValidation from './auth.validation';
import AuthController from './auth.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.LoginSchema),
  AuthController.Login,
);
//demo
router.post(
  '/register',
  validateRequest(AuthValidation.RegisterSchema),
  AuthController.Register,
);

router.patch(
  '/change-password',
  validateRequest(AuthValidation.ChangePasswordSchema),
  AuthController.ChangePassword,
);

export const AuthRoutes = router;

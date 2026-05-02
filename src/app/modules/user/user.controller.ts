import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { UserService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const GetAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserService.GetAllUsers();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieve successful',
    data: result,
  });
});

const GetSingleUser = catchAsync(async (req: Request, res: Response) => {
  // const id = req.params?.id;
  // const result = await UserService.GetSingleUser(id);
  // sendResponse(res, {
  //   success: true,
  //   statusCode: httpStatus.OK,
  //   message: 'User retrieve successful',
  //   data: result,
  // });
});

const DeleteUser = catchAsync(async (req: Request, res: Response) => {
  // const id = req.params?.id;
  // await UserService.DeleteUser(id);
  // sendResponse(res, {
  //   success: true,
  //   statusCode: httpStatus.NO_CONTENT,
  // });
});

export const UserController = {
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};

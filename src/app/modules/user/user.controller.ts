import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { UserService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { buildMeta, parsePagination } from '../../utils/paginate';

const GetAllUsers = catchAsync(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const { data, meta } = await UserService.GetAllUsers(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieve successful',
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});

const GetSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await UserService.GetSingleUser(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User retrieve successful',
    data: result,
  });
});

const DeleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await UserService.DeleteUser(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted',
  });
});

export const UserController = {
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};

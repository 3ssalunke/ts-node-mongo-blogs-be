import { Router } from "express";
import authentication from "../../auth/authentication";
import { SuccessMsgResponse } from "../../core/ApiResponse";
import KeyStoreRepo from "../../database/repository/KeyStoreRepo";
import asyncHandler from "../../helpers/asyncHandler";
import { ProtectedRequest } from "../../types/app-request";

const router = Router();

router.use(authentication);

router.delete(
  "/",
  asyncHandler(async (req: ProtectedRequest, res) => {
    await KeyStoreRepo.remove(req.keystore._id);
    new SuccessMsgResponse("Logout Success").send(res);
  })
);

export default router;

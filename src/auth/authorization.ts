import { Router } from "express";
import { AuthFailureError } from "../core/ApiError";
import RoleRepo from "../database/repository/RoleRepo";
import asyncHandler from "../helpers/asyncHandler";
import { ProtectedRequest } from "../types/app-request";

const router = Router();

export default router.use(
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    if (!req.user || !req.user.roles || !req.currentRoleCodes) {
      throw new AuthFailureError("Permission Denied");
    }

    const roles = await RoleRepo.findByCodes(req.currentRoleCodes);
    if (roles.length === 0) throw new AuthFailureError("Permission Denied");

    let authorized = false;

    for (const userRole of req.user.roles) {
      if (authorized === true) break;
      for (const role of roles) {
        if (userRole._id.equals(role._id)) {
          authorized = true;
          break;
        }
      }
    }

    if (!authorized) throw new AuthFailureError("Permission Denied");
    return next();
  })
);

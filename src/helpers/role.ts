import { NextFunction, Request, Response } from "express";
import { RoleCode } from "../database/model/Role";
import { RoleRequest } from "../types/app-request";

export default (...roleCodes: RoleCode[]) =>
  (req: RoleRequest, _: Response, next: NextFunction) => {
    req.currentRoleCodes = roleCodes;
    next();
  };

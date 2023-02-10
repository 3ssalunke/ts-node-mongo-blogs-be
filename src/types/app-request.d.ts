import ApiKey from "../database/model/ApiKey";
import { Request } from "express";

declare interface PublicRequest extends Request {
  apiKey: ApiKey;
}

declare interface RoleRequest extends Request {
  currentRoleCodes: string[];
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}

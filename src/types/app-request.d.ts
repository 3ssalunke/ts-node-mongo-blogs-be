import ApiKey from "../database/model/ApiKey";
import { Request } from "express";
import User from "../database/model/User";
import KeyStore from "../database/model/KeyStore";

declare interface PublicRequest extends Request {
  apiKey: ApiKey;
}

declare interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}

declare interface ProtectedRequest extends RoleRequest {
  user: User;
  accessToken: string;
  keystore: KeyStore;
}

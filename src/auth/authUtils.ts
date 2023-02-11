import JWT, { JwtPayload } from "../core/JWT";
import User from "../database/model/User";
import { Tokens } from "../types/app-request";
import { tokenInfo } from "../config";
import { AuthFailureError, InternalError } from "../core/ApiError";
import { Types } from "mongoose";

export const getAccessToken = (authorization?: string) => {
  if (!authorization) throw new AuthFailureError("Invalid Authorization");
  if (!authorization.startsWith("Bearer "))
    throw new AuthFailureError("Invalid Authorization");
  return authorization.split(" ")[1];
};

export const validateTokenData = (payload: JwtPayload): boolean => {
  if (
    !payload ||
    !payload.aud ||
    !payload.iss ||
    !payload.sub ||
    !payload.prm ||
    payload.iss !== tokenInfo.issuer ||
    payload.aud !== tokenInfo.audience ||
    !Types.ObjectId.isValid(payload.sub)
  ) {
    console.log(payload);
    throw new AuthFailureError("Invalid access token");
  }

  return true;
};

export const createTokens = async (
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string
): Promise<Tokens> => {
  const accessToken = await JWT.encode(
    new JwtPayload(
      tokenInfo.issuer,
      tokenInfo.audience,
      user._id.toString(),
      accessTokenKey,
      tokenInfo.accessTokenValidaty
    )
  );
  if (!accessToken) throw new InternalError();

  const refreshToken = await JWT.encode(
    new JwtPayload(
      tokenInfo.issuer,
      tokenInfo.audience,
      user._id.toString(),
      refreshTokenKey,
      tokenInfo.refreshTokenValidaty
    )
  );
  if (!refreshToken) throw new InternalError();

  return {
    accessToken,
    refreshToken,
  };
};

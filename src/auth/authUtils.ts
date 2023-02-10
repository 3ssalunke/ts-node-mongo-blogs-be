import JWT, { JwtPayload } from "../core/JWT";
import User from "../database/model/User";
import { Tokens } from "../types/app-request";
import { tokenInfo } from "../config";
import { InternalError } from "../core/ApiError";

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

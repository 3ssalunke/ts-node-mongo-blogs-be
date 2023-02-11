import { readFile } from "fs/promises";
import { sign, verify } from "jsonwebtoken";
import path from "path";
import { promisify } from "util";
import { BadTokenError, InternalError, TokenExpiredError } from "./ApiError";
import Logger from "./Logger";

export class JwtPayload {
  aud: string;
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  prm: string;

  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
    this.prm = param;
  }
}

async function readPrivateKey(): Promise<string> {
  return readFile(path.join(__dirname, "../../keys/private.pem"), "utf-8");
}

async function readPublicKey(): Promise<string> {
  return readFile(path.join(__dirname, "../../keys/public.pem"), "utf-8");
}

async function encode(payload: JwtPayload): Promise<string> {
  const cert = await readPrivateKey();
  if (!cert) throw new InternalError("Token generation failure");
  //@ts-ignore
  return promisify(sign)({ ...payload }, cert, { algorithm: "RS256" });
}

async function validate(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    //@ts-ignore
    return (await promisify(verify)(token, cert)) as JwtPayload;
  } catch (err: any) {
    Logger.debug(err);
    if (err.name === "TokenExpiredError") throw new TokenExpiredError();

    throw new BadTokenError();
  }
}

async function decode(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    //@ts-ignore
    return (await promisify(verify)(token, cert, {
      ignoreExpiration: true,
    })) as JwtPayload;
  } catch (err: any) {
    Logger.debug(err);
    throw new BadTokenError();
  }
}

export default {
  encode,
  decode,
  validate,
};

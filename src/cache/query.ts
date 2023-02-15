import { DynamicKeyType, Key } from "./keys";
import cache from ".";

export enum TYPES {
  LIST = "list",
  STRING = "string",
  HASH = "hash",
  ZSET = "zset",
  SET = "set",
}

export async function setValue(
  key: Key | DynamicKeyType,
  value: string | number,
  expiredAt: Date | null = null
) {
  if (expiredAt) return cache.pSetEx(key, expiredAt.getTime(), `${value}`);
  else return cache.set(key, `${value}`);
}

export async function getValue(key: Key | DynamicKeyType) {
  return cache.get(key);
}

export async function getJson<T>(key: Key | DynamicKeyType) {
  const type = await cache.type(key);
  if (type !== TYPES.STRING) return null;

  const json = await getValue(key);
  if (json) return JSON.parse(json) as T;

  return null;
}

export async function setJson(
  key: Key | DynamicKeyType,
  value: Record<string, unknown>,
  expiredAt: Date | null = null
) {
  const json = JSON.stringify(value);
  return setValue(key, json, expiredAt);
}

export async function setList(
  key: Key | DynamicKeyType,
  list: any[],
  expireAt: Date | null = null
) {
  const multi = cache.multi();
  const values: any[] = [];
  for (const i in list) {
    values[i] = JSON.stringify(list[i]);
  }
  multi.del(key);
  multi.rPush(key, values);
  if (expireAt) multi.pExpireAt(key, expireAt.getTime());
  return await multi.exec();
}

export async function getListRange<T>(
  key: Key | DynamicKeyType,
  start = 0,
  end = -1
) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const list = await cache.lRange(key, start, end);
  if (!list) return null;

  const data = list.map((entry) => JSON.parse(entry) as T);
  return data;
}

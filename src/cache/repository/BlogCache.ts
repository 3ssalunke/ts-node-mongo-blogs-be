import { Types } from "mongoose";
import { caching } from "../../config";
import Blog from "../../database/model/Blog";
import { addMillisToCurrentDate } from "../../helpers/utils";
import {
  DynamicKey,
  DynamicKeyType,
  getDynamicKey,
  Key,
  KeyTypeBase,
} from "../keys";
import { getJson, setJson } from "../query";

function getKeyForId(blogId: Types.ObjectId) {
  return getDynamicKey(DynamicKey.BLOG, blogId.toHexString());
}

function getKeyForUrl(blogUrl: string) {
  return getDynamicKey(DynamicKey.BLOG, blogUrl);
}

async function save(blog: Blog, keyBase: KeyTypeBase) {
  let key: Key | DynamicKeyType;
  if (keyBase === KeyTypeBase.ID) key = getKeyForId(blog._id);
  else if (keyBase === KeyTypeBase.URL) key = getKeyForUrl(blog.blogUrl);
  return setJson(
    key!,
    { ...blog },
    addMillisToCurrentDate(caching.contentCacheDuration)
  );
}

async function fetchById(blogId: Types.ObjectId) {
  return getJson<Blog>(getKeyForId(blogId));
}

async function fetchByUrl(blogUrl: string) {
  return getJson<Blog>(getKeyForUrl(blogUrl));
}

export default {
  fetchById,
  fetchByUrl,
  save,
};

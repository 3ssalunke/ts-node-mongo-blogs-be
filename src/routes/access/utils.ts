import User from "../../database/model/User";
import _ from "lodash";

export async function getUserData(user: User) {
  const data = _.pick(user, ["_id", "name", "roles", "profilePicUrl"]);
  return data;
}

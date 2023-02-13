import { API_KEY } from "../apikey/mock";

export const addHeaders = (request: any) =>
  request
    .set("Content-Type", "application/json")
    .set("x-api-key", API_KEY)
    .timeout(2000);

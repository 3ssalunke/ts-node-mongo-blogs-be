import moment from "moment";

export function addMillisToCurrentDate(millis: number) {
  return moment().add(millis, "ms").toDate();
}

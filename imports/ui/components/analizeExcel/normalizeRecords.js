import normalizeKey from "./normalizeKeys";
export default function normalizedRecords(record) {
  const normalizedRecord = {};
  Object.keys(record).forEach((key) => {
    const normalizedKey = normalizeKey(key);
    normalizedRecord[normalizedKey] = record[key].toString();
  });
  return normalizedRecord;
}

export default function getSubSource(sourceList, dataSource) {
  return dataSource.map((data) => {
    const result = {};
    sourceList.forEach((key) => {
      result[key] = data[key];
    });
    return result;
  });
}

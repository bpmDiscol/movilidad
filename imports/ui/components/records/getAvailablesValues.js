export default function getAvailablesValues(key, data ) {
    if(!data) return [] 
    return data
      .map((request) => request[key])
      .filter((value, index, array) => array.indexOf(value) === index)
      .map((value) => ({
        text: value,
        value,
      }));
  }
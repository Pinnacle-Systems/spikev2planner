export function exclude(user, keys) {
  for (let key of keys) {
    delete user[key]
  }
  return user
}


export function convertDateDisplayFormatToDBFormat(originalDate) {
  const [day, month, year] = originalDate.split('-');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate
}

export function excelDateToJSDate(excelDate) {
  // Excel dates start at 1 for January 1, 1900
  // JavaScript dates start at 0 for January 1, 1970
  // There are 25569 days between January 1, 1900 and January 1, 1970

  // Adjust for Excel's leap year bug (1900 is considered a leap year)
  const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // January 1, 1900
  const jsEpoch = new Date(Date.UTC(1970, 0, 1));   // January 1, 1970

  // Calculate the difference in milliseconds
  const msPerDay = 24 * 60 * 60 * 1000; // milliseconds per day
  const excelToUnixOffsetDays = (jsEpoch - excelEpoch) / msPerDay;

  // Excel serial date 1 is 1900-01-01, so we need to subtract 2 for proper offset
  const date = new Date((excelDate - 2 + excelToUnixOffsetDays) * msPerDay);

  return date;
}


export function getCurrentCapacity(efficiency, capacity) {
  return (parseInt(efficiency) * parseInt(capacity)) / 100;
}


export function getMonthName(month) {
  return new Date(month).toLocaleString('default', { month: 'short' });
}


export function groupByPropertyToArr(arr, property) {
  return arr.reduce((map, curr) => {
    if (!map.has(curr[property])) {
      map.set(curr[property], [])
    }
    map.get(curr[property]).push(curr);
    return map
  }, new Map());
}
export function groupByPropertyToObj(arr, property) {
  return arr.reduce((map, curr) => {
    map.set(curr[property], curr)
    return map
  }, new Map());
}
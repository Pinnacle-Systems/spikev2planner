import moment from "moment";

export function getCurrentCapacity(efficiency, capacity) {
  return (parseInt(efficiency) * parseInt(capacity)) / 100;
}


export function dateDiffInDays(startDate, endDate, holidays) {
  let a = new Date(startDate)
  let b = new Date(endDate)
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  // Substract National Holidays
  const nationalHolidays = findNationalHolidaysBetweenDates(startDate, endDate, holidays);

  return Math.ceil((utc2 - utc1) / _MS_PER_DAY) + 1 - nationalHolidays;
}

export const getDateFromDateTimeFormat = (date) => {
  if (!date) return "";
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return moment.utc(date).format("YYYY-MM-DD");
};

export const getDateArray = function (start, end) {
  let arr = [];
  let dt = new Date(start);
  end = new Date(end);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}

export function isSameDay(d1, d2) {
  return getDateFromDateTimeFormat(d1) === getDateFromDateTimeFormat(d2);
}

export function endDateLoopFinder(startDate, endDate, holidays) {
  let nationalDays = 0;
  let localStartDate = new Date(startDate);
  let localEndDate = new Date(endDate);
  while (findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays) > nationalDays) {
    nationalDays = findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays)
    localEndDate.setDate(new Date(endDate).getDate() + findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays))
  }
  return localEndDate
}

export function findNationalHolidaysBetweenDates(start, end, holidays) {
  const allDates = getDateArray(start, end);
  return allDates.filter(date => isNationalHoliday(date, holidays)).length
}

export function findSundaysBetweenDates(start, end) {
  const allDates = getDateArray(start, end);
  return allDates.filter(date => isSunday(date)).length
}

export function findHolidaysBetweenDates(start, end, holidays) {
  const allDates = getDateArray(start, end);
  return allDates.filter(date => isHoliday(date, holidays)).length
}

export function isSunday(date) {
  return new Date(date).getDay() === 0
}

export function isNationalHoliday(date, holidays) {
  return isSunday(date) || isHoliday(date, holidays)
}

export function isHoliday(date, holidays) {
  return holidays.find(holiday => isSameDay(holiday.date, date))
}
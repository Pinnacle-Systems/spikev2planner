import moment from 'moment/moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { findHolidaysBetweenDates, findNationalHolidaysBetweenDates, findSundaysBetweenDates } from './nationHolidaysHelper';
import { adjust } from '../CapacityPlanner/helper';


export function getCurrentCapacity(efficiency, capacity) {
  return (parseInt(efficiency) * parseInt(capacity)) / 100;
}

export function toasterTrigger() {
  const response = localStorage.getItem("res");
  const result = localStorage.getItem(response);
  if (response && response === "success") {
    toast.success(result);
    localStorage.removeItem("res");
  } else if (response && response === "err") {
    toast.error(result);
    localStorage.removeItem("res");
  }
}

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

export const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

export function getRandomColor() {
  var letters = 'BCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return adjust(color, -50);
}

export const getDateFromDateTimeFormat = (date) => moment.utc(date).format("YYYY-MM-DD");

export const getMonthYearFromDateTimeFormat = (date) => moment.utc(date).format("YYYY-MM");


export function isSameDay(d1, d2) {
  return moment.utc(d1).format("YYYY-MM-DD") === moment.utc(d2).format("YYYY-MM-DD")
}

export function matchingDatesbetweenOrders(currentOrder, looporder) {
  const currentOrderDates = getDateArray(new Date(currentOrder.startDate), new Date(currentOrder.endDate)).map(date => getDateFromDateTimeFormat(date));
  let loopOrderDates = getDateArray(new Date(looporder.startDate), new Date(looporder.endDate)).map(date => getDateFromDateTimeFormat(date));
  let matchingDates = currentOrderDates.filter((date) => loopOrderDates.includes(date));
  return matchingDates.length
}

function endDateLoopFinder(startDate, endDate, holidays) {
  let nationalDays = 0;
  let localStartDate = new Date(startDate);
  let localEndDate = new Date(endDate);
  while (findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays) > nationalDays) {
    nationalDays = findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays)
    localEndDate.setDate(new Date(endDate).getDate() + findNationalHolidaysBetweenDates(localStartDate, localEndDate, holidays))
  }
  return localEndDate
}

export const addOrderToLine = (orderId, line, date, orders, setOrders, holidays, setDeliveryDateWarning) => {
  const currentOrder = orders.find(order => order.id === parseInt(orderId));
  const currentOrderIndex = orders.findIndex(order => order.id === parseInt(orderId));
  let endDate = new Date(date);
  endDate.setDate(endDate.getDate() + (currentOrder.days - 1));
  endDate = endDateLoopFinder(date, endDate, holidays);
  if (new Date(currentOrder.dDate) < new Date(endDate)) {
    setDeliveryDateWarning(true);
    return
  }
  const newOrders = [...orders]
  newOrders[currentOrderIndex]["startDate"] = date;
  newOrders[currentOrderIndex]["endDate"] = endDate;
  newOrders[currentOrderIndex]["line"] = line;
  setOrders(newOrders);
  document.getElementById(`${currentOrder.line}/${getDateFromDateTimeFormat(date)}`).style.backgroundColor = currentOrder.color;
  orderAssignment(line, currentOrder, date, endDate, orders, setOrders, holidays);
}

export function orderAssignment(line, currentOrder, startDate, endDate, orders, setOrders, holidays) {
  const ordersInCurrentLine = orders.filter(order => (parseInt(order.line) === parseInt(line)));
  const ordersInCurrentLineNotIncludingSameOrder = ordersInCurrentLine.filter(order => !(currentOrder.id === order.id));
  ordersInCurrentLineNotIncludingSameOrder.forEach(loopOrder => {
    let matchingDatesCount = matchingDatesbetweenOrders(currentOrder, loopOrder);
    if (matchingDatesCount !== 0) {
      const loopOrderIndex = orders.findIndex(order => order.id === parseInt(loopOrder.id));
      const newOrders = [...orders]
      let startDate = new Date(currentOrder.endDate)
      startDate.setDate(currentOrder.endDate.getDate() + 1);
      let endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + (loopOrder.days - 1));
      endDate = endDateLoopFinder(startDate, endDate, holidays);
      newOrders[loopOrderIndex]["startDate"] = startDate;
      newOrders[loopOrderIndex]["endDate"] = endDate;
      newOrders[loopOrderIndex]["line"] = line;
      setOrders(newOrders);
      orderAssignment(line, loopOrder, startDate, endDate, orders, setOrders, holidays);
    }
  })
}


export function arrayCounter(arr) {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts
}


export function dateDiffBetweenDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


export function getTotalPcsProductionShouldBeCompletedByYesterday(line, lineObj, holidays) {
  const lineCurrentCapacity = Math.floor((line?.capacity || 0) * ((line?.efficiency || 0) / 100))

  const lineDays = dateDiffBetweenDays(new Date(lineObj?.startDate), new Date());
  const holidaysCount = findHolidaysBetweenDates(lineObj?.startDate, new Date(), holidays);
  const sundayCount = findSundaysBetweenDates(lineObj?.startDate, new Date());

  const totalPcsProductionShouldBeCompletedByYesterday = lineCurrentCapacity * ((lineDays - holidaysCount - sundayCount));
  return totalPcsProductionShouldBeCompletedByYesterday
}
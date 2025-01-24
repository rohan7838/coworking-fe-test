const findPath = (object, key) => {
  const path = [];
  const keyExists = (obj) => {
    if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
      return false;
    }
    else if (obj.hasOwnProperty(key)) {
      return true;
    }
    else if (Array.isArray(obj)) {
      let parentKey = path.length ? path.pop() : "";

      for (let i = 0; i < obj.length; i++) {
        path.push(`${parentKey}[${i}]`);
        const result = keyExists(obj[i], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    }
    else {
      for (const k in obj) {
        path.push(k);
        const result = keyExists(obj[k], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    }
    return false;
  };

  keyExists(object);

  return path.join(".");
}

export default findPath

// convert string into pascal case
export function convertToPascalCase(string=""){
  if(typeof string===typeof ""){
      const stringArr = string.split("-");
      let convertedString = stringArr.map((ele)=>{
      const arrayFromString = ele.split("")
      if(arrayFromString[0]!==undefined){
      arrayFromString[0] = arrayFromString[0].toUpperCase()
      }
      return arrayFromString.join("");
    })
    return convertedString.join(" ")
  }
  return "";
}

// conver time string 00:00:000 to AM/PM

export const convertToAMPM = (timeString = "") => {
  const [hours, minutes] = timeString?.split(":");
  const hoursInIntegerValue = parseInt(hours, 10);

  if (hoursInIntegerValue >= 0 && hoursInIntegerValue <= 11) {
    return `${
      hoursInIntegerValue === 0
        ? 12
        : hoursInIntegerValue.toString().padStart(2, 0)
    }:${minutes} AM`;
  } else if (hoursInIntegerValue >= 12 && hoursInIntegerValue <= 23) {
    return `${
      hoursInIntegerValue === 12
        ? 12
        : (hoursInIntegerValue - 12).toString().padStart(2, 0)
    }:${minutes} PM`;
  } else {
    return "Invalid time string";
  }
};

export const calculateAvailableSlots = (startTime, endTime, interval) => {
  try {
    const [startHour, startMinutes] = startTime.split(":").map(Number);
    const [endHour, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinutes;
    const endTotalMinutes = endHour * 60 + endMinutes;

    if (startTotalMinutes >= endTotalMinutes) {
      return `0 , Invalid Input`; // start time is after or equal to end time
    }

    const numberOfSlots = Math.floor(
      (endTotalMinutes - startTotalMinutes) / interval
    );

    return numberOfSlots;
  } catch (error) {
    // console.log(error);
  }
};

export const getCurrentTime = () => {
  const currentDateTime = new Date();
  const currentHours = currentDateTime.getHours().toString().padStart(2, "0");
  const currentMinutes = currentDateTime
    .getMinutes()
    .toString()
    .padStart(2, "0");

  return `${currentHours}:${currentMinutes}`;
};

export const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 1 is added in month as month are zero-indexed
  const day = today.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getFirstTimeSlot = (timeString = "") => {
  const [openingHour, openingMinutes] = timeString.split(":").map(Number);
  const currentTime = getCurrentTime();
  const [currentHour, currentMinutes] = currentTime.split(":").map(Number);
  const hours = currentHour >= openingHour ? currentHour : openingHour;
  const minutes = currentHour >= openingHour ? currentMinutes : openingMinutes;
  // console.log(timeString);

  if (minutes >= 30) {
    const nextHour = (hours + 1) % 24;
    return `${nextHour.toString().padStart(2, "0")}:00`;
  } else if (minutes === 0) {
    return `${hours.toString().padStart(2, "0")}:00`;
  } else {
    return `${hours.toString().padStart(2, "0")}:30`;
  }
};

export const convertUTCToLocalTime = (utcDateString) => {
  try {
    if (utcDateString) {
      const utcDate = new Date(utcDateString);
      const localTimeString = utcDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return localTimeString;
    }
  } catch (error) {
    return null;
  }
};

export const generateSlots = (openingTime, closingTime, interval=30) => {
  const startTime = new Date(`1970-01-01T${openingTime}`);
  const endTime = new Date(`1970-01-01T${closingTime}`);
  const slots = [];

  while (startTime.getTime() < (endTime.getTime() - ((interval - 1) * 60000))) {
    const formattedTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',hour12:false });
    slots.push(formattedTime);
    startTime.setTime(startTime.getTime() + interval * 60000);
  }
  // console.log(slots);
  return slots;
};


export const formatTimeInHHMMFormatFromTimeString = (timeStr = "") => {
  try {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    return "Invalid time format";
  }
};

export const convertLocalToUtcDateTime = (dateStr, timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const [year, month, day] = dateStr.split("-").map(Number);

    //  local Date object
    const localDateTime = new Date(year, month - 1, day, hours, minutes);

    // Get the UTC time by subtracting the timezone offset
    const utcTime = new Date(localDateTime.getTime());

    const formattedUtcDateTime = utcTime.toISOString();
    return formattedUtcDateTime;
  } catch (error) {
    return "Invalid date or time format";
  }
};

export const add30MinutesAndFormat = (timeStr = "") => {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 30;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const formattedHours = newHours < 10 ? `0${newHours}` : newHours;
    const formattedMinutes = newMinutes < 10 ? `0${newMinutes}` : newMinutes;

    return `${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    return "Invalid time format";
  }
};


export const convertToTimeString = (time="") => {
  const newTimeArray = time.split(":")
  const hour = newTimeArray[0];
  const minute = newTimeArray[1];
  return `${hour}:${minute}:00.000`
}
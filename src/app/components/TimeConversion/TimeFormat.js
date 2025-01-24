"use client";

const convertToAMPM = (hours, minutes) => {
  if (hours >= 0 && hours <= 11) {
    return `${
      hours === 0 ? 12 : hours.toString().padStart(2, 0)
    }:${minutes.toString().padStart(2, 0)} AM`;
  } else if (hours >= 12 && hours <= 23) {
    return `${
      hours === 12 ? 12 : (hours - 12).toString().padStart(2, 0)
    }:${minutes.toString().padStart(2, 0)} PM`;
  } else {
    return "Invalid time string";
  }
};

export default function ConvertTolocalTimeFromUtc({utcDateTimeString}) {
  const newDateTime = new Date(utcDateTimeString);
  const hours = newDateTime.getHours();
  const minutes = newDateTime.getMinutes();
  const newTime = convertToAMPM(hours, minutes);
  return newTime;
}

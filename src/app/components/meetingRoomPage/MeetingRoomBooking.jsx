import React from "react";

const MeetingRoomBooking = ({ selectedDate, openingTime, closingTime, selectedSlots, onSelectSlot }) => {
  const slots = generateSlots(openingTime, closingTime);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Book Meeting Room Slots</h1>
      <p className="mb-2">Date: {selectedDate}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={`px-4 py-2 rounded ${
              selectedSlots.includes(slot)
                ? "bg-blue-500 text-white cursor-pointer"
                : "bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
};

function generateSlots(openingTime, closingTime) {
  const slots = [];
  let currentTime = openingTime;
  while (currentTime <= closingTime) {
    slots.push(currentTime);
    const [hours, minutes] = currentTime.split(":");
    const time = new Date();
    time.setHours(Number(hours));
    time.setMinutes(Number(minutes));
    time.setMinutes(time.getMinutes() + 30);
    currentTime = time.toTimeString().substr(0, 5);
  }
  return slots;
}

export default MeetingRoomBooking;

"use client"
import { getData } from "@/app/api/api";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {AiOutlinePlusCircle, AiOutlineMinusCircle} from 'react-icons/ai'

const unavailableSlotsByDate = {
  "2023-08-11": ["10:00", "14:00"],
  "2023-08-12": ["09:30", "13:30","16:00"],
  "2023-08-13": ["10:30", "12:30", "13:00", "15:30"],
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

const MeetingRoomBookingPage = () => {
  const [selectedDate, setSelectedDate] = useState("2023-08-14");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [duration, setDuration] = useState({timeDuration:0.0,unit:"mins"});
  const [credits, setCredits] = useState(0);
  const [durationAndCredits, setDurationAndCredits] = useState({
    timeDuration: 0.0,
    unit: "mins",
    credits: 0,
  });
  const creditRequiredPerMeetingSlot = 1;
  const openingTime = new Date(selectedDate) === new Date() ? `${new Date().getHours()}:${new Date().getMinutes()}` : "00:00";
  const closingTime = "19:30";
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const userSession = useSession();

  // console.log("date",new Date().toLocaleTimeString().split("T")[0]);

  // 

  useEffect(()=>{
    getSlots()
  },[])

  const getSlots = async()=>{
    const response = await getData("bookings", userSession.data?.token, hubIdFromSearchQueryParams);
    // console.log("booking data",response)
    // console.log(userSession)
  }

  // 



  const calculatedDurationAndCredits = useMemo(() => {
    let newTimeDuration = 0;
    let newTimeUnit = "mins";
    
    if (selectedSlots.length === 1) {
      newTimeDuration = 30;
      newTimeUnit = "mins";
    } else if (selectedSlots.length >= 2) {
      newTimeDuration = (selectedSlots.length * 0.5).toFixed(1);
      newTimeUnit = selectedSlots.length === 2 ? "hr" : "hrs";
    }

    const newTotalCredits = creditRequiredPerMeetingSlot * selectedSlots.length;
    
    return {
      timeDuration: newTimeDuration,
      unit: newTimeUnit,
      credits: newTotalCredits,
    };
  }, [selectedSlots.length]);

  useEffect(() => {
    setDurationAndCredits(calculatedDurationAndCredits);
  }, [calculatedDurationAndCredits]);

  const handleSelectSlot = (slot) => {
    selectedSlots.sort();
    if (!unavailableSlots.includes(slot)) {
      const firstSelectedSlot = selectedSlots[0];
      const lastSelectedSlot = selectedSlots[selectedSlots.length-1];

      if (!selectedSlots.includes(slot)) {
       if (lastSelectedSlot && getPreviousSlot(lastSelectedSlot) === slot && !unavailableSlots.includes(getPreviousSlot(slot))) {
          // console.log("second",slot)
          setSelectedSlots([...selectedSlots, slot]);
        } else if(firstSelectedSlot && getPreviousSlot(firstSelectedSlot)===slot && !unavailableSlots.includes(getNextSlot(slot))) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if(firstSelectedSlot && getNextSlot(firstSelectedSlot)===slot && !unavailableSlots.includes(getNextSlot(slot))) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if (lastSelectedSlot && getPreviousSlot(lastSelectedSlot) === slot) {
          // console.log("first",slot)
          setSelectedSlots([...selectedSlots, slot]);
        } else if (lastSelectedSlot && getNextSlot(lastSelectedSlot) === slot) { //this condition and the first one is mandatory for selection
          // console.log("first",slot)
          setSelectedSlots([...selectedSlots, slot]);
        } else {
          setSelectedSlots([slot]);
        }
      } else {
          isIndexFirstOrLast(slot) ? setSelectedSlots(selectedSlots.filter((s) => s !== slot)) : setSelectedSlots([]);
      }
    }
  };  

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedSlots([]); // Reset selected slots when changing date
  };

  const getNextSlot = (slot) => {
    const index = slots.indexOf(slot);
    return index !== -1 && index + 1 < slots.length ? slots[index + 1] : null; // returns next slot
  };

  const getPreviousSlot = (slot) => {
    const index = slots.indexOf(slot);
    return index !== -1 && index - 1 >= 0 ? slots[index - 1] : null;
  };

  const isIndexFirstOrLast = (slot) => {
    selectedSlots.sort();
    const index = selectedSlots.indexOf(slot);
    if(index===0 || index===selectedSlots.length-1) return true;
    return false;
  }

  const getTimeIn24HrFormatFromDateString = (dateString = "") => {
    const utcTime = dateString.split("T")[1];

    return 
  }

  function convertToAMPM(timeString="") {
    const [hours, minutes] = timeString.split(":");
    const parsedHours = parseInt(hours, 10);
    
    if (parsedHours >= 0 && parsedHours <= 11) {
      return `${parsedHours === 0 ? 12 : parsedHours.toString().padStart(2,0)}:${minutes} AM`;
    } else if (parsedHours >= 12 && parsedHours <= 23) {
      return `${parsedHours === 12 ? 12 : (parsedHours - 12).toString().padStart(2,0)}:${minutes} PM`;
    } else {
      return "Invalid time format";
    }

  }

  const handleDurationChange = (type = "") => {
    if (selectedSlots.length === 0) {
      return;
    }
  
    selectedSlots.sort();
    const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];
  
    if (type === "increament") {
      const nextSlot = getNextSlot(lastSelectedSlot);
      setSelectedSlots([...selectedSlots, nextSlot]);
    } else if (type === "decreament") {
      setSelectedSlots(prevArray => prevArray.slice(0, -1));
    }
  };

  const isPlusButtonDisabled = () => {
    if (selectedSlots.length === 0) {
      return true;
    }
    
    const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];
    const nextSlot = getNextSlot(lastSelectedSlot);
    
    return !nextSlot || unavailableSlots.includes(nextSlot);
  };
  
  const isMinusButtonDisabled = () => {
    return selectedSlots.length <= 1;
  };

  // 2nd approach using state

  // const handleDurationChange = (type = "") => {
  //   if (selectedSlots.length === 0) {
  //     return;
  //   }
  
  //   selectedSlots.sort();
  //   const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];
  
  //   if (type === "increament") {
  //     const nextSlot = getNextSlot(lastSelectedSlot);
  //     setSelectedSlots([...selectedSlots, nextSlot]);
  //     if (selectedSlots.length >= 1) {
  //       setIsMinusButtonDisabled(false);
  //     }
  //     disablePlusButton(lastSelectedSlot);
  //   } else if (type === "decreament") {
  //     setSelectedSlots(prevArray => prevArray.slice(0, -1));
  //     if (selectedSlots.length <= 2) {
  //       setIsMinusButtonDisabled(true);
  //     }
  //     disableMinusButton();
  //   }
  // };
  

  // const disablePlusButton = (lastSelectedSlot) => {
  //   const nextSlot = getNextSlot(lastSelectedSlot);
  //   const twoSlotsAheadOfLastSelectedSlot = getNextSlot(nextSlot);
    
  //   if (!twoSlotsAheadOfLastSelectedSlot || unavailableSlots.includes(twoSlotsAheadOfLastSelectedSlot)) {
  //     setIsPlusButtonDisabled(true);
  //   } else {
  //     setIsPlusButtonDisabled(false);
  //   }
  // };
  
  // const disableMinusButton = () => {
  //   if (selectedSlots.length <= 2) {
  //     setIsMinusButtonDisabled(true);
  //   } else {
  //     setIsMinusButtonDisabled(false);
  //   }
  // };

  const slots = generateSlots(openingTime, closingTime);
  const unavailableSlots = unavailableSlotsByDate[selectedDate] || [];

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="max-w-md mx-auto bg-white border border-red-500  p-4">
        <h1 className="text-2xl font-semibold mb-4">Book Meeting Room Slots</h1>
        <div className="mb-2">
          <label htmlFor="selectedDate" className="block font-medium">
            Select Meeting Room:
          </label>
          <select
            className="w-full p-2 border rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Test 1</option>
            <option value="">Test 2</option>
          </select>
        </div>
        <div className="mb-2">
          <label htmlFor="selectedDate" className="block font-medium">
            Select Date:
          </label>
          <input
            type="date"
            id="selectedDate"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
          />
        </div>
        <div className="mt-8 text-center">
          <p className="">Slots available on : <span className="font-medium">{selectedDate}</span></p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSelectSlot(slot)}
              className={`col-span-1 px-3 py-1 text-sm rounded ${
                selectedSlots.includes(slot)
                  ? "bg-red-600 text-white cursor-pointer"
                  : unavailableSlots.includes(slot)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "text-green-600 bg-white border border-green-700 md:hover:bg-green-600 md:hover:text-white hover:cursor-pointer"
              }`}
              disabled={unavailableSlots.includes(slot)}
            >
              {convertToAMPM(slot)}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-4xl font-semibold mb-2">Duration</p>
          <div className="flex justify-evenly items-center">
            <div>
              <button
                className="rounded-full active:text-red-400"
                disabled={isMinusButtonDisabled()}
                onClick={() => handleDurationChange("decreament")}
              >
                <AiOutlineMinusCircle className={`w-8 h-8 ${isMinusButtonDisabled() ? 'text-gray-400': 'text-black'}`}/>
              </button>
            </div>
            <div className="w-44"><p className="text-6xl font-bold text-red-500">{durationAndCredits.timeDuration}<span className="text-2xl">{durationAndCredits.unit}</span></p></div>
            <div>
              <button
                className="text-black rounded-full active:text-red-400"
                onClick={() => handleDurationChange("increament")}
                disabled={isPlusButtonDisabled()}
              >
                <AiOutlinePlusCircle className={`w-8 h-8 ${isPlusButtonDisabled() ? 'text-gray-400': 'text-black'}`}/>
              </button>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800 mt-8">Credits required: <span className="font-bold text-red-500">{durationAndCredits.credits}</span></p>
          <p className="text-lg font-bold text-gray-800 mt-2">Meeting starts at : <span className="font-bold text-red-500">{ selectedSlots.sort()[0] ? convertToAMPM(selectedSlots[0]):"NA"}</span></p>
        </div>

          <div className="max-w-md mt-8 w-full flex flex-col items-center justify-center bg-white p-6 rounded-lg">
            <input type="text" placeholder="Meeting Title" className="border p-2 mb-2 w-full rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"/>
            <textarea placeholder="Meeting Description" className="border h-28 p-2 mb-2 w-full rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"></textarea>
            <button className="w-full mt-8 mb-10 bg-red-600 text-white rounded-md px-4 text-lg lg:text-xl py-3 font-medium hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500">Book Now</button>
          </div>
        
      </div>
    </div>
  );
};

export default MeetingRoomBookingPage;



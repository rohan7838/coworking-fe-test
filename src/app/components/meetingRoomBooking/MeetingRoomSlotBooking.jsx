"use client";
import { create, getData, getOne, getUserRoleAndHubs } from "@/app/api/api";
import {
  add30MinutesAndFormat,
  convertLocalToUtcDateTime,
  generateSlots,
  convertToAMPM,
  convertUTCToLocalTime,
  getCurrentTime,
  getFirstTimeSlot,
  getTodaysDate,
  formatTimeInHHMMFormatFromTimeString,
} from "@/app/common/common";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import CustomerSelection from "./CustomerSelcetion";

const MeetingRoomSlotBooking = ({meetingRoomData, session}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const todaysDate = getTodaysDate();
  const currentTime = getCurrentTime();
  const [selectedDate, setSelectedDate] = useState(todaysDate);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [durationAndCredits, setDurationAndCredits] = useState({timeDuration: 0.0, unit: "mins", credits: 0});
  const creditRequiredPerMeetingSlot = 1;
  const openingTime = selectedDate === todaysDate ? getFirstTimeSlot( formatTimeInHHMMFormatFromTimeString(meetingRoomData?.attributes?.openingTime || "09:00")) : formatTimeInHHMMFormatFromTimeString(meetingRoomData?.attributes?.openingTime || "09:00");
  const closingTime = formatTimeInHHMMFormatFromTimeString(meetingRoomData?.attributes?.closingTime || "20:00");
  const [unavailableSlotsByDate, setUnavailableSlotsByDate] = useState({});
  const [customerSelectedByAdmin, setCustomerSelectedByAdmin] = useState(0);
  const [disableSubmitButton, setDisableSubmitButton] = useState(false)
  const [errorOnSubmit, setErrorOnSubmit] = useState("");
  const [errors, setErrors] = useState({});
  const [maxCalenderDate, setMaxCalenderDate] = useState('');

  const calculateMaxDate = () => {
    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setDate(currentDate.getDate() + 30);

    const year = maxDate.getFullYear();
    let month = maxDate.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`; // Prefix with '0' if month is less than 10
    }
    let day = maxDate.getDate();
    if (day < 10) {
      day = `0${day}`; // Prefix with '0' if day is less than 10
    }

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const maxDate = calculateMaxDate();
    setMaxCalenderDate(maxDate);
  }, []);

// console.log(meetingRoomData?.id, session)
  useEffect(() => {
    if (session.status === "authenticated") {
      getBookings();
    }
  }, [session.status, meetingRoomData?.id, selectedDate]);

  // get bookings **********************************************************************************************

  async function getBookings() {
    const filter = `filters[inventory][id][$eq]=${meetingRoomData?.id}&filters[date][$eq]=${selectedDate}`;
    const {responseData, responseStatus} = await getData(`bookings`, session.data?.token,hubIdFromSearchQueryParams,filter);
    const updatedUnavailableSlots = {};
    console.log(responseData)
    responseData?.data?.forEach((data) => {
      const meetingStartTime = convertUTCToLocalTime(data.attributes.startTime);
      const meetingEndTime = convertUTCToLocalTime(data.attributes.endTime);
      const generatedSlotsArray = generateSlots(meetingStartTime,meetingEndTime);

      if (!updatedUnavailableSlots[data.attributes.date]) {
        updatedUnavailableSlots[data.attributes.date] = [];
      }
      updatedUnavailableSlots[data.attributes.date].push(...generatedSlotsArray);
    });

    setUnavailableSlotsByDate(updatedUnavailableSlots);
  }

  // *********************************************************************************************************

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

  // *********************************************************************************************************

  useEffect(() => {
    setDurationAndCredits(calculatedDurationAndCredits);
  }, [calculatedDurationAndCredits]);

  // *********************************************************************************************************

  const handleSelectSlot = (slot) => {
    selectedSlots.sort();
    setDisableSubmitButton(false)

    if (!unavailableSlots.includes(slot)) {
      const firstSelectedSlot = selectedSlots[0];
      const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];

      if (!selectedSlots.includes(slot)) {
        if (
          lastSelectedSlot &&
          getPreviousSlot(lastSelectedSlot) === slot &&
          !unavailableSlots.includes(getPreviousSlot(slot))
        ) {
          // console.log("second", slot);
          setSelectedSlots([...selectedSlots, slot]);
        } else if (
          firstSelectedSlot &&
          getPreviousSlot(firstSelectedSlot) === slot &&
          !unavailableSlots.includes(getNextSlot(slot))
        ) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if (
          firstSelectedSlot &&
          getNextSlot(firstSelectedSlot) === slot &&
          !unavailableSlots.includes(getNextSlot(slot))
        ) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if (
          lastSelectedSlot &&
          getPreviousSlot(lastSelectedSlot) === slot
        ) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if (lastSelectedSlot && getNextSlot(lastSelectedSlot) === slot) {
          //this condition and the first one is mandatory for selection
          setSelectedSlots([...selectedSlots, slot]);
        } else {
          setSelectedSlots([slot]);
        }
      } else {
        isIndexFirstOrLast(slot)
          ? setSelectedSlots(selectedSlots.filter((s) => s !== slot))
          : setSelectedSlots([]);
      }
    }
  };

  // *********************************************************************************************************

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedSlots([]); // Reset selected slots when changing date
  };

  // *********************************************************************************************************

  const getNextSlot = (slot) => {
    const index = slots.indexOf(slot);
    return index !== -1 && index + 1 < slots.length ? slots[index + 1] : null; // returns next slot
  };

  // *********************************************************************************************************

  const getPreviousSlot = (slot) => {
    const index = slots.indexOf(slot);
    return index !== -1 && index - 1 >= 0 ? slots[index - 1] : null;
  };

  // *********************************************************************************************************

  const isIndexFirstOrLast = (slot) => {
    selectedSlots.sort();
    const index = selectedSlots.indexOf(slot);
    if (index === 0 || index === selectedSlots.length - 1) return true;
    return false;
  };

  // *********************************************************************************************************

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
      setSelectedSlots((prevArray) => prevArray.slice(0, -1));
    }
  };

  // *********************************************************************************************************

  const isPlusButtonDisabled = () => {
    if (selectedSlots.length === 0) {
      return true;
    }

    const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];
    const nextSlot = getNextSlot(lastSelectedSlot);

    return !nextSlot || unavailableSlots.includes(nextSlot);
  };

  // *********************************************************************************************************

  const isMinusButtonDisabled = () => {
    return selectedSlots.length <= 1;
  };

  // *********************************************************************************************************

  const slots = generateSlots(openingTime, closingTime);
  const unavailableSlots = unavailableSlotsByDate[selectedDate] || [];
  // console.log(unavailableSlots);

  // *********************************************************************************************************

  const getCustomerSelectedByAdmin = (value)=>{
    // setDisableSubmitButton(false)
    setCustomerSelectedByAdmin(value)
  }
  
  function validateForm(data={}) {
    const validationErrors = {};

    if (!data.customer) {
      validationErrors.customer = 'Select customer';
    }

    if (!data.startTime) {
      validationErrors.startTime = 'Select meeting slot';
    } 
    return validationErrors;
  }

  const handleBookSlots = async () => {
    setDisableSubmitButton(true);
    selectedSlots.sort();

    const validationErrors = validateForm({customer:customerSelectedByAdmin, startTime:selectedSlots[0]});

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setDisableSubmitButton(false)
      return;
    } 

    const customerId = Number(customerSelectedByAdmin);
    const inventoryId = meetingRoomData?.id;
    const meetingStartTime = convertLocalToUtcDateTime(selectedDate,selectedSlots[0]);
    const meetingEndTime = convertLocalToUtcDateTime(selectedDate, add30MinutesAndFormat(selectedSlots[selectedSlots.length - 1]));

    const newData = {
      data: {
        date: selectedDate,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        hub: hubIdFromSearchQueryParams,
        customer: customerId,
        inventory: inventoryId,
      },
    };


    if(customerSelectedByAdmin==="internal"){
      delete newData.data.customer;
    }

    const response= await create("bookings", session?.data?.token, newData);
    console.log(response)
    if(response.statusText==="OK"){
      setErrorOnSubmit("")
      router.push(`/ia-hubs/bookings?hubId=${hubIdFromSearchQueryParams}`)
    }else{
      setDisableSubmitButton(false)
      setErrorOnSubmit("Something went wrong")
    }

  };


  return (
    <div className="relative min-h-screen flex justify-center">
      <div className="w-full max-w-6xl p-4 mx-auto my-5 bg-white">
        <div className="w-full mt-5 mb-12 font-medium text-gray-600">
          Meeting Room: <span className="text-red-500">{meetingRoomData?.attributes?.seat_id}</span>
        </div>
        <div className="mb-12 grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="">
            <label htmlFor="selectedDate" className="block font-medium">
              Select Date:
            </label>
            <input
              type="date"
              id="selectedDate"
              min={todaysDate}
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full h-10 p-2 border rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          {/* Customer selection if user id admin */}
          <div>
          <CustomerSelection hubId={hubIdFromSearchQueryParams} token={session.data?.token} customerSelectedByAdmin={(value)=>getCustomerSelectedByAdmin(value)}/>
          {errors.customer && <div className="text-red-500 text-sm">{errors.customer}</div>}
          </div>
        </div>
        {/* slot booking */}
        {slots.length > 0 ? (
          <>
            <div className="mt-8">
              <p className="">
                Slots available on :{" "}
                <span className="font-medium">{selectedDate}</span>
              </p>
              {errors.startTime && <div className="text-red-500 text-sm">{errors.startTime}</div>}
            </div>
            <div className="mt-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {slots.map((slot,index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSlot(slot)}
                  className={`col-span-1 px-1 py-2 text-sm rounded ${
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

            <div className="mt-14 grid gap-5 grid-cols-1 lg:grid-cols-2">
              <div className="text-center">
                <p className="text-4xl font-semibold mb-2">Duration</p>
                <div className="flex justify-evenly items-center">
                  <div>
                    <button
                      className="rounded-full active:text-red-400"
                      disabled={isMinusButtonDisabled()}
                      onClick={() => handleDurationChange("decreament")}
                    >
                      <AiOutlineMinusCircle
                        className={`w-8 h-8 ${
                          isMinusButtonDisabled() ? "text-gray-400" : "text-black"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="w-44">
                    <p className="text-6xl font-bold text-red-500">
                      {durationAndCredits.timeDuration}
                      <span className="text-2xl">{durationAndCredits.unit}</span>
                    </p>
                  </div>
                  <div>
                    <button
                      className="text-black rounded-full active:text-red-400"
                      onClick={() => handleDurationChange("increament")}
                      disabled={isPlusButtonDisabled()}
                    >
                      <AiOutlinePlusCircle
                        className={`w-8 h-8 ${
                          isPlusButtonDisabled() ? "text-gray-400" : "text-black"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800 mt-8">
                  Credits required:{" "}
                  <span className="font-bold text-red-500">
                    {durationAndCredits.credits}
                  </span>
                </p>
                <p className="text-lg font-bold text-gray-800 mt-2">
                  Meeting starts at :{" "}
                  <span className="font-bold text-red-500">
                    {selectedSlots.sort()[0]
                      ? convertToAMPM(selectedSlots[0])
                      : "NA"}
                  </span>
                </p>
              </div>

              <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg">
                <input
                  type="text"
                  placeholder="Meeting Title"
                  className="border p-2 mb-2 w-full rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <textarea
                  placeholder="Meeting Description"
                  className="border h-48 p-2 mb-2 w-full rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                ></textarea>
              </div>
            </div>
            <div className='bg-slate-100 text-end text-red-500 text-sm'>{errorOnSubmit}</div>
            
            <div className="w-full flex justify-end">
                <button
                  onClick={handleBookSlots}
                  disabled = {disableSubmitButton}
                  className={` disabled:opacity-50 w-full sm:w-fit mt-8 mb-10 bg-red-600 text-white rounded-md px-4 text-lg lg:text-xl py-3 font-medium hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500`}
                >
                  Book Now
                </button>
              </div>
          </>
        ) : (
          <div className="w-full text-center font-medium mt-10 py-4">
            <p className="text-gray-400 text-lg">
              No slots available today! <br />
              Please choose another date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoomSlotBooking;

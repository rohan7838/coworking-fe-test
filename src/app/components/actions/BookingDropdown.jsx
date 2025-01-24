"use client";
import { getTodaysDate } from "@/app/common/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const BookingDropdown = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const hubIdFromSearchQueryParams = searchParams.get("hubId")
  const filterFromSearchQueryParams = searchParams.get("filter")
  const [filter, setFilter] = useState("date")
  const optionList = [
    { name: "Today's Bookings", value: "date" },
    { name: "Active Bookings", value: "startTime" },
    { name: "Booking History", value: "endTime" },
    // { name: "Cancelled Bookings", value: "Cancelled" },
  ];

  const createQueryString = useCallback(
    (array = []) => {
      array.forEach((ele) => {
        params.set(ele.key, ele.value);
      });
      return params.toString();
    }, [searchParams]);

  function appendBookingFIlterInSearchParams(filterValue, operatorValue) {
    const date = new Date();
    // console.log(params)
    let dateTimeValue;
    if (filterValue === "date") {
      dateTimeValue = getTodaysDate();
      // console.log(dateTimeValue)
    } else {
      dateTimeValue = date.getTime();
    }

    optionList.forEach((ele)=>{
      // console.log(ele.value)
        if(ele.value!==filterValue){
            params.delete(ele.value);
        }
    })

    const querySearch = [
      { key: "filter", value: filterValue },
      { key: filterValue, value: dateTimeValue },
      { key: "operator", value: operatorValue },
    ];
    // console.log(params.values())
    router.push(pathname + "?" + createQueryString(querySearch));
  }
  // console.log(params.toString(),"at ooen")

  useEffect(() => {
    if(!filterFromSearchQueryParams){
      appendBookingFIlterInSearchParams("date", "eq");
      setFilter("date")
      console.log("changed")
    }
  }, [hubIdFromSearchQueryParams,filterFromSearchQueryParams]);

  function handleChange(e) {
    e.preventDefault();
    const selectedOptionValue = e.target.value;
    // console.log("handlechange", selectedOptionValue)
    setFilter(e.target.value)
    if (selectedOptionValue === "date") {
      appendBookingFIlterInSearchParams(selectedOptionValue, "eq");
    } else if (selectedOptionValue === "startTime") {
      appendBookingFIlterInSearchParams(selectedOptionValue, "gte");
    } else if (selectedOptionValue === "endTime") {
      appendBookingFIlterInSearchParams(selectedOptionValue, "lte");
    }
  }

  return (
    <>
      <select
        onChange={handleChange}
        className="w-40 h-[2.4rem] text-sm rounded focus:ring-1 focus:outline-none ring-red-400 border border-gray-300"
        name=""
        id=""
      >
        {optionList.map((item,index)=>{
            return <option key={item.name+index} selected={filter===item.value} value={item.value}>{item.name}</option>
        })}
      </select>
    </>
  );
};

export default BookingDropdown;
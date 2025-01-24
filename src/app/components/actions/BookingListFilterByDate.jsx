"use client";
import { getTodaysDate } from "@/app/common/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const BookingListFilterByDate = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const todaysDate = getTodaysDate();
  const params = new URLSearchParams(searchParams);
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const filterFromSearchQueryParams = searchParams.get("filter1");
  // console.log(filterFromSearchQueryParams);

  const createQueryString = useCallback(
    (array = []) => {
      array.forEach((ele) => {
        params.set(ele.key, ele.value);
      });
      return params.toString();
    },
    [searchParams]
  );

  // To convert url string parameters to readable format:
  function getUrlParameter(string) {
    if (typeof string !== 'string' || string.trim() === '') {
      throw new Error('Invalid input: urlString must be a non-empty string.');
    }
    string = string.replace(/[\[]/, "\[").replace(/[\]]/, "\]");
    return string;
  }

  // To parse filter parmeters into object;
  const parseUrlStringParameters = (urlString) =>{
    if (typeof urlString !== 'string' || urlString.trim() === '') {
      throw new Error('Invalid input: urlString must be a non-empty string.');
    }
    urlString = getUrlParameter(urlString);
    const parsedParameters = urlString?.split(/[\[\]=$/]+/)
    const filter = parsedParameters?.[0];
    const key = parsedParameters?.[1];
    const operator = parsedParameters?.[2];
    const value = parsedParameters?.[3];
    const urlParameters = {filter,key,operator,value};
    return urlParameters;
  }

  // To append/add new search params in url string
  function appendBookingFilterInSearchParams(filterKey,filterValue) {
    const filterString = `filters[date][$eq]=${filterValue}`
    params.set(filterKey, filterString);
    const queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  }
  // console.log(filterFromSearchQueryParams);

  useEffect(()=>{
    if(!filterFromSearchQueryParams){
      // appendBookingFilterInSearchParams("filter1",todaysDate);
      setSelectedDate(todaysDate);
    }else{
      const parsedUrlString = parseUrlStringParameters(filterFromSearchQueryParams)
      console.log(parsedUrlString)
      appendBookingFilterInSearchParams("filter1", parsedUrlString?.value);
      setSelectedDate(parsedUrlString?.value);
    }
  },[hubIdFromSearchQueryParams, filterFromSearchQueryParams])

  
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    appendBookingFilterInSearchParams("filter1", date);
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-500 font-medium mr-2">Date Filter</label>
      <input
        type="date"
        onChange={handleDateChange}
        value={selectedDate}
        className="outline-none w-36 px-1 py-1 text-sm text-gray-700 rounded focus:ring-1 focus:outline-none ring-red-400 border border-gray-300"
      />
    </div>
  );
};

export default BookingListFilterByDate;

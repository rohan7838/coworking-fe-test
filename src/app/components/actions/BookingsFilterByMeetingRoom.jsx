"use client";
import { getData } from "@/app/api/api";
import { getTodaysDate } from "@/app/common/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const BookingsFilterByMeetingRoom = ({token}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const filter2FromSearchQueryParams = searchParams.get("filter2");
  const [meetingRoomList, setMeetingRoomList] = useState([]);
  const [selectedMeetingRoomId, setSelectedMeetingRoomId] = useState("");

  // To convert url string parameters to readable format:
  function getUrlParameter(string) {
    string = string.replace(/[\[]/, "\[").replace(/[\]]/, "\]");
    return string;
  }

  const getMeetingRoomData = useCallback(async()=>{
    const filter = `filters[type][$contains]=meeting-room`;
    const {responseData} = await getData("inventories", token ,hubIdFromSearchQueryParams, filter);
    const filter2 = `filters[inventory][id][$eq]=48`;
    setMeetingRoomList(responseData?.data);
  },[hubIdFromSearchQueryParams])

  const appendBookingFIlterInSearchParams = (filterKey, filterValue) => {
    let queryString;
    if(filterValue==="" || typeof filterValue !=="string"){
        params.delete(filterKey);
        queryString = params.toString();
        router.push(`${pathname}?${queryString}`);
        return;
    }
    const filterString = `filters[inventory][id][$eq]=${filterValue}`;
    params.set(filterKey,filterString);
    queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  }

  useEffect(()=>{
    getMeetingRoomData();
    if(!filter2FromSearchQueryParams){
        setSelectedMeetingRoomId("")
    }
    else{
        const queryString = getUrlParameter(filter2FromSearchQueryParams);
        const meetingRoomId = queryString?.split("=");
        setSelectedMeetingRoomId(Number(meetingRoomId?.[1]))
    }
  },[hubIdFromSearchQueryParams,filter2FromSearchQueryParams])

  function handleChange(e) {
    const meetingRoomId = e.target.value;
    setSelectedMeetingRoomId(meetingRoomId);    
    appendBookingFIlterInSearchParams("filter2", meetingRoomId);
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-500 font-medium">Meeting Room Filter</label>
      <select
        onChange={handleChange}
        value={selectedMeetingRoomId}
        className="w-40 px-1 py-[.35rem] text-sm text-gray-700 rounded focus:ring-1 focus:outline-none ring-red-400 border border-gray-300"
        name=""
        id=""
      >
        <option value="">All</option>
        {meetingRoomList?.map((meetingRoom,index)=>{
            return <option key={meetingRoom?.id} value={meetingRoom?.id} >{meetingRoom?.attributes?.seat_id}</option>
        })}
      </select>
    </div>
  );
};

export default BookingsFilterByMeetingRoom;
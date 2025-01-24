"use client";
import { getData } from "@/app/api/api";
import { getTodaysDate } from "@/app/common/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const FilterInventoryType = ({token}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const inventoryTypeQuerySearchParam = searchParams.get("inventoryType");
  const [meetingRoomList, setMeetingRoomList] = useState([]);
  const [selectedInventoryType, setSelectedInventoryType] = useState("");

  // To convert url string parameters to readable format:
  function getUrlParameter(string) {
    string = string.replace(/[\[]/, "\[").replace(/[\]]/, "\]");
    return string;
  }


  const appendFIlterInSearchParams = (filterKey, filterValue) => {
    let queryString;
    if(filterValue==="" || typeof filterValue !=="string"){
        params.delete(filterKey);
        queryString = params.toString();
        router.push(`${pathname}?${queryString}`);
        return;
    }
    const filterString = `filters[type][$eq]=${filterValue}`;
    params.set(filterKey,filterString);
    queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  }

  useEffect(()=>{
    if(!inventoryTypeQuerySearchParam){
      setSelectedInventoryType("")
    }
    else{
        const queryString = getUrlParameter(inventoryTypeQuerySearchParam);
        const type = queryString?.split("=");
        setSelectedInventoryType(type?.[1])
    }
  },[hubIdFromSearchQueryParams,inventoryTypeQuerySearchParam])

  function handleChange(e) {
    const type = e.target.value;
    setSelectedInventoryType(type);    
    appendFIlterInSearchParams("inventoryType", type);
  }

  // console.log(selectedInventoryType, inventoryTypeQuerySearchParam)

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-500 font-medium">Inventory Type</label>
      <select
        onChange={handleChange}
        value={selectedInventoryType}
        className="w-40 px-1 py-[.35rem] text-sm text-gray-700 rounded focus:ring-1 focus:outline-none ring-red-400 border border-gray-300"
        name=""
        id=""
      >
        <option value="">All</option>
        <option value="meeting-room">Meeting Room</option>
        <option value="cabin">Cabin Room</option>
        <option value="single-seat">Single Seat</option>
      </select>
    </div>
  );
};

export default FilterInventoryType;
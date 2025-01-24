"use client";
import { getData } from "@/app/api/api";
import { getTodaysDate } from "@/app/common/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const InventoryAllocationFilter = ({}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const inventoryTypeQuerySearchParam = searchParams.get("status");
  const [meetingRoomList, setMeetingRoomList] = useState([]);
  const [selectedInventoryStatus, setSelectedInventoryStatus] = useState("");

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
    const filterString = `filters[status][$eq]=${filterValue}`;
    params.set(filterKey,filterString);
    queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  }

  useEffect(()=>{
    if(!inventoryTypeQuerySearchParam){
      setSelectedInventoryStatus("")
    }
    else{
        const queryString = getUrlParameter(inventoryTypeQuerySearchParam);
        const type = queryString?.split("=");
        setSelectedInventoryStatus(type?.[1])
    }
  },[hubIdFromSearchQueryParams,inventoryTypeQuerySearchParam])

  function handleChange(e) {
    const type = e.target.value;
    setSelectedInventoryStatus(type);    
    appendFIlterInSearchParams("status", type);
  }

  // console.log(selectedInventoryStatus, inventoryTypeQuerySearchParam)

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-500 font-medium">Inventory Type</label>
      <select
        onChange={handleChange}
        value={selectedInventoryStatus}
        className="w-40 px-1 py-[.35rem] text-sm text-gray-700 rounded focus:ring-1 focus:outline-none ring-red-400 border border-gray-300"
        name=""
        id=""
      >
        <option value="">All</option>
        <option value="cabin">Cabin Room</option>
        <option value="single-seat">Single Seat</option>
      </select>
    </div>
  );
};

export default InventoryAllocationFilter;
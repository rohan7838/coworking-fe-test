"use client";
import { getData } from "@/app/api/api";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const CustomerSelection = ({hubId, token, customerSelectedByAdmin}) => {
    const [customerList, setCustomerList] = useState([])
  
    useEffect(()=>{
      getCustomerListForTheCurrentHub();
    },[token, hubId])

    const getCustomerListForTheCurrentHub = async()=>{
        const pagination = `pagination[pageSize]=500`
        const sort = `sort[0]=name:asc`
        const {responseData, responseStatus} = await getData("customers", token, hubId,sort, pagination);
        setCustomerList(responseData?.data);
        console.log(responseData?.data)
      }

      const handleChange = (e)=>{
        customerSelectedByAdmin(e.target.value);
      }

  return (
    <div className="">
      <label htmlFor="selectedDate" className="block font-medium">
        Select Customer:
      </label>
      <select
        name=""
        id=""
        className="w-full h-10 p-2 border rounded focus:ring-1 focus:ring-red-500 focus:outline-none"
        onChange={handleChange}
      >
        <option value="">Select customer</option>
        <option value="internal">Internal - IA</option>
        {customerList?.map((customer, index)=>{
            return <option value={customer?.id} key={customer?.id}>{customer?.attributes?.name}</option> 
        })}
      </select>
    </div>
  );
};

export default CustomerSelection;

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData } from "@/app/api/api";

const Sorting = () => {

    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [sortBySeatallocation, setSortBySeatAllocation] = useState("");
    const [sortStartUpName, setSortStartupName] = useState("");
    const router = useRouter();

    useEffect(()=>{
        async function fetchData(){
            const data = await getData("hubnames");
            // console.log(data)
            return 
        }
        // console.log(paymentStatusFilter)
        fetchData()
        // console.log(fetchData())
        // router.refresh()
    },[paymentStatusFilter, sortBySeatallocation, sortBySeatallocation])

    function handlePaymentStatusFilter(e){
        setPaymentStatusFilter(e.target.value)
    }

   

  return (
    <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div className="p-3 flex flex-col">
        <label
          for="countries"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Payment status
        </label>
        <select
          name="payment_status"
          onChange={handlePaymentStatusFilter}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Choose an option</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div className="p-3 flex flex-col">
        <label
          for="countries"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Sort by seats allocated
        </label>
        <select
          id="countries"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option selected>Choose an option</option>
          <option value="US">Seats Allocated - Low to High</option>
          <option value="CA">Seats Allocated - High to Low</option>
        </select>
      </div>

      <div className="p-3 flex flex-col">
        <label
          for="countries"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Sort by name
        </label>
        <select
          id="countries"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option selected>Choose an option</option>
          <option value="US">Startup Name - A to Z</option>
          <option value="CA">Startup Name - Z to A</option>
        </select>
      </div>
    </div>
  );
};

export default Sorting;

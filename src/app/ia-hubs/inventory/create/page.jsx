"use client"
import { create, getData } from '@/app/api/api';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavigateBackButton from '@/app/components/buttons/NavigateBackButton';
import { dataWithoutEmptyValues, trimInputValues, validateForm } from '@/app/common/formValidations';
import ProcessingSpinner from '@/app/components/loading/ProcessingSpinner';
import AddMoreInventory from '@/app/components/modals/AddMoreInventory';

export default function AddInventory({}) {
  const searchParams = useSearchParams();
  const hubId = searchParams.get("hubId")
  const initialFormData = {seat_id:"", type:"", capacity:"",seat_price:0, currency:"", billingCycle:"" , floor:"", active:true , hub:Number(hubId)}
  const userSession = useSession();
  const [formData, setFormData] = useState(initialFormData);
  const router = useRouter();
  const initialMeetingRoomData = {openingTime:"",closingTime:"", interval:30, creditsRequired:""};
  const [meetingRoomData, setMeetingRoomData] = useState(initialMeetingRoomData);
  const [bookingSlots, setBookingSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [errorOnSubmit, setErrorOnSubmit] = useState("")
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false)
  const inventoryFormValidationSchema = {
    seat_id: [{ required: true }],
    type: [{ required: true }],
    capacity: [{ required: true }]
  }
  const meetingRoomValidationSchema = {
    openingTime: [{ required: true }],
    closingTime: [{ required: true }],
    interval: [{ required: true }],
    creditsRequired: [{ required: true }]
  }

  console.log(userSession, hubId, formData)
  
  // get input values
  function getInventoryFormData(e){
    let {name,value} = e.target;
    setFormData({...formData,[name]:value});
    
    console.log(name, value);

    // if(value="single-seat"){
    //   setFormData({...formData, [name]:value, capacity:1})
    // }else{
    //   setFormData({...formData,[name]:value});
    // }

    if(Object.keys(errors)?.length>0){
      setErrors({...errors, [name]:""})
    }
    if(errorOnSubmit){
      setErrorOnSubmit("")
    }
    if(disableSubmitButton){
      setDisableSubmitButton(false)
    }
  } 

  // get input values for meeting room
  function getMeetingRoomFormData(e){
    const {name, value} = e.target;
    setMeetingRoomData(prev=>{return {...prev, [name]:value}})

    if(Object.keys(errors)?.length>0){
      setErrors({...errors, [name]:""})
    }
    if(errorOnSubmit){
      setErrorOnSubmit("")
    }
    if(disableSubmitButton){
      setDisableSubmitButton(false)
    }
  }

  function convertToTimeString(time=""){
    const newTimeArray = time?.split(":")
    const hour = newTimeArray?.[0];
    const minute = newTimeArray?.[1];
    return `${hour}:${minute}:00.000`
  }
  
  // To format opening and closing time and return validated data
  const formatMeetingRoomData = ()=>{
    const meetingRoomFormValidationErrors = validateForm(meetingRoomData,meetingRoomValidationSchema)

     if (Object.keys(meetingRoomFormValidationErrors).length > 0) {
        setErrors((prev)=>{return {...prev, ...meetingRoomFormValidationErrors}});
        setErrorOnSubmit("Empty/Invalid Inputs");
        return;
     }
     const newMeetingRoomData = {...meetingRoomData};
     newMeetingRoomData.openingTime = convertToTimeString(newMeetingRoomData.openingTime);
     newMeetingRoomData.closingTime = convertToTimeString(newMeetingRoomData.closingTime);
     return newMeetingRoomData
  }

  // validation for form inputs
  const validatedData = ()=>{
    const inventoryFormValidationErrors = validateForm(formData,inventoryFormValidationSchema)
 
    if (Object.keys(inventoryFormValidationErrors)?.length > 0) {
      setErrors(inventoryFormValidationErrors);
      return;
    }
    
    let newInvetoryData = {...formData, hubId:Number(hubId)};
    
    if(formData.type==="meeting-room"){
     const meetingRoomData = formatMeetingRoomData();
     if(!meetingRoomData) return
     newInvetoryData = {...newInvetoryData,...meetingRoomData};
    }

    newInvetoryData = dataWithoutEmptyValues(newInvetoryData)
    return newInvetoryData
  }

  const clearFormData = ()=>{
    setFormData(initialFormData)
    setMeetingRoomData(initialMeetingRoomData)
    setDisableSubmitButton(false)
    setIsFormSubmitting(false)
    setIsFormSubmitting(false)
  }

  // form submit
  async function submitForm(e){
    e.preventDefault();
    
    const newInvetoryData = validatedData();

    if(!newInvetoryData){
      setErrorOnSubmit("Empty/Invalid Inputs")
      return
    }
    
    setDisableSubmitButton(true)
    setIsFormSubmitting(true)
    const res = await create("inventories", userSession?.data?.token, {data:newInvetoryData});
    
    if(res?.ok){
      clearFormData();
      setShowModal(true);
    }else{
      const responseData = await res.json();
      setDisableSubmitButton(false)
      setIsFormSubmitting(false)
      setErrorOnSubmit(responseData?.error?.message);
    }
  }

  return (
    <div className="py-5 m-auto mb-10 max-w-6xl  w-full md:grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-5">
    <div className='w-full'><NavigateBackButton/></div>
    {showModal ? <AddMoreInventory closeModal = {()=>setShowModal(false)} hubId={hubId}/>:""}
    {/* Inventory Creation Form */}
     <div className="m-auto mt-5 w-full space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Inventory</h3>
                {/* <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can recieve mail.</p> */}
              </div>

              <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="seat_id" className="block text-sm font-medium text-gray-700">
                      Seat ID / Meeting Room Name
                    </label>
                    <input
                      id='seat_id'
                      type="text"
                      name="seat_id"
                      autoComplete='off'
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.seat_id}
                      onChange={getInventoryFormData}
                    />
                    {errors.seat_id && <div className="text-red-500 text-sm">{errors.seat_id}</div>}
                   </div>
               </div>
              {/* 2 */}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Inventory Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={getInventoryFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  >
                    <option value={""}>Choose an option</option>
                    <option value={"single-seat"}>Single Seat</option>
                    <option value={"cabin"}>Cabin</option>
                    <option value={"meeting-room"}>Meeting Room</option>
                  </select>
                  {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    id='capacity'
                    type="text"
                    name="capacity"
                    autoComplete='off'
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.capacity}
                    onChange={getInventoryFormData}
                  />
                  {errors.capacity && <div className="text-red-500 text-sm">{errors.capacity}</div>}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Floor
                  </label>
                  <select
                    id="floorNumber"
                    name="floorNumber"
                    value={formData?.floorNumber}
                    onChange={getInventoryFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  >
                    <option value={""}>Choose an option</option>
                    <option value={"0"}>0th</option>
                    <option value={"1"}>1st</option>
                    <option value={"2"}>2nd</option>
                    <option value={"3"}>3rd</option>
                    <option value={"4"}>4th</option>
                    <option value={"5"}>5th</option>
                    <option value={"6"}>6th</option>
                    <option value={"7"}>7th</option>
                    <option value={"8"}>8th</option>
                  </select>
                  {errors?.floorNumber && <div className="text-red-500 text-sm">{errors?.floorNumber}</div>}
                </div>
                {/* <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                    Floor
                  </label>
                  <select
                    id="floor"
                    name="floor"
                    value={formData.floor}
                    onChange={getInventoryFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  >
                    <option value={""}>Choose an option</option>
                    {}
                  </select>
                </div>   */}
              </div>
              {/* 3 */}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="seat_price" className="block text-sm font-medium text-gray-700">
                    Price/Seat
                  </label>
                  <input
                    id='seat_price'
                    type="text"
                    name="seat_price"
                    autoComplete='off'
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 sh`adow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.seat_price}
                    onChange={getInventoryFormData}
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={getInventoryFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  >
                    <option value={""}>Choose an option</option>
                    <option value={"INR"}>INR</option>
                    <option value={"USD"}>USD</option>
                  </select>
                </div>  

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700">
                    Billing Cycle
                  </label>
                  <select
                    id="billingCycle"
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={getInventoryFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  >
                    <option value={""}>Choose an option</option>
                    <option value={"Hourly"}>Hourly</option>
                    <option value={"Monthly"}>Monthly</option>
                    <option value={"Quarterly"}>Quarterly</option>
                  </select>
                </div>  
              </div>
            </div>
            
            {/* meeting room booking slot */}
            {formData.type==="meeting-room"?
              <div className='space-y-6 bg-white py-6 px-4 sm:p-6'>
                <div>
                  <div className="col-span-6 sm:col-span-1">
                    <label htmlFor="creditsRequired" className="block text-sm font-medium text-gray-700">
                        Credits Required
                    </label>
                    <input
                      id='creditsRequired'
                      type="text"
                      name="creditsRequired"
                      autoComplete='off'
                      value={meetingRoomData.creditsRequired}
                      onChange={getMeetingRoomFormData}
                      className="mt-1 block w-48 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    />
                    {errors.creditsRequired && <div className="text-red-500 text-sm">{errors.creditsRequired}</div>}
                  </div>
                </div>
                <div>
                  <h3 className="block text-sm mb-2 font-medium leading-6 text-gray-700">Timings</h3>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-1">
                      <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                        Opening time
                      </label>
                      <input
                        id='openingTime'
                        type="time"
                        name="openingTime"
                        value={meetingRoomData.openingTime}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                        onChange={getMeetingRoomFormData}
                      />
                      {errors.openingTime && <div className="text-red-500 text-sm">{errors.openingTime}</div>}
                    </div>
                    <div className="col-span-6 sm:col-span-1">
                      <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                        Closing time
                      </label>
                      <input
                        id='closingTime'
                        type="time"
                        name="closingTime"
                        value={meetingRoomData.closingTime}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                        onChange={getMeetingRoomFormData}
                      />
                      {errors.closingTime && <div className="text-red-500 text-sm">{errors.closingTime}</div>}
                    </div>  
                    <div className="col-span-6 sm:col-span-1">
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                        Intervals (mins.)
                      </label>
                      <input
                        id='interval'
                        type="text"
                        name='interval'
                        value={meetingRoomData.interval}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                        onChange={getMeetingRoomFormData}
                      />
                      {errors.interval && <div className="text-red-500 text-sm">{errors.interval}</div>}
                    </div>
                  </div>
                </div>
              </div>
              :""
            }

            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              {errorOnSubmit && <div className="text-red-500 mb-5 text-sm">{errorOnSubmit}</div>}
              <button
                onClick={submitForm}
                type="submit"
                disabled = {disableSubmitButton}
                className=" disabled:opacity-50 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {isFormSubmitting ? <ProcessingSpinner/>:"Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

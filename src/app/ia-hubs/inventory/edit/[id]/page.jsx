"use client"
import { edit, getOne, getUserRoleAndHubs } from '@/app/api/api'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NavigateBackButton from '@/app/components/buttons/NavigateBackButton'
import { useSession } from 'next-auth/react'
import UnauthorizedAction from '@/app/components/errorPages/UnauthorizedAction'
import DataUnavailable from '@/app/components/errorPages/DataUnavailable'
import { convertToPascalCase } from '@/app/common/common'
import { convertToTimeString } from '@/app/common/common'
import { dataWithoutEmptyValues } from '@/app/common/formValidations'

export default function Edit({params}) {
  const searchParams = useSearchParams();
  const hubId = searchParams.get("hubId")
  const initialFormData = {seat_id:"", type:"", capacity:"",seat_price:"", currency:"", billingCycle:"" , floorNumber:"", active:"" }
  const [formData, setFormData] = useState(initialFormData);
  const userSession = useSession();
  const [isUserAllowedToAccessHubData, setIsUserAllowedToAccessHubData] = useState(true);
  const [dataExistsForSelectedHub, setDataExistsForSelectedHub] = useState(true);
  const [inventoryData, setInventoryData] = useState();
  const router = useRouter();
  const [meetingRoomTimings, setMeetingRoomTimings] = useState({openingTime:"",closingTime:"", interval:30, creditsRequired:""});
  const [bookingSlots, setBookingSlots] = useState([]);
  

  useEffect(()=>{

    const fetchData = async () => {
        const  {data}  = await getOne("inventories", userSession?.data?.token, params.id, hubId);
        // console.log(data)
        if(data?.[0]){
          setInventoryData(data?.[0]);
          setFormData(data?.[0]?.attributes);
          setDataExistsForSelectedHub(true);
          setIsUserAllowedToAccessHubData(true);
           // test, set the data in form itself;
           if(data?.[0]?.attributes?.type==="meeting-room"){
            const {attributes:{openingTime,closingTime,interval, creditsRequired}={}} = data?.[0];
            setMeetingRoomTimings(prev=>{return {...prev,openingTime:openingTime, closingTime:closingTime, interval:interval||30, creditsRequired:creditsRequired||""}})
            // below, null value arguments are handled, otherwise loop will run infinitly and browser will freeze
            // if needed, this feature can be avoided
            generateBookingSlots(openingTime||1, closingTime||0, interval||30);
           }
        }else{
          setDataExistsForSelectedHub(false);
        }
      };

      if(userSession.status==='authenticated'){
        userAccessAllowedWithHubId();
        fetchData();
      }
  },[params.id, userSession.status, hubId])

  async function userAccessAllowedWithHubId(){
    const userRoleAndHubs = await getUserRoleAndHubs(userSession?.data?.token);
    const isUserAllowed = userRoleAndHubs?.hubs?.some((hub) => hub.id === Number(hubId)); // returns boolean
    setIsUserAllowedToAccessHubData(isUserAllowed);
  }


  if(userSession.status==='loading'){
    return <h1>Loading...</h1>;
  }

  if(!isUserAllowedToAccessHubData){
    return <UnauthorizedAction/>
  }

  if(!dataExistsForSelectedHub){
    return <DataUnavailable/>
  }

  function displayInventoryTypeHeading(type=""){
    if(type==="meeting-room") return "Meeting Room";
    else if(type==="cabin") return "Cabin";
    return "Seat";
  }

  // additional feature: to diaplay all the slot between opening and closing time
  function generateBookingSlots(start=1, end=0, interval=30){
    let startTime = new Date(`1970-01-01T${start}`)
    let endTime = new Date(`1970-01-01T${end}`)
    const slots = [];

    while(startTime.getTime()<(endTime.getTime()-((interval-1)*60000))){
      slots.push(startTime.toLocaleTimeString());
      startTime = new Date(startTime.getTime()+interval*60000)
    }
    setBookingSlots(slots);
  }

  function getTimingsFromInput(e){
    const {name, value} = e.target;
    setMeetingRoomTimings(prev=>{return {...prev, [name]:value}})
  }

  function setNewFormData(e){
    let {name,value} = e.target;
    setFormData({...formData,[name]:value});
  }

  async function changeMeetingRoomTimings(e){
    e.preventDefault()
    const openingTimeInString = convertToTimeString(meetingRoomTimings?.openingTime)
    const closingTimeInString = convertToTimeString(meetingRoomTimings?.closingTime)
    const newInterval = Number(meetingRoomTimings?.interval) || 30;
    const res = await edit("inventories",userSession?.data?.token ,params.id,{data:{openingTime:openingTimeInString ,closingTime:closingTimeInString, interval:newInterval}});
    // console.log("response",await res.json());
    // console.log(openingTimeInString, closingTimeInString, newInterval)
    if(res?.ok){
      router.refresh();
      generateBookingSlots(openingTimeInString, closingTimeInString, newInterval);
    }
  }


  async function submitForm(e){
    e.preventDefault();
    let newInvetoryData = {...formData};

    if(formData.type==="meeting-room"){
      const newMeetingRoomTimings = {...meetingRoomTimings};
     newMeetingRoomTimings.openingTime = convertToTimeString(newMeetingRoomTimings.openingTime)
     newMeetingRoomTimings.closingTime = convertToTimeString(newMeetingRoomTimings.closingTime)
     newInvetoryData = {...newInvetoryData,...newMeetingRoomTimings}
    }

    newInvetoryData = dataWithoutEmptyValues(newInvetoryData)
    const res = await edit("inventories",userSession?.data?.token ,params.id,{data:{...newInvetoryData}});
    if(res?.ok){
      router.refresh();
      router.back();
    }
  }

  return (
    <div className="py-5 m-auto mb-10 max-w-6xl  w-full md:grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-5">
     <div className='w-full'><NavigateBackButton/></div>
      <div className="m-auto mt-5 w-full space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Manage {displayInventoryTypeHeading(inventoryData?.attributes?.type)}</h3>
                {/* <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can recieve mail.</p> */}
              </div>

               <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="seat_id" className="block text-sm font-medium text-gray-700">
                      Seat ID / Meeting Room
                    </label>
                    <input
                      id='seat_id'
                      type="text"
                      name="seat_id"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      value={formData?.seat_id}
                      onChange={setNewFormData}
                    />
                  </div>
               </div>

              <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData?.type}
                    onChange={setNewFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value={"single-seat"}>Single Seat</option>
                    <option value={"cabin"}>Cabin</option>
                    <option value={"meeting-room"}>Meeting Room</option>
                  </select>
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    id='capacity'
                    type="text"
                    name="capacity"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={formData?.capacity}
                    onChange={setNewFormData}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="floorNumber" className="block text-sm font-medium text-gray-700">
                    Floor
                  </label>
                  <select
                    id="floorNumber"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={setNewFormData}
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
                    <option value={"9"}>9th</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="seat_price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    id='seat_price'
                    type="text"
                    name="seat_price"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={formData?.seat_price}
                    onChange={setNewFormData}
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData?.currency || ""}
                    onChange={setNewFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Choose currency</option>
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
                    value={formData.billingCycle || ""}
                    onChange={setNewFormData}
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
            {inventoryData?.attributes?.type==="meeting-room"?
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
                        value={meetingRoomTimings?.creditsRequired || ""}
                        className="mt-1 block w-48 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={getTimingsFromInput}
                      />
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
                        value={meetingRoomTimings.openingTime}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={getTimingsFromInput}
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-1">
                      <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                        Closing time
                      </label>
                      <input
                        id='closingTime'
                        type="time"
                        name="closingTime"
                        value={meetingRoomTimings.closingTime}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={getTimingsFromInput}
                      />
                    </div>  
                    <div className="col-span-6 sm:col-span-1">
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                        Intervals (mins.)
                      </label>
                      <input
                        id='interval'
                        type="text"
                        name='interval'
                        value={meetingRoomTimings.interval}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={getTimingsFromInput}
                      />
                    </div>
                    <div className="flex items-end justify-start col-span-6 sm:col-span-1">  
                      <button 
                        onClick={changeMeetingRoomTimings}
                        className='mb-0.5 justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                      Save timings
                    </button>
                  </div>
                  </div>
                  
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-700">Booked Slots</h3>
                  <div className='w-full grid grid-cols-8 gap-1'>
                    {bookingSlots.map((slot)=>{
                      return <div key={slot}
                      className='bg-slate-200 p-2 text-sm text-center col-span-1 rounded'
                      >{slot}</div>
                    })}
                  </div>
                </div>
              </div>
              :""
            }

            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button
                onClick={submitForm}
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

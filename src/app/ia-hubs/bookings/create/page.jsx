"use client";
import { create, deleteData, getData } from "@/app/api/api";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NavigateBackButton from "@/app/components/buttons/NavigateBackButton";
import MeetingRoomSlotBooking from "@/app/components/meetingRoomBooking/MeetingRoomSlotBooking";

export default function AddCustomer({ params }) {
  const searchParams = useSearchParams();
  const hubId = searchParams.get("hubId");
  const userSession = useSession();
  const [selcetedMeetingRoomId, setSelectedMeetingRoomId] = useState("");
  const [selcetedMeetingRoomData, setSelectedMeetingRoomData] = useState({});
  const [meetingRoomList, setMeetingRoomList] = useState([])
  

  useEffect(()=>{
    if(userSession.status==="authenticated"){
      getMeetingRooms();
    }
  },[userSession.status])

  async function getMeetingRooms(){
    const filters = `filters[type][$eq]=${"meeting-room"}`
    const {responseData, responseStatus} = await getData(`inventories`, userSession.data?.token, hubId, filters)
  
    setMeetingRoomList(responseData?.data)
  }

  const handleSelectMeetingRoom = (e)=>{
    const meetingRoomId = Number(e.target.value);
    setSelectedMeetingRoomId(meetingRoomId);
    const meetingRoomData = meetingRoomList.find((room)=>room.id===meetingRoomId)
    console.log("meeting room", meetingRoomData)
    setSelectedMeetingRoomData(meetingRoomData)
  }
  

  return (
    <div className="py-5 m-auto max-w-6xl w-full md:grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-5">
      <div className="px-5 lg:px-0 ">
        <NavigateBackButton />
      </div>
      <div className="m-auto mt-5 w-full h-screen space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <div className="bg-red-100 sm:overflow-hidden sm:rounded">
            <div className="space-y-6  py-6 px-4 sm:p-6">
              <div className="border-b border-red-200 pb-2">
                <h3 className="text-lg font-medium leading-6 text-gray-700">
                  Book New Meeting
                </h3>
              </div>
              <div className="bg-slate-100 text-center text-red-500 text-sm">
                {/* {errorOnSubmit} */}
              </div>
              
              {/* meeting room selection */}
              <div className="">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Meeting Room
                </label>
                <select
                  type="text"
                  name="name"
                  className="mt-1 block w-full sm:w-1/2 md:w-2/5 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  value={selcetedMeetingRoomId}
                  onChange={handleSelectMeetingRoom}
                >
                    <option value="">Select Meeting Room</option>
                    {meetingRoomList?.map((meetingRoom)=>{
                        return <option value={meetingRoom.id} key={meetingRoom?.id}>{meetingRoom.attributes.seat_id}</option>
                    })}
                </select>
                {/* {errors.name && (
                  <div className="text-red-500 text-sm">{errors.name}</div>
                )} */}
              </div>
            </div>

            {/* Booking slots */}

            {selcetedMeetingRoomId? <MeetingRoomSlotBooking meetingRoomData={selcetedMeetingRoomData} session={userSession}/>:""}

          </div>
      </div>
    </div>
  );
}

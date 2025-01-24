import { getData, getUserRoleAndHubs } from "@/app/api/api";
import { getServerSession } from "next-auth";
import DeleteButton from "@/app/components/buttons/DeleteButton";
import Link from "next/link";
import { options } from "@/app/api/auth/[...nextauth]/options";
import PageNotFound from "@/app/components/errorPages/PageNotFound";
import UnauthorizedUser from "@/app/components/errorPages/UnauthorizedUser";
import UndefinedHub from "@/app/components/errorPages/UndefinedHub";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";
import BookingDropdown from "@/app/components/actions/BookingDropdown";
import Loading from "@/app/loading";
import CancelButton from "@/app/components/buttons/CancelButton";
import ConvertTolocalTimeFromUtc from "@/app/components/TimeConversion/TimeFormat";
import Pagination from "@/app/components/actions/Pagination";
import BookingListFilterByDate from "@/app/components/actions/BookingListFilterByDate";
import BookingsFilterByMeetingRoom from "@/app/components/actions/BookingsFilterByMeetingRoom";
import { getTodaysDate } from "@/app/common/common";


export default async function InventoryList({searchParams}) {

  const userSession = await getServerSession(options);
  const userRoleAndHubs = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParams = searchParams.hubId;
  const todaysDate = getTodaysDate();

  const dateFilter = searchParams?.filter1 || `filters[date][$eq]=${todaysDate}`;
  const meetingRoomFilter = searchParams?.filter2;
  const filterString = `${dateFilter}&${meetingRoomFilter}`;
  const bookingSort = `sort[0]=date:desc&sort[1]=startTime`;
  const apiPagination = `pagination[page]=${searchParams?.page||1}`;

  if(userSession.role!=="authenticated"){
    return <UnauthorizedUser/>;
  }

  if(!hubIdFromSearchQueryParams){
    return <UndefinedHub/>;
  }

  const isUserAllowedToAccessHubData = userRoleAndHubs?.hubs?.some((hub) => hub.id === Number(hubIdFromSearchQueryParams)); 

  if(!isUserAllowedToAccessHubData){
    return <PageNotFound/>
  }

    const { responseData, responseStatus, error, errorMessage } = await getData("bookings", userSession?.token, hubIdFromSearchQueryParams,filterString, bookingSort, apiPagination);
    
    if (error) {
      return <h1>{JSON.stringify(error)}</h1>;
    }

    if(responseStatus!=="OK"){
      return <h1>{JSON.stringify(responseStatus)}</h1>;
    }

    // if response returns the data, only then destructure the object, in all the above cases there will be no data, instead there will be errors.
    const { data } = responseData;
    const { pagination } = responseData?.meta;
    console.log(data);
    console.log(pagination)

  function formatTime(utcDateString){
    try {
      if (utcDateString) {
        const utcDate = new Date(utcDateString);
        const localTimeString = utcDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        return localTimeString;
      }
    } catch (error) {
      return null;
    }
  }


  function calculateMeetingDuration(startTimeString, endTimeString) {
    const startTime = new Date(startTimeString);
    const endTime = new Date(endTimeString);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "NA";
    }

    const durationMilliseconds = endTime - startTime;
    const durationMinutes = (durationMilliseconds / (1000 * 60));

    if (durationMinutes === 60) {
      return `1 hour`;
    } else if (durationMinutes > 60) {
      const hours = (durationMinutes / 60);
      return `${hours} hours`;
    } else {
      return `${durationMinutes} minutes`;
    }
  }

  function convertToLocalDates(dateTime=""){
    const newDate = new Date(dateTime);
    return `${newDate.getDate().toString().padStart(2,0)}-${(newDate.getMonth()+1).toString().padStart(2,0)}-${newDate.getFullYear()}`
  }

  function checkMeetingStatus(bookingData){
    const today = new Date();
    const {date, startTime, endTime} = bookingData?.attributes
    const meetingDate = new Date(date);
    const meetingStart = new Date(startTime);
    const meetingEnd = new Date(endTime);
    const todaysDate = convertToLocalDates(today);
    const meetingEndDate = convertToLocalDates(meetingEnd);
    if(meetingEnd?.getTime()<today.getTime() && todaysDate ===  meetingEndDate){
      return <span className="text-green-500">Completed</span>
    }else if(meetingEnd?.getTime()<today.getTime()){
      return "Delete"
    }else if(meetingStart?.getTime()>today.getTime()){
      return "Cancel"
    }else{
      return "In progress"
    }
  }

  return (
    <div className="px-4 m-auto mb-20 max-w-7xl mt-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        </div>
        
        <div className="mt-4 sm:mt-0 flex-none items-end sm:ml-16 sm:flex">
          <div className="mr-3">
            <BookingsFilterByMeetingRoom token = {userSession?.token}/>
          </div>
          <div className="mr-3">
            <BookingListFilterByDate/>
          </div>
          <div className="mr-3">
            {/* <BookingDropdown/> */}
          </div>
          <Link href={`/ia-hubs/bookings/create?hubId=${hubIdFromSearchQueryParams}`}>
            <button className="inline-flex mb-5 px-4 py-2 sm:mb-0 items-center justify-center rounded-md border border-transparent bg-red-600 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Book new meeting
            </button>
          </Link>
        </div>
      </div>
        {/* 
          below "pagination.pageCount" is taken instead of "data.length" because it will take care of pagination. 
          If user inputs a page number greater than total pagecount availbale then it will let the pagination component 
          re-render and pagination component will compare the values and append the value page=1 in url string.
        */}

      {!data ? <Loading/> : data && pagination.pageCount!==0 ? 

      <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {/* <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Booking ID
              </th> */}
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Date
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Meeting room
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Duration
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Start time
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                End time
              </th>
              {/* <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Booked by
              </th> */}
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Company name
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.map((booking) => (
              <tr key={booking.id}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                  {convertToLocalDates(booking?.attributes?.date)}
                  <dl className="font-normal lg:hidden">
                    {/* <dt className="sr-only">Meeting room</dt>
                    <dd className="mt-1 truncate text-gray-700">{(booking?.attributes?.date)}</dd> */}
                    {/* <dt className="sr-only sm:hidden">booking type</dt> */}
                    <dd className="mt-1 truncate text-gray-500 lg:hidden">{booking?.attributes?.inventory?.data?.attributes?.seat_id}</dd>
                    <dt className="sr-only sm:hidden">Meeting room</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{booking?.attributes?.duration}</dd>
                    <dt className="sr-only sm:hidden">Start time</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{<ConvertTolocalTimeFromUtc utcDateTimeString={booking?.attributes?.startTime} /> }</dd>
                    <dt className="sr-only sm:hidden">End time</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{<ConvertTolocalTimeFromUtc utcDateTimeString={booking?.attributes?.endTime} />}</dd>
                    <dt className="sr-only sm:hidden">Booked by</dt>
                    {/* <dd className="mt-1 truncate text-gray-500 sm:hidden">{booking?.attributes?.bookedBy}</dd> */}
                    <dt className="sr-only sm:hidden">Company name</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{booking?.attributes?.customer?.data?.attributes?.name}</dd>
                  </dl>
                </td>
                {/* <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">{(booking?.attributes?.date)}</td> */}
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">{booking?.attributes?.inventory?.data?.attributes?.seat_id}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{calculateMeetingDuration(booking?.attributes?.startTime, booking?.attributes?.endTime)}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{<ConvertTolocalTimeFromUtc utcDateTimeString={booking?.attributes?.startTime} />}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{<ConvertTolocalTimeFromUtc utcDateTimeString={booking?.attributes?.endTime} />}</td>
                {/* <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{booking?.attributes?.bookedBy}</td> */}
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{booking?.attributes?.customer?.data?.attributes?.name}</td>
                <td className="py-4 pl-3 pr-4 text-right text-sm text-red-500 font-medium sm:pr-6">
                  
                {/*{checkMeetingStatus(booking)==="Cancel"?
                  <CancelButton endPoint={"bookings"} token = {userSession?.token} id={booking?.id} deleteItemName={booking?.attributes?.bookingId}/>
                  :checkMeetingStatus(booking)==="Cancel"? <DeleteButton  endPoint={"bookings"} token = {userSession?.token} id={booking?.id} deleteItemName={"meeting"}/>
                  :""} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <Pagination totalItems ={pagination?.total} itemsPerPage={pagination.pageSize} pageNumber = {pagination?.page} pageCount = {pagination?.pageCount} currentPageNumber={searchParams?.page}/>
        </div>
      </div>
      :<DataUnavailable/>}
    </div>
  )
}

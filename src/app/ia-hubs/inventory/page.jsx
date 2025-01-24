import { getData, getUserRoleAndHubs } from "@/app/api/api";
import { getServerSession } from "next-auth";
import DeleteButton from "@/app/components/buttons/DeleteButton";
import Link from "next/link";
import { options } from "@/app/api/auth/[...nextauth]/options";
import PageNotFound from "@/app/components/errorPages/PageNotFound";
import UnauthorizedUser from "@/app/components/errorPages/UnauthorizedUser";
import UndefinedHub from "@/app/components/errorPages/UndefinedHub";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";
import Pagination from "@/app/components/actions/Pagination";
import FilterInventoryType from "@/app/components/actions/FilterInvetoryType";

export default async function InventoryList({searchParams}) {
  const userSession = await getServerSession(options);
  const userRoleAndHubs = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParams = searchParams?.hubId;
  const currentPage = `pagination[page]=${searchParams?.page || 1}`;
  const currentPageNumber = searchParams?.page;

  const inventoryTypeFilter = searchParams?.inventoryType;
  const filterString = `${inventoryTypeFilter}`;
  console.log(filterString)

  if(userSession.role!=="authenticated"){
    return <UnauthorizedUser/>
  }

  if(!hubIdFromSearchQueryParams){
    return <UndefinedHub/>
  }

  const isUserAllowedToAccessHubData = userRoleAndHubs?.hubs?.some((hub) => hub.id === Number(hubIdFromSearchQueryParams)); 

  if(!isUserAllowedToAccessHubData){
    return <PageNotFound/>
  }

    const { responseData, responseStatus, error, errorMessage } = await getData("inventories", userSession?.token, hubIdFromSearchQueryParams, filterString, currentPage);
    const { data } = responseData;
    const { pagination } = responseData?.meta;
   
      
    if (error) {
      return <h1>{JSON.stringify(error)}</h1>
    }

    if(!responseData?.data && responseStatus!=="OK"){
      return <h1>{JSON.stringify(responseStatus)}</h1>
    }

    function convertToPascalCase(string=""){
      if(typeof string===typeof ""){
          const stringArr = string.split("-");
          let convertedString = stringArr.map((ele)=>{
          const arrayFromString = ele.split("")
          arrayFromString[0] = arrayFromString[0].toUpperCase()
          return arrayFromString.join("");
        })
        return convertedString.join(" ")
      }
      return "";
    }


  return (
    <div className="px-4 m-auto max-w-7xl mt-4 mb-10 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex-none items-end sm:ml-16 sm:flex">
          <div className="mr-3">
            <FilterInventoryType/>
          </div>
          <Link href={`/ia-hubs/inventory/create?hubId=${hubIdFromSearchQueryParams}`}>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Inventory
          </button></Link>
        </div>
      </div>

      {data?.length>0 ? 

      <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Seat ID
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Seat type
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Capacity
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Floor
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Price
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Currency
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((seat) => (
              <tr key={seat.seat_id}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                  {seat.attributes.seat_id}
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Seat ID</dt>
                    <dd className="mt-1 truncate text-gray-700">{convertToPascalCase(seat.attributes.type)}</dd>
                    <dt className="sr-only sm:hidden">Seat type</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{seat.attributes.capacity}</dd>
                    <dt className="sr-only sm:hidden">Capacity</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{seat.attributes.seat_price}</dd>
                    <dt className="sr-only sm:hidden">Floor</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{seat.attributes.floorNumber}</dd>
                    <dt className="sr-only sm:hidden">Currency</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">{seat.attributes.currency}</dd>
                    <dt className="sr-only sm:hidden">Status</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">
                      <span className={`inline-flex rounded-full border  px-2 text-xs font-semibold leading-5 ${seat?.attributes?.allocation?.data?.id? "border-red-300 bg-red-100 text-red-800":"border-green-300 bg-green-100 text-green-800"} `}>
                        {seat?.attributes?.allocation?.data?.id ? "Allocated":"Unallocated"}
                      </span>
                  </dd>
                  </dl>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">{convertToPascalCase(seat.attributes.type)}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{seat.attributes.capacity}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">{seat.attributes.floorNumber}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{new Intl.NumberFormat().format(seat.attributes.seat_price)}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{seat.attributes.currency}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                  <span className={`inline-flex rounded-full border  px-2 text-xs font-semibold leading-5 ${seat?.attributes?.allocation?.data?.id? "border-red-300 bg-red-100 text-red-800":"border-green-300 bg-green-100 text-green-800"} `}>
                    {seat?.attributes?.allocation?.data?.id ? "Allocated":"Unallocated"}
                  </span>
                </td>
                {/* <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link href={`/ia-hubs/customers/view/${seat.id}`} className="text-red-600 hover:text-red-900">
                    View<span className="sr-only">, {seat.name}</span>
                  </Link>
                </td> */}
                <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link href={`/ia-hubs/inventory/edit/${seat.id}?hubId=${hubIdFromSearchQueryParams}`} className="text-red-600 hover:text-red-900">
                    Edit<span className="sr-only">, {seat.name}</span>
                  </Link>
                </td>
                <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <DeleteButton endPoint={"inventories"} token = {userSession?.token} id={seat.id} deleteItemName={seat.attributes.seat_id}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
        <Pagination totalItems ={pagination?.total} itemsPerPage={pagination.pageSize} pageNumber = {pagination?.page} currentPageNumber={currentPageNumber}/>
        </div>
      </div>
      :<DataUnavailable/>}
      
    </div>
  )
}

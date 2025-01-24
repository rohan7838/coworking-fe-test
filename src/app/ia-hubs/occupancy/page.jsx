import { getData, getUserRoleAndHubs } from "@/app/api/api";
import { getServerSession } from "next-auth";
import DeleteButton from "@/app/components/buttons/DeleteButton";
import Link from "next/link";
import { options } from "@/app/api/auth/[...nextauth]/options";
import PageNotFound from "@/app/components/errorPages/PageNotFound";
import UndefinedHub from "@/app/components/errorPages/UndefinedHub";
import UnauthorizedUser from "@/app/components/errorPages/UnauthorizedUser";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";
import Pagination from "@/app/components/actions/Pagination";

export default async function OccupancyList({ searchParams }) {
  const userSession = await getServerSession(options);
  const userRoleAndHubs = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParams = searchParams.hubId;
  const apiPagination = `pagination[page]=${searchParams?.page || 1}`;

  if (userSession.role !== "authenticated") {
    return <UnauthorizedUser />;
  }

  if (!hubIdFromSearchQueryParams) {
    return <UndefinedHub />;
  }

  const isUserAllowedToAccessHubData = userRoleAndHubs?.hubs?.some(
    (hub) => hub.id === Number(hubIdFromSearchQueryParams)
  );

  if (!isUserAllowedToAccessHubData) {
    return <PageNotFound />;
  }

  const { responseData, responseStatus, error, errorMessage } = await getData(
    "allocations",
    userSession?.token,
    hubIdFromSearchQueryParams,
    apiPagination
  );
  const { data } = responseData;
  const { pagination } = responseData?.meta;

  if (error) {
    return <h1>{JSON.stringify(error)}</h1>;
  }

  if (!responseData?.data && responseStatus !== "OK") {
    return <h1>{JSON.stringify(responseStatus)}</h1>;
  }

  return (
    <div className="px-4 m-auto mb-20 max-w-7xl mt-4 sm:px-6 lg:px-8">
      {/* {JSON.stringify(data)} */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Occupancy</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href={`/ia-hubs/occupancy/create?hubId=${hubIdFromSearchQueryParams}`}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add occupancy
            </button>
          </Link>
        </div>
      </div>

      {data?.length > 0 ? (
        <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Seat Id / Cabin
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Seats Occupied
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Price/Seat
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Contract Start Date
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Contract End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((occupancy) => (
                <tr key={occupancy.id}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                    {occupancy.attributes.customer?.data?.attributes?.name}
                    <dl className="font-normal lg:hidden">
                      <dt className="sr-only">seat_id</dt>
                      <dd className="mt-1 truncate text-gray-700">
                        {
                          occupancy.attributes.inventory?.data?.attributes
                            .seat_id
                        }
                      </dd>
                      <dt className="sr-only">number_Of_Seats_Occupied</dt>
                      <dd className="mt-1 truncate text-gray-700">
                        {occupancy?.attributes?.numberOfSeatsOccupied}
                      </dd>
                      <dt className="sr-only sm:hidden">price_per_seat</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">
                        INR {Number(occupancy?.attributes?.offeredPricePerSeat)?.toFixed(2)}
                      </dd>
                      <dt className="sr-only sm:hidden">contract_Start_Date</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">
                        {occupancy?.attributes?.contractStartDate}
                      </dd>
                      <dt className="sr-only sm:hidden">contract_end_date</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">
                        {occupancy?.attributes?.contractEndDate}
                      </dd>
                    </dl>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                    {occupancy.attributes.inventory?.data?.attributes?.seat_id}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                    {occupancy?.attributes?.numberOfSeatsOccupied}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                    INR {Number(occupancy?.attributes?.offeredPricePerSeat)?.toFixed(2)}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {occupancy?.attributes?.contractStartDate}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {occupancy.attributes.contractEndDate}
                  </td>
                  {/* <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link
                    href={`/ia-hubs/customers/view/${allocation.id}`}
                    className="text-red-600 hover:text-red-900"
                  >
                    View<span className="sr-only">, {"NA"}</span>
                  </Link>
                </td> */}
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link
                      href={`/ia-hubs/occupancy/edit/${occupancy.id}?hubId=${hubIdFromSearchQueryParams}`}
                      className="text-red-600 hover:text-red-900"
                    >
                      Edit<span className="sr-only">, {occupancy.id}</span>
                    </Link>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <DeleteButton
                      endPoint={"allocations"}
                      token={userSession?.token}
                      id={occupancy.id}
                      deleteItemName={"Occupancy"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <Pagination
              totalItems={pagination?.total}
              itemsPerPage={pagination.pageSize}
              pageNumber={pagination?.page}
              currentPageNumber={searchParams?.page}
            />
          </div>
        </div>
      ) : (
        <DataUnavailable />
      )}
    </div>
  );
}

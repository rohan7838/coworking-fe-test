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
import CustomerSearchFilter from "@/app/components/actions/CustomerSearchFilter";

export default async function CustomersList({ searchParams }) {
  const userSession = await getServerSession(options);
  const userRoleAndHubs = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParams = searchParams?.hubId || userRoleAndHubs?.hubs?.[0]?.id;
  const apiPagination = `pagination[page]=${searchParams?.page || 1}`;
  const customerFilter = searchParams?.customerId
  const filters = `${customerFilter}`
  let filteredData = []

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
    "customers",
    userSession?.token,
    hubIdFromSearchQueryParams,
    filters,
    apiPagination
  );
  const { data } = responseData;
  const { pagination } = responseData?.meta;

  if(filters!==undefined){
    filteredData = [...data];
  }
  
  if (error) {
    return (
      <div>
        <h1>{JSON.stringify(error)}</h1>
      </div>
    );
  }

  if (!responseData?.data && responseStatus !== "OK") {
    return (
      <div>
        <h1>{JSON.stringify(responseStatus)}</h1>
      </div>
    );
  }

  return (
    <div className="px-4 m-auto mb-20 max-w-7xl mt-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-col-reverse sm:flex-row sm:items-center">
          <div className="sm:mr-5  mt-4 sm:mt-0">
            <CustomerSearchFilter data={filteredData} />
          </div>
          <Link
            href={`/ia-hubs/customers/create?hubId=${hubIdFromSearchQueryParams}`}
          >
            <button
              type="button"
              className="inline-flex w-full items-center h-12 sm:h-auto justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
            >
              Add new company
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
                  Company name
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Company email
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Company contact
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  POC
                </th>
                {/* <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Some data
              </th> */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {data?.length > 0 &&
                data.map((customer) => (
                  <tr key={customer?.id}>
                    <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                      {customer.attributes.name}
                      <dl className="font-normal lg:hidden">
                        <dt className="sr-only">Title</dt>
                        <dd className="mt-1 truncate text-gray-700">
                          {customer.attributes.email}
                        </dd>
                        <dt className="sr-only sm:hidden">Email</dt>
                        <dd className="mt-1 truncate text-gray-500 sm:hidden">
                          {customer.attributes.contact_number}
                        </dd>
                      </dl>
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                      {customer.attributes.email}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                      {customer.attributes.contact_number}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                      {customer?.attributes?.user?.data?.attributes
                        ?.firstName || "--"}{" "}
                      {customer?.attributes?.user?.data?.attributes?.lastName}
                    </td>
                    {/* <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                  Gurugram  
                </td> */}
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/ia-hubs/customers/edit/${customer.id}?hubId=${hubIdFromSearchQueryParams}`}
                        className="text-red-600 hover:text-red-900"
                      >
                        Edit<span className="sr-only">, {customer.name}</span>
                      </Link>
                    </td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <DeleteButton
                        endPoint={"customers"}
                        token={userSession?.token}
                        deleteItemName={customer.attributes.name}
                        id={customer.id}
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

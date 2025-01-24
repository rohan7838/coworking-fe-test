import { getData, getUserRoleAndHubs } from "@/app/api/api";
import Link from "next/link";
import { getServerSession } from "next-auth";
import Pagination from "@/app/components/actions/Pagination";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ComplaintRequirementCheckbox from "@/app/components/actions/complaintRequirementCheckbox";
import UndefinedHub from "@/app/components/errorPages/UndefinedHub";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";

const calculateRemainingSLA = (timestamp="") => {
  try {
    const timestampDate = new Date(timestamp);
    const now = new Date();
    const endOfDayTime = new Date(timestampDate.getTime() + 86400000);

    if (now > endOfDayTime) {
      return "00:00";
    }

    const timeDiff = endOfDayTime?.getTime() - now?.getTime();
    const minutesRemaining = Math.floor(timeDiff / (1000 * 60));
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const remainingMinutes = minutesRemaining % 60;

    return `${String(hoursRemaining)} hrs ${String(remainingMinutes)?.padStart(2, '0')} mins`;
  } catch (error) {
    console.error("Error calculating SLA", error);
    return "";
  }
};

export default async function CustomersList({ searchParams }) {
  const userSession = await getServerSession(options);
  const currentPage = searchParams?.page || 1;
  const customerFilter = searchParams?.customerId;
  const filters = `${customerFilter}`;
  
  // Fetch user role and hubs for complaints
  const userRoleAndHubsComplaints = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParamsComplaints = searchParams?.hubId || userRoleAndHubsComplaints?.hubs?.[0]?.id;

  // Fetch user role and hubs for requirements
  const userRoleAndHubsRequirements = await getUserRoleAndHubs(userSession?.token);
  const hubIdFromSearchQueryParamsRequirements = searchParams?.hubId || userRoleAndHubsRequirements?.hubs?.[0]?.id;
  
  if (!hubIdFromSearchQueryParamsRequirements) {
    return <UndefinedHub />;
  }

  // Fetch complaints data
  const { responseData: complaintsData=[] } = await getData(
    "complaints",
    userSession?.token,
    hubIdFromSearchQueryParamsComplaints,
    filters,
    `pagination[page]=${currentPage}`
  );
  
  const { data: complaints } = complaintsData || [];
  const { pagination: complaintsPagination } = complaintsData?.meta || {};
  
  // Fetch requirements data
  const { responseData: requirementsData } = await getData(
    "requirements",
    userSession?.token,
    hubIdFromSearchQueryParamsRequirements,
    filters,
    `pagination[page]=${currentPage}`
  );

  const { data: requirements } = requirementsData || [];
  const { pagination: requirementsPagination } = requirementsData?.meta || [];

  // Calculate combined pagination
  const totalItems = complaintsPagination?.total + requirementsPagination?.total;
  const itemsPerPage = Math.max(complaintsPagination?.pageSize, requirementsPagination?.pageSize);

  const isUserAllowedToAccessHubData = userRoleAndHubsComplaints?.hubs?.some(
    (hub) => hub?.id === Number(hubIdFromSearchQueryParamsComplaints)
  );
  
  // Combine complaints and requirements
  const combinedQueries = [
    ...(complaints || []).map(complaint => ({ ...complaint, type: 'complaint' })),
    ...(requirements || []).map(requirement => ({ ...requirement, type: 'requirement' }))
  ];
  

  // Sort the combined array by createdAt timestamp (most recent first)
  const sortedQueries = combinedQueries?.sort((a, b) => 
    new Date(b?.attributes?.createdAt) - new Date(a?.attributes?.createdAt)
  );

  console.log(sortedQueries)

  if(sortedQueries?.length<=0){
    return <DataUnavailable />
  }
 
  return (
    <div className="px-4 m-auto mb-20 max-w-7xl mt-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="mt-4 sm:mt-0 sm:mr-auto flex flex-col-reverse sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold text-gray-900">Queries</h1>
        </div>
      </div>

      <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-2 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-4">
                Select
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Company name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Timestamp
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                SLA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedQueries.map((query) => (
              <tr key={`${query?.type}-${query?.id}`}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                  <ComplaintRequirementCheckbox 
                    isHandledInitial={query?.attributes?.isHandled} 
                    id={query?.id} 
                    token={userSession?.token} 
                    type={query?.type}
                  />
                </td>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                  {query?.attributes?.customer?.data?.attributes?.name}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {new Date(query?.attributes?.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {query.type.charAt(0).toUpperCase() + query?.type?.slice(1)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {calculateRemainingSLA(query?.attributes?.createdAt)}
                </td>
                <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link
                    href={`/ia-hubs/queries/${query?.type}/${query?.id}?hubId=${
                      query.type === 'complaint' 
                        ? hubIdFromSearchQueryParamsComplaints 
                        : hubIdFromSearchQueryParamsRequirements
                    }`}
                    className="text-red-600 hover:text-red-900"
                  >
                    Select
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            pageNumber={currentPage}
            currentPageNumber={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
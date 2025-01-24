import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { getData, getUserRoleAndHubs, getOne } from "@/app/api/api";
import Link from "next/link";

const CompanyView = async ({ params, searchParams }) => {
    const userSession = await getServerSession(options);
    const userRoleAndHubs = await getUserRoleAndHubs(userSession?.token);
    const hubIdFromSearchQueryParams = searchParams?.hubId || userRoleAndHubs?.hubs?.[0]?.id;

    const { responseData: requirementsData } = await getData(
        "requirements",
        userSession?.token,
        hubIdFromSearchQueryParams,
    );
    const { data: requirements } = requirementsData;

    const requirement = requirements.find((requirement) => requirement.id === parseInt(params.id, 10));

    let suggestedCompanies = [];
    if (requirement && requirement.attributes && requirement.attributes.queryDomain) {
        const { responseData: customersData } = await getData(
            "customers",
            userSession?.token,
            hubIdFromSearchQueryParams,
            `filters[selectedDomain][$contains]=${requirement.attributes.queryDomain}&filters[selectedSubdomain][$contains]=${requirement.attributes.querySubdomain}`
        );
        suggestedCompanies = customersData.data;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="container mx-auto">
                {requirement && (
                    <div key={requirement.id} className="bg-white p-6 rounded-lg shadow-sm border-4">
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4 underline">
                            {requirement.attributes.customer.data.attributes.name}
                        </h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2 underline">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><span className="font-semibold">IA Hub:</span> {requirement.attributes.hub.data.attributes.location}</div>
                            <div><span className="font-semibold">Email ID:</span> {requirement.attributes.customer.data.attributes.email}</div>
                            <div><span className="font-semibold">Contact No:</span> {requirement.attributes.customer.data.attributes.contact_number}</div>
                            <div><span className="font-semibold">Website URL:</span> {requirement.attributes.customer.data.attributes.website}</div>
                            <div><span className="font-semibold">Service Category:</span> {requirement.attributes.queryDomain}</div>
                            <div><span className="font-semibold">Sub Category:</span> {requirement.attributes.querySubdomain}</div>
                            <div><span className="font-semibold">Query:</span> {requirement.attributes.requirementDescription}</div>
                            <div><span className="font-semibold">Budget:</span> {requirement.attributes.budget}</div>
                            <div><span className="font-semibold">Expected Delivery:</span> {requirement.attributes.expectedDelivery}</div>
                            <div><span className="font-semibold">Special Requirements:</span> {requirement.specialRequirementDescription}</div>
                        </div>
                    </div>
                )}
                <div className="bg-white p-6 rounded-lg shadow-sm mt-6 overflow-x-scroll">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2 underline">Suggested Companies</h2>
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 text-center">S.No</th>
                                <th className="py-2 px-4 text-center">Company Name</th>
                                <th className="py-2 px-4 text-center">IA Hub</th>
                                <th className="py-2 px-4 text-center">Email ID</th>
                                <th className="py-2 px-4 text-center">Phone No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestedCompanies.map((company, index) => (
                                <tr key={company.attributes.id}>
                                    <td className="py-2 px-4 text-center">{index + 1}</td>
                                    <td className="py-2 px-4 text-center">{company.attributes.name}</td>
                                    <td className="py-2 px-4 text-center">{company.attributes.hub?.data?.attributes?.location}</td>
                                    <td className="py-2 px-4 text-center">{company.attributes.email}</td>
                                    <td className="py-2 px-4 text-center">{company.attributes.contact_number}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4">
                    <Link href={`/ia-hubs/queries?hubId=${hubIdFromSearchQueryParams}`}>
                        <button
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Back
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CompanyView;

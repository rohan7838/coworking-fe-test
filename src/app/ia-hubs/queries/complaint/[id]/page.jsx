import { getData, getUserRoleAndHubs, getOne } from "@/app/api/api";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import Link from "next/link";

export default async function CompanyView({ params, searchParams }) {
    console.log(params.id)

    const userSession = await getServerSession(options);
    const userRoleAndHubsComplaints = await getUserRoleAndHubs(userSession?.token);
    const hubIdFromSearchQueryParamsComplaints = searchParams?.hubId || userRoleAndHubsComplaints?.hubs?.[0]?.id;

    const { responseData: complaintsData } = await getData(
        "complaints",
        userSession?.token,
        // params.id,
        hubIdFromSearchQueryParamsComplaints,
    );
    const { data: complaints } = complaintsData;

    function checkComplaint(complaint) {
        return complaint.id == params.id;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="container mx-auto">
                {complaints?.filter(checkComplaint).map((complaint) => (
                    <div key={complaint.id} className="bg-white p-6 rounded-lg shadow-sm mb-6 border-4">
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4 underline">{complaint.attributes.customer.data.attributes.name}</h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2 underline">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                            <div><span className="font-semibold">Inquirer name:</span> {complaint.attributes.inquirerName}</div>
                            <div><span className="font-semibold">Inquirers contact:</span> {complaint.attributes.inquirerContact}</div>
                            <div><span className="font-semibold">Query:</span> {complaint.attributes.complaintDescription}</div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2 underline">Company Detail</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><span className="font-semibold">IA Hub:</span> {complaint.attributes.hub.data.attributes.location}</div>
                            <div><span className="font-semibold">Email ID:</span> {complaint.attributes.customer.data.attributes.email}</div>
                            <div><span className="font-semibold">Contact No:</span> {complaint.attributes.customer.data.attributes.contact_number}</div>
                            <div><span className="font-semibold">Website URL:</span> {complaint.attributes.customer.data.attributes.website}</div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end mt-4">
                    <Link href={`/ia-hubs/queries?hubId=${hubIdFromSearchQueryParamsComplaints}`}>
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
}

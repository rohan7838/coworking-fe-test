import { getData } from "@/app/api/api";
import Link from "next/link";
import Pagination from "../actions/Pagination";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import ViewButton from "../buttons/ViewButton";
import Sorting from "../actions/Sorting";

  const Display= async({endPoint}) => {

    const  {responseData, responseStatus, error, errorMessage}  = await getData(endPoint);
    
    if (error) {
      return <h1>{JSON.stringify(error)}</h1>
    }

    if(!responseData?.data && responseStatus!=="OK"){
      return <h1>{JSON.stringify(responseStatus)}</h1>
    }

    const {data} = responseData;

    const excludeFields = ["id","_id","__v","createdAt","updatedAt", "publishedAt"];
    const objKeys = Object.keys(data[0]?.attributes);

    const fields = objKeys.filter((key)=>{
      return !excludeFields.includes(key)
    })

    const tableHeadings = fields.map((field)=>{
      return field.replaceAll(/[&\/\#,+()$~%.'":*?<>{}_-]/g," ").toUpperCase();
    })

    function checkIsFieldNumber(value){
      return typeof value === Number;
    }

    function paymentStatusCSS(paymentStatus){
      paymentStatus = paymentStatus?.toLowerCase();
        return paymentStatus==="paid" ? "green":paymentStatus==="unpaid"?"red":"gray";
    }
    
    return (
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Data List</h1>
            <h2 className="text-lg font-semibold text-gray-900">{"[Hub Name]"}</h2>
          </div>
          {/* {JSON.stringify(tableHeadings)}  */}
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Data
            </button>
          </div>
        </div>

        <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <Sorting/>
        </div>

        <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {tableHeadings.map((field)=>{
                  return (
                  <th key={field} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    {field}
                  </th>)
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((element) => (
                <tr key={data.id}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                    {element.attributes.name}
                    <dl className="font-normal lg:hidden">
                      <dt className="sr-only">Title</dt>
                      <dd className="mt-1 truncate text-gray-700">{element.attributes.email}</dd>
                      <dt className="sr-only sm:hidden">Email</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">{element.attributes.seats_allocated}</dd>
                    </dl>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{element.attributes.email}</td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">{element.attributes.seats_allocated}</td>
                  <td className={`hidden px-3 py-4 text-sm text-${paymentStatusCSS(element.attributes.payment_status)}-700 sm:table-cell`}>
                    <div className={`border border-${paymentStatusCSS(element.attributes.payment_status)}-300 bg-${paymentStatusCSS(element.attributes.payment_status)}-300 w-fit px-3 py-1 rounded-md`}>
                      {element.attributes.payment_status}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">{element.attributes.contact_person}</td>

                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                   <ViewButton id={element.id}/>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                   <EditButton id={element.id}/>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <DeleteButton/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination/>
      </div>
    )
  }
  

  export default Display
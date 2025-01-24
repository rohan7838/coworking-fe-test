import { useCallback, useEffect, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CustomerSearchQuery({ updateFormData, customerData }) {
  const userSession = useSession();
  const token = userSession.data?.token;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryResponseData, setSearchQueryResponseData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers?filters[name][$contains]=${searchQuery}&filters[hub][id][$eq]=${hubIdFromSearchQueryParams}`;

  function setSearchQueryValue(e) {
    setSearchQuery(e.target.value);
    setSelectedCustomer(e.target.value);
    // here updateFromData will keep the sected customer as empty input in case "user" first selects customer and then remove the customer
    // in such cases it will clear the value of previously selected customer.
    updateFormData("", "");
  }

  const fetchSearchQueryDataFromApi = useCallback(
    async (url) => {
      if (searchQuery !== "") {
        const response = await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
        if (!response?.ok) {
          return;
        }
        const responseData = await response.json();
        setSearchQueryResponseData(responseData?.data);
      }
    }, [searchQuery,token]);

  useEffect(() => {
    let timer = setTimeout(() => {
      fetchSearchQueryDataFromApi(url);
    }, 200);
    return () => clearTimeout(timer);
  }, [url, fetchSearchQueryDataFromApi]);

//   below useEffect is to clear the search input value when the user changes the hub id
  useEffect(()=>{
    setSelectedCustomer("");
  },[hubIdFromSearchQueryParams])

  const filteredCustomerData =
    searchQuery === ""
      ? searchQueryResponseData
      : searchQueryResponseData.filter((element) => {
          return element.attributes.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

  // "getSelectedCustomerFromOptions" will send customer id to form data and also set customer selected from search query result options
  function getSelectedCustomerFromOptions(id, customerId) {
    const customerData = filteredCustomerData.find((element) => element.id === id);
    setSelectedCustomer(customerId);
    updateFormData(id, customerData);
  }
  
  return (
    <Combobox as="div" >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        Customer Name <span className="text-red-600">*</span>
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
          onChange={setSearchQueryValue}
          displayValue={(person)=>person}
          value={selectedCustomer || customerData?.attributes?.name || ""}
          placeholder="Search Customer Name"
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredCustomerData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCustomerData.map((element) => (
              <Combobox.Option
                key={element?.id}
                value={element?.attributes?.name}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-red-600 text-white" : "text-gray-900"
                  )
                }
                onClick={() =>
                  getSelectedCustomerFromOptions(
                    element?.id,
                    element?.attributes?.name
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {element?.attributes?.name}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-red-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

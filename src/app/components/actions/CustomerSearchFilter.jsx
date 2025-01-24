"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CustomerSearchFilter({ data = [] }) {
  const userSession = useSession();
  const token = userSession.data?.token;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryResponseData, setSearchQueryResponseData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers?filters[name][$contains]=${searchQuery}&filters[hub][id][$eq]=${hubIdFromSearchQueryParams}`;
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const customerFilter = searchParams.get("customerId");
  const isInitialRender = useRef(true)

  // To convert url string parameters to readable format:
  function getUrlParameter(string) {
    string = string?.replace(/[\[]/, "[").replace(/[\]]/, "]");
    return string;
  }

  const appendFIlterInSearchParams = (filterKey, filterValue) => {
    let queryString;
    if (filterValue === "" || typeof filterValue !== "number") {
      params.delete(filterKey);
      queryString = params.toString();
      router.push(`${pathname}?${queryString}`);
      return;
    }
    const filterString = `filters[id][$eq]=${filterValue}`;
    params.set(filterKey, filterString);
    queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  };

  function setSearchQueryValue(e) {
    setSearchQuery(e.target.value);
    setSelectedCustomer(e.target.value);
  }

  function handleSelectionChange(newValue) {
    setSelectedCustomer(newValue);
    getSelectedCustomerFromOptions(newValue);
  }

  // Fetch search query
  const fetchSearchQueryDataFromApi = useCallback(
    async (url) => {
      if (searchQuery !== "") {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response?.ok) {
          return;
        }
        const responseData = await response.json();
        setSearchQueryResponseData(responseData?.data);
      }
    },
    [searchQuery, token]
  );

  useEffect(() => {
    let timer = setTimeout(() => {
      fetchSearchQueryDataFromApi(url);
    }, 500);
    return () => clearTimeout(timer);
  }, [url, fetchSearchQueryDataFromApi]);

  useEffect(() => {
    if (customerFilter && data?.length>0) {
      setSelectedCustomer(data?.[0])
    }
  }, []);

  //   below useEffect is to clear the search input value when the user changes the hub
  useEffect(()=>{
    if(!isInitialRender.current){
      setSelectedCustomer({});
    }
    isInitialRender.current = false
  },[hubIdFromSearchQueryParams])

  // "getSelectedCustomerFromOptions" will send customer id to form data and also set customer selected from search query result options
  function getSelectedCustomerFromOptions(customer) {
    appendFIlterInSearchParams("customerId", customer?.id);
  }

  const clearFilter = () => {
    params.delete("customerId");
    const queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
    setSelectedCustomer({})
  };

  const filteredCustomerData =
    searchQuery === ""
      ? searchQueryResponseData
      : searchQueryResponseData.filter((element) => {
          return element.attributes.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={selectedCustomer?.attributes?.name || ""}
      onChange={handleSelectionChange}
    >
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
          onChange={setSearchQueryValue}
          displayValue={selectedCustomer?.attributes?.name || ""}
          autoComplete="off"
          placeholder="Search customer"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>
        {selectedCustomer?.id ? (
          <button
            className="block absolute right-0 text-xs text-red-500"
            onClick={clearFilter}
          >
            Clear filter
          </button>
        ) : (
          ""
        )}

        {filteredCustomerData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCustomerData.map((customer) => (
              <Combobox.Option
                key={customer.id}
                value={customer}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ||
                      customer?.attributes?.name ===
                        selectedCustomer?.attributes?.name
                      ? "bg-red-600 text-white"
                      : "text-gray-900"
                  )
                }
                onClick={() => getSelectedCustomerFromOptions(customer)}
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selected ||
                          (customer?.attributes?.name ===
                            selectedCustomer?.attributes?.name &&
                            "font-semibold")
                      )}
                    >
                      {customer?.attributes?.name}
                    </span>

                    {selected ||
                      (customer?.attributes?.name ===
                        selectedCustomer?.attributes?.name && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            active ||
                              customer?.attributes?.name ===
                                selectedCustomer?.attributes?.name
                              ? "text-white"
                              : "text-red-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ))}
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

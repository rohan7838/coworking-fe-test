import { useCallback, useEffect, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { useSearchParams } from "next/navigation";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SeatSearchQuery({ updateFormData, seatData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryResponseData, setSearchQueryResponseData] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventories?filters[seat_id][$contains]=${searchQuery}&filters[hub][id][$eq]=${hubIdFromSearchQueryParams}&filters[allocation][id][$null]=${true}`;

  function setSearchQueryValue(e) {
    setSearchQuery(e.target.value);
    setSelectedSeat(e.target.value);
    // here updateFromData will keep the sected seat as empty input in case "user" first selects seat and then remove the seat
    // in such cases it will clear the value of previously selected seat.
    updateFormData("", "");
  }

  const fetchSearchQueryDataFromApi = useCallback(
    async (url) => {
      if (searchQuery !== "") {
        const response = await fetch(url);
        if (!response?.ok) {
          return;
        }
        const responseData = await response.json();
        setSearchQueryResponseData(responseData?.data);
      }
    }, [searchQuery]);

  useEffect(() => {
    let timer = setTimeout(() => {
      fetchSearchQueryDataFromApi(url);
    }, 200);
    return () => clearTimeout(timer);
  }, [url, fetchSearchQueryDataFromApi]);

//   below useEffect is to clear the search input value when the user changes the hub id
  useEffect(()=>{
    setSelectedSeat("");
  },[hubIdFromSearchQueryParams])

  const filteredSeatData =
    searchQuery === ""
      ? searchQueryResponseData
      : searchQueryResponseData.filter((element) => {
          return element.attributes.seat_id
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

        // "getSelectedSeatFromOptions" will send seat id to form data and also set seat selected from search query result options
  function getSelectedSeatFromOptions(id, seatId) {
    const inventoryData = filteredSeatData.find((element) => element.id === id);
    setSelectedSeat(seatId);
    updateFormData(id, inventoryData);
  }
  
  return (
    <Combobox as="div" >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        Seat Id / Cabin Id <span className="text-red-600">*</span>
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
          onChange={setSearchQueryValue}
          // displayValue={(person)=>person}
          value={selectedSeat || seatData?.attributes?.seat_id || ""}
          placeholder="Search Seat/Cabin"
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredSeatData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredSeatData.map((element) => (
              <Combobox.Option
                key={element?.id}
                value={element?.attributes?.seat_id}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-red-600 text-white" : "text-gray-900"
                  )
                }
                onClick={() =>
                  getSelectedSeatFromOptions(
                    element?.id,
                    element?.attributes?.seat_id
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
                      {element?.attributes?.seat_id}
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

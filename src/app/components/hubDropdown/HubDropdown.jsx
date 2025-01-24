import { Fragment, useCallback, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSearchParams } from "next/navigation";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DynamicMenu = ({ additionalClass,  sessionStatus,  onChangeFunction,  hubsArray }) => {
  const searchParams = useSearchParams();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const [selectedOption, setSelectedOption] = useState();
  const [selectedId, setSelectedId] = useState( Number(hubIdFromSearchQueryParams) || hubsArray?.[0]?.id );

  //   setHubOption will set hub option at mounting stage either based on hubId From Search Query Params params or 0th index of hubsArray
  const setHubOption = useCallback(() => {

    if (hubIdFromSearchQueryParams) {
      const hub = hubsArray?.find((ele) => {
        return ele.id === Number(hubIdFromSearchQueryParams);
      });
      setSelectedId(Number(hubIdFromSearchQueryParams));
      setSelectedOption(`${hub?.location}`);
    } else {
      setSelectedId(hubsArray?.[0]?.id);
      setSelectedOption(`${hubsArray?.[0]?.location}`);
    }

  }, [hubsArray, hubIdFromSearchQueryParams]);

  useEffect(() => {
    setHubOption();
  }, [setHubOption]);

  const handleHubSelection = (value) => {
    setSelectedOption(`${value.location}`);
    onChangeFunction(value.id);
    setSelectedId(value?.id);
  };

  return (
    <Menu
      as="div"
      className={`${additionalClass} relative w-full sm:w-full lg:w-3/5 inline-block text-left`}
    >
      <div className="w-full inline-flex items-center relative">
        <Menu.Button className="w-full text-left truncate line-clamp-1 gap-x-1.5 rounded-md border border-gray-300 ring-0 ring-gray-300  bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 ">
          {sessionStatus === "loading" ? "Loading..." : selectedOption}
        </Menu.Button>
        <ChevronDownIcon
          className="absolute right-2 -mr-1 h-5 w-5 color bg-white text-gray-400"
          aria-hidden="true"
        />
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {hubsArray?.length > 0 &&
            hubsArray?.map((option) => (
              <div className="py-1 hover:cursor-pointer" key={option.hubId}>
                <Menu.Item>
                  {({ active }) => (
                    <li
                      className={classNames(
                        active ? "bg-red-500 text-gray-900" : "text-gray-700",
                        selectedId === option.id
                          ? "bg-red-500 text-white"
                          : "bg-white",
                        "block px-4 py-2 text-sm hover:bg-red-300"
                      )}
                      onClick={() => handleHubSelection(option)}
                    >
                      {option.location}
                    </li>
                  )}
                </Menu.Item>
              </div>
            ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DynamicMenu;

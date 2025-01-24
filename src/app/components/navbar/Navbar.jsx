"use client";
import { Fragment, Suspense, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { useRouter } from "next/navigation";
import { getUserRoleAndHubs } from "@/app/api/api";
import Loading from "@/app/loading";
import { useSearchParams } from "next/navigation";
import HubDropdown from "../hubDropdown/HubDropdown";


export default function Navbar() {

  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [userHubs, setUserHubs] = useState([]);
  const [hubIdSearchQuery, setHubIdSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const search = searchParams.get("hubId");
// console.log(session)
  const navigation = [
    { title: "Dashboard", path: "/ia-hubs/dashboard" },
    { title: "Customers", path: "/ia-hubs/customers" },
    { title: "Inventory", path: "/ia-hubs/inventory" },
    { title: "Occupancy", path: "/ia-hubs/occupancy" },
    { title: "Bookings", path: "/ia-hubs/bookings" },
    { title: "Queries", path: "/ia-hubs/queries" },
  ];

  function userSignOut() {
    signOut({ callbackUrl: "/login" });
  }

  useEffect(()=>{
    getUserHubs();
  },[session])


  // use api instead of server session to get the data in real time.
  function setInitalHubIdInAllRoutes(hubId){
    setHubIdSearchQuery(hubId)
  }


  async function getUserHubs(){
    const userRoleAndHubs = await getUserRoleAndHubs(session?.data?.token);
    setUserHubs(userRoleAndHubs?.hubs);
    setInitalHubIdInAllRoutes(search || userRoleAndHubs?.hubs?.[0]?.id)
  }


  function appendHubSearchQueryToUrl(value){
    setHubIdSearchQuery(value);
    router.push(`?hubId=${value}`);
}

  return (
    <Disclosure as="nav" className="bg-white fixed top-0 left-0 right-0 z-50 shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center lg:hidden">

                  {/* Mobile menu button */}

                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="relative flex flex-shrink-0 items-center">
                  {/* <Image src={'/assets/logos/IA-logo.png'} fill alt='IA-logo'/> */}
                  <img
                    className="block h-5 w-auto lg:hidden"
                    src="/assets/logos/IA-logo.png"
                    alt="Your Company"
                  />
                  <img
                    className="hidden h-6 w-auto lg:block"
                    src="/assets/logos/IA-logo.png"
                    alt="Your Company"
                  />
                </div>
                <div className="hidden md:ml-6 lg:flex md:space-x-8">

                  {navigation.map((navItem) => {
                    return (
                      <Link
                        key={navItem.path}
                        href={{pathname:navItem.path, query:{hubId:hubIdSearchQuery}}}
                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                          pathname.includes(navItem.path)
                            ? "border-red-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                      >
                        {navItem.title}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex w-52 md:w-52 lg:w-80 justify-between items-center">

                {/* user hub options */}
                
                <Suspense fallback={<Loading/>}>
                  <HubDropdown additionalClass = "hidden sm:block" sessionStatus = {session.status} onChangeFunction = {appendHubSearchQueryToUrl} hubsArray = {userHubs}/>
                </Suspense>

                {/* Signout */}

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className="relative hidden lg:inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={userSignOut}
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 pt-2 pb-3">
              <div className="w-full px-4 sm:hidden">

                <HubDropdown additionalClass = "" sessionStatus = {session.status} onChangeFunction = {appendHubSearchQueryToUrl} hubsArray = {userHubs}/>
              </div>
              {navigation.map((navItem) => {
                return (
                  <Link
                    key={navItem.path}
                    href={{pathname:navItem.path, query:{hubId:hubIdSearchQuery}}}
                    className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium sm:pl-5 sm:pr-6 ${
                      pathname === navItem.path
                        ? "bg-indigo-50 border-red-500 text-red-700"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {navItem.title}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  className="block ml-3 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:px-6"
                  onClick={userSignOut}
                >
                  <span>Logout</span>
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

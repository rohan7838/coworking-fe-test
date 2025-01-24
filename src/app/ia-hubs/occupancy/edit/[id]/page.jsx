"use client";
import { edit, getSingleEntityData, getUserRoleAndHubs } from "@/app/api/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import NavigateBackButton from "@/app/components/buttons/NavigateBackButton";
import CustomerSearchQuery from "@/app/components/searchQuery/CustomerSearchQuery";
import SeatSearchQuery from "@/app/components/searchQuery/SeatSearchQuery";
import { useSession } from "next-auth/react";
import ProcessingSpinner from "@/app/components/loading/ProcessingSpinner";
import {
  dataWithoutEmptyValues,
  validateForm,
} from "@/app/common/formValidations";
import Loading from "@/app/components/loading/loading";
import UnauthorizedAction from "@/app/components/errorPages/UnauthorizedAction";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";

export default function Edit() {
  const userSession = useSession();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const ref = useRef(true);

  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const token = userSession.data?.token;

  const initialFormData = {
    allocationId: "",
    customer: 0,
    inventory: 0,
    payments: 0,
    contractStartDate: "",
    contractEndDate: "",
    occupancyStartDate: "",
    occupancyEndDate: "",
    numberOfSeatsOccupied: "",
    numberOfBillableSeats: "",
    offeredPricePerSeat: "",
    securityDeposit: "",
    discountType: "",
    discount: "",
  };
  const formValidationSchema = {
    customer: [{ required: true }],
    inventory: [{ required: true }],
    numberOfSeatsOccupied: [{ required: true }],
    offeredPricePerSeat: [{ required: true }],
    securityDeposit: [{ required: true }],
    contractStartDate: [{ required: true }],
    contractEndDate: [{ required: true }],
    numberOfBillableSeats: [{ required: true }],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [customer, setCustomer] = useState({});
  const [inventory, setInventory] = useState({});
  const [isUserAllowedToAccessHubData, setIsUserAllowedToAccessHubData] = useState(true);
  const [dataExistsForSelectedHub, setDataExistsForSelectedHub] = useState(true);
  const [errors, setErrors] = useState({});
  const [errorOnSubmit, setErrorOnSubmit] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [apiResponseError, setApiResponseError] = useState({error: false, errorStatusCode: "", errorStatusText: "" });

  const fetchData = useCallback(async () => {
    if (token) {
      userAccessAllowedWithHubId();
      const { data } = await getSingleEntityData(`/allocations/${params?.id}?populate=*`, token);
      setCustomer(data?.attributes?.customer?.data);
      setInventory(data?.attributes?.inventory?.data);
      setFormData({
        customer: data?.attributes?.customer?.data?.id,
        inventory: data?.attributes?.inventory?.data?.id,
        payments: 0,
        contractStartDate: data?.attributes?.contractStartDate || "",
        contractEndDate: data?.attributes?.contractEndDate || "",
        occupancyStartDate: data?.attributes?.occupancyStartDate || "",
        occupancyEndDate: data?.attributes?.occupancyEndDate || "",
        numberOfSeatsOccupied: data?.attributes?.numberOfSeatsOccupied,
        numberOfBillableSeats: data?.attributes?.numberOfBillableSeats,
        offeredPricePerSeat: data?.attributes?.offeredPricePerSeat,
        securityDeposit: data?.attributes?.securityDeposit,
        discountType: data?.attributes?.discountType,
        discount: data?.attributes?.discount,
      });
      setDataExistsForSelectedHub(true);
    }
  }, [params.id, token, hubIdFromSearchQueryParams]);

  async function userAccessAllowedWithHubId() {
    const userRoleAndHubs = await getUserRoleAndHubs(userSession?.data?.token);
    const isUserAllowed = userRoleAndHubs?.hubs?.some(
      (hub) => hub.id === Number(hubIdFromSearchQueryParams)
    ); // returns boolean
    setIsUserAllowedToAccessHubData(isUserAllowed);
  }

  // Fetch occupancy data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // when user changes the hub, form data will reset to initial state to
  // prevent editing existing data (related to some other hub) in another hub.
  useEffect(() => {
    if (!ref.current) {
      setFormData(initialFormData);
      setCustomer({});
      setInventory({});
      redirect(`/ia-hubs/occupancy?hubId=${hubIdFromSearchQueryParams}`);
    }
    ref.current = false;
  }, [hubIdFromSearchQueryParams]);

  function getFormData(e) {
    let { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setApiResponseError((prev) => !prev.error);
  }

  function getDataFromSeatSearchQuery(id, data) {
    setFormData((prev) => {
      return { ...prev, inventory: id };
    });
    setInventory({ ...data });
  }

  function getDataFromCustomerSearchQuery(id, data) {
    setFormData((prev) => {
      return { ...prev, customer: id };
    });
    setCustomer({ ...data });
  }

  async function postDataToDB() {
    let newFormData = dataWithoutEmptyValues({ ...formData });
    const response = await edit("allocations", token, params.id, { data: { ...newFormData } });
    if (response?.ok) {
      router.refresh();
      router.push(`/ia-hubs/occupancy?hubId=${hubIdFromSearchQueryParams}`);
    } else {
      setDisableSubmitButton(false);
      setIsFormSubmitting(false);
      setApiResponseError({ error: true, errorStatusCode: response?.status, errorStatusText: response?.statusText });
    }
  }

  async function submitForm(e) {
    e.preventDefault();
    const formValidationErrors = validateForm(formData, formValidationSchema);
    if (Object.keys(formValidationErrors).length > 0) {
      setErrors((prev) => {
        return { ...prev, ...formValidationErrors };
      });
      setErrorOnSubmit("Empty/Invalid Inputs");
      return;
    }
    setDisableSubmitButton(true);
    setIsFormSubmitting(true);
    await postDataToDB();
  }

  if (userSession.status === "loading") {
    return <Loading />;
  }

  if (!isUserAllowedToAccessHubData) {
    return <UnauthorizedAction />;
  }

  if (!dataExistsForSelectedHub) {
    return <DataUnavailable />;
  }

  return (
    <div className="py-5 m-auto mb-10 max-w-6xl w-full md:grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-5">
      <div className="w-full">
        <NavigateBackButton />
      </div>
      <div className="m-auto mt-5 w-full space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 h-96 bg-white py-6 px-4 sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Create New Occupancy
                </h3>
              </div>

              <div className="w-full">
                {apiResponseError.error ? (
                  <p className="py-1 px-2 rounded-md  bg-gray-200 w-fit m-auto text-red-500 text-sm">
                    {apiResponseError.errorStatusCode}{" "}
                    {apiResponseError.errorStatusText}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <CustomerSearchQuery
                    updateFormData={getDataFromCustomerSearchQuery}
                    customerData={customer}
                  />
                  {errors.customer && (
                    <div className="text-red-500 text-xs">
                      {errors.customer}
                    </div>
                  )}
                </div>

                <div className=" col-span-6 sm:col-span-3 z-10">
                  <SeatSearchQuery
                    updateFormData={getDataFromSeatSearchQuery}
                    seatData={inventory}
                  />
                  {errors.inventory && (
                    <div className="text-red-500 text-xs">
                      {errors.inventory}
                    </div>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="numberOfSeatsOccupied"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Number Of Seats Occupied{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfSeatsOccupied"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData?.numberOfSeatsOccupied}
                    onChange={getFormData}
                  />
                  {errors.numberOfSeatsOccupied && (
                    <div className="text-red-500 text-xs">
                      {errors.numberOfSeatsOccupied}
                    </div>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="numberOfSeatsOccupied"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Number Of Billable Seats{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfBillableSeats"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData?.numberOfBillableSeats}
                    onChange={getFormData}
                  />
                  {errors.numberOfBillableSeats && (
                    <div className="text-red-500 text-xs">
                      {errors.numberOfBillableSeats}
                    </div>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="offeredPricePerSeat"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Offered Price Per Seat{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="offeredPricePerSeat"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData?.offeredPricePerSeat}
                    onChange={getFormData}
                  />
                  {errors.offeredPricePerSeat && (
                    <div className="text-red-500 text-xs">
                      {errors.offeredPricePerSeat}
                    </div>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="securityDeposit"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Security Deposit (INR){" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="securityDeposit"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData?.securityDeposit}
                    onChange={getFormData}
                  />
                  {errors.securityDeposit && (
                    <div className="text-red-500 text-xs">
                      {errors.securityDeposit}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-6 col-span-6">
                  <div className="col-span-6 sm:col-span-1">
                    <label
                      htmlFor="contract-end-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contract Start Date{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="contractStartDate"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData?.contractStartDate}
                      onChange={getFormData}
                    />
                    {errors.contractStartDate && (
                      <div className="text-red-500 text-xs">
                        {errors.contractEndDate}
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-1">
                    <label
                      htmlFor="contract-end-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contract End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="contractEndDate"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.contractEndDate}
                      onChange={getFormData}
                    />
                    {errors.contractEndDate && (
                      <div className="text-red-500 text-xs">
                        {errors.contractEndDate}
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-1">
                    <label
                      htmlFor="occupancyStartDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Customer Since
                    </label>
                    <input
                      type="date"
                      name="occupancyStartDate"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.occupancyStartDate}
                      onChange={getFormData}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-1">
                    <label
                      htmlFor="occupancyEndDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Customer Till
                    </label>
                    <input
                      type="date"
                      name="occupancyEndDate"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.occupancyEndDate}
                      onChange={getFormData}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              {errorOnSubmit && (
                <div className="text-red-500 mb-5 text-sm">{errorOnSubmit}</div>
              )}
              <button
                onClick={submitForm}
                type="submit"
                disabled={disableSubmitButton}
                className=" disabled:opacity-50 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {isFormSubmitting ? <ProcessingSpinner /> : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { create, getData } from "@/app/api/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CustomerSearchQuery from "@/app/components/searchQuery/CustomerSearchQuery";
import SeatSearchQuery from "@/app/components/searchQuery/SeatSearchQuery";
import NavigateBackButton from "@/app/components/buttons/NavigateBackButton";
import { useSearchParams } from "next/navigation";
import {
  dataWithoutEmptyValues,
  validateForm,
} from "@/app/common/formValidations";
import ProcessingSpinner from "@/app/components/loading/ProcessingSpinner";
export default function Edit() {
  const userSession = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
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
    hub: Number(hubIdFromSearchQueryParams),
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
  const [errors, setErrors] = useState({});
  const [errorOnSubmit, setErrorOnSubmit] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [isInputEmpty, setIsInputEmpty] = useState(false);
  const [apiResponseError, setApiResponseError] = useState({
    error: false,
    errorStatusCode: "",
    errorStatusText: "",
  });

  useEffect(() => {
    setFormData(initialFormData);
  }, [hubIdFromSearchQueryParams]);

  function getFormData(e) {
    let { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(value);
    if (Object.keys(errors)?.length > 0) {
      setErrors({ ...errors, [name]: "" });
    }
    if (errorOnSubmit) {
      setErrorOnSubmit("");
    }
    if (disableSubmitButton) {
      setDisableSubmitButton(false);
    }
    setApiResponseError((prev) => !prev.error);
  }

  function getDataFromSeatSearchQuery(id, data) {
    setFormData((prev) => {
      return { ...prev, inventory: id };
    });
  }

  function getDataFromCustomerSearchQuery(id, data) {
    setFormData((prev) => {
      return { ...prev, customer: id };
    });
  }

  function checkEmptyInput() {
    for (let key in formData) {
      if (!formData[key] && key !== "contractEndDate") {
        return true;
      }
    }
    return false;
  }

  async function postDataToDb() {
    let newFormData = dataWithoutEmptyValues({ ...formData });
    const response = await create("allocations", userSession.data?.token, {
      data: { ...newFormData },
    });
    if (response?.ok) {
      router.refresh();
      router.push(`/ia-hubs/occupancy?hubId=${hubIdFromSearchQueryParams}`);
    } else {
      // Below setFormData will handle the error: input "value" prop can not be null;
      // if the user submits the form and there is any error while submitting the form, "contractEndDate" value set to null in form data,
      // and if some value is not assigned to "contractEndDate" than there will be value prop error
      const responseData = await res.json();
      console.log(responseData);
      setDisableSubmitButton(false);
      setIsFormSubmitting(false);
      setErrorOnSubmit(responseData?.error?.message);
    }
  }

  async function submitForm(e) {
    e.preventDefault();

    const formValidationErrors = validateForm(formData, formValidationSchema);
    console.log(formValidationErrors);
    if (Object.keys(formValidationErrors).length > 0) {
      setErrors((prev) => {
        return { ...prev, ...formValidationErrors };
      });
      setErrorOnSubmit("Empty/Invalid Inputs");
      return;
    }
    setDisableSubmitButton(true);
    setIsFormSubmitting(true);
    await postDataToDb();
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
                    {apiResponseError.errorStatusText} / Allocation ID must be
                    unique!
                  </p>
                ) : (
                  ""
                )}
              </div>

              {/* <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Allocation Id
                </label>
                <input
                  type="text"
                  name="allocationId"
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  value={formData?.allocationId}
                  onChange={getFormData}
                />
                <div className="text-red-500 text-xs">
                  {isInputEmpty && !formData?.allocationId ? (
                    <span>Allocation id is required*</span>
                  ) : ("")}
                </div>
              </div> */}

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <CustomerSearchQuery
                    updateFormData={getDataFromCustomerSearchQuery}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { edit, getOne, getUserRoleAndHubs } from "@/app/api/api";
import NavigateBackButton from "@/app/components/buttons/NavigateBackButton";
import UnauthorizedAction from "@/app/components/errorPages/UnauthorizedAction";
import DataUnavailable from "@/app/components/errorPages/DataUnavailable";
import Loading from "@/app/components/loading/loading";
import { countryCodes} from "@/app/common/constants";
import { dataWithoutEmptyValues } from "@/app/common/formValidations";
import Link from "next/link";
import { BsEye } from 'react-icons/bs'
import { MdRemoveRedEye } from 'react-icons/md'
import MoreDetails from "@/app/components/moreDetail/moreDetails";

export default function Edit({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hubId = searchParams.get("hubId");
  const initialFormData = {
    name: "",
    email: "",
    contact_number: "",
    gstNumber: "",
    msmeRegistrationNumber: "",
    incorporationCertificateNumber: "",
    panNumber: "",
    tanNumber: "",
    registeredAddress: "",
    country: "",
    assignedCredits: "",
    balanceCredits: "",
    kycFiles: [],
    active: "",
    selectedSubdomain: "",
    selectedDomain: "",
    website: "",
    aboutservice: "",
  };
  const initialUserData = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    contactNumber: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [userFormData, setUserFormData] = useState(initialUserData);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState("");
  const userSession = useSession();
  const [isUserAllowedToAccessHubData, setIsUserAllowedToAccessHubData] =
    useState(true);
  const [dataExistsForSelectedHub, setDataExistsForSelectedHub] =
    useState(true);
  const [errorOnSubmit, setErrorOnSubmit] = useState("");
  const [companyCountryCode, setCompanyCountryCode] = useState(
    countryCodes[0].dialCode
  );
  const [userCountryCode, setUserCountryCode] = useState(
    countryCodes[0].dialCode
  );
  const fileUploadOptions = [
    { id: 1, fileName: "gstCertificate", displayValue: "GST Certificate" },
    {
      id: 2,
      fileName: "incorporationCertificate",
      displayValue: "Incorporation Certificate",
    },
    { id: 3, fileName: "directorPanCard", displayValue: "Director's PAN Card" },
    { id: 4, fileName: "companyPanCard", displayValue: "Company PAN Card" },
    {
      id: 5,
      fileName: "directorAadhaarCard",
      displayValue: "Director's Aadhar Card",
    },
    { id: 6, fileName: "msmeCertificate", displayValue: "MSME Certificate" },
  ];

  const [selectedFiles, setSelectedFiles] = useState({});
  const [errorOnUpload, setErrorOnUpload] = useState([]);
  const [fileUploadStatus, setFileUploadStatus] = useState({});
  const [kycFilesData, setKycFilesData] = useState([]);
  const Base_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

  useEffect(() => {
    const fetchData = async () => {
      const populate = "populate[kycFiles][populate]=*"
      const { data } = await getOne("customers", userSession?.data?.token, params.id, hubId);
      const kycFiles = await getOne("customers", userSession?.data?.token, params.id, `${hubId}&${populate}`);
      // console.log(data, kycFiles)
      if (data?.[0]) {
        const attributes = data[0].attributes;
        const user = attributes.user?.data;
        const companyContactNumberArray = attributes.contact_number?.split("-");
        const companyContactCountryCode = companyContactNumberArray && companyContactNumberArray?.length > 1 ? companyContactNumberArray[0] : "";
        const companyContactNumber = companyContactNumberArray.length > 1 ? companyContactNumberArray[1] : companyContactNumberArray[0];
        const userContactNumberArray = user?.attributes?.contactNumber?.split("-");
        const userContactCountryCode = userContactNumberArray && userContactNumberArray?.length > 1 ? userContactNumberArray?.[0] : "";
        const userContactNumber = userContactNumberArray?.length > 1 ? userContactNumberArray?.[1] : userContactNumberArray?.[0];
        // console.log(attributes)

        setFormData({
          ...formData,
          name: attributes?.name,
          email: attributes?.email,
          contact_number: companyContactNumber,
          gstNumber: attributes?.gstNumber,
          msmeRegistrationNumber: attributes?.msmeRegistrationNumber,
          incorporationCertificateNumber: attributes?.incorporationCertificateNumber,
          panNumber: attributes?.panNumber,
          tanNumber: attributes?.tanNumber,
          registeredAddress: attributes?.registeredAddress,
          country: attributes?.country,
          assignedCredits: attributes?.assignedCredits,
          balanceCredits: attributes?.balanceCredits,
          kycFiles: attributes?.kycFiles,
          active: attributes?.active,
          selectedSubdomain: attributes?.selectedSubdomain,
          selectedDomain: attributes?.selectedDomain,
          website: attributes?.website,
          aboutservice: attributes?.aboutservice,
        });
        setUserId(data?.[0]?.attributes?.user?.data?.id);
        setUserFormData({
          ...userFormData,
          firstName: user.attributes?.firstName,
          lastName: user.attributes?.lastName,
          username: user.attributes?.username,
          email: user?.attributes?.email,
          contactNumber: userContactNumber,
        });
        setCompanyCountryCode(companyContactCountryCode);
        setUserCountryCode(userContactCountryCode);
        setKycFilesData(kycFiles?.data?.[0]?.attributes?.kycFiles)
        setDataExistsForSelectedHub(true);
        setIsUserAllowedToAccessHubData(true);
      } else {
        setDataExistsForSelectedHub(false);
      }
    };

    if (userSession.status === "authenticated") {
      userAccessAllowedWithHubId();
      fetchData();
    }
  }, [params.id, userSession.status, hubId]);

  // *******************************************************************************************************

  async function userAccessAllowedWithHubId() {
    const userRoleAndHubs = await getUserRoleAndHubs(userSession?.data?.token);
    const isUserAllowed = userRoleAndHubs?.hubs?.some(
      (hub) => hub.id === Number(hubId)
    ); // returns boolean
    setIsUserAllowedToAccessHubData(isUserAllowed);
  }

  function getFormData(e) {
    let { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function getUserFormData(e) {
    let { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  }

  // file uploads

  const getFileNameAndId = (e) => {
    const id = e.target.value;
  };

  const collectFilesForUpload = (id, file) => {
    const uploadformData = new FormData();
    uploadformData.append("files", file);

    setSelectedFiles({ ...selectedFiles, [id]: uploadformData });
    setFileUploadStatus({ ...fileUploadStatus, [id]: "" })
  };

  // console.log(selectedFiles);

  const uploadKycFilesToDB = async (event, id, fileName) => {
    event.preventDefault();
    const fileToBeUploaded = selectedFiles[id];
    delete selectedFiles[id];
    try {
      const res = await fetch(`${Base_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userSession?.data?.token}` },
        body: fileToBeUploaded,
      });

      const uploadFileId = await res.json();

      if (!res?.ok) {
        setFileUploadStatus({ ...fileUploadStatus, [id]: `Error: ${uploadFileId?.error?.message}`, });
        return;
      }

      // Here kycFiles data is fetch, so that the array has all the files and does not replace the old files array in the Database
      const { data } = await getOne("customers", userSession?.data?.token, params.id, hubId);
      const fetchKycFilesFromDb = data[0]?.attributes?.kycFiles;

      const allKycFileData = [...fetchKycFilesFromDb, { fileName, media: uploadFileId?.[0].id }];

      if (!uploadFileId?.[0].id || allKycFileData.length === 0) {
        setFileUploadStatus({ ...fileUploadStatus, [id]: `Failed` })
        return
      }

      const customerEditResponse = await edit("customers", userSession?.data?.token, params.id, { data: { kycFiles: allKycFileData } });
      const responseMessage = await customerEditResponse.json();
      // console.log(responseMessage, allKycFileData)
      if (!customerEditResponse?.ok) {
        setFileUploadStatus({ ...fileUploadStatus, [id]: `Error: ${responseMessage?.error?.message}` });
        return;
      }

      setFileUploadStatus({ ...fileUploadStatus, [id]: "success" });
    } catch (error) { }
  };

  // Form validation
  function validateForm() {
    const validationErrors = {};

    if (!formData.name) {
      validationErrors.name = "Name is required";
    }

    if (!formData.email) {
      validationErrors.email = "Email is required";
    }

    if (!formData.contact_number) {
      validationErrors.contact_number = "Contact number is required";
    } else if (formData.contact_number.length !== 10) {
      validationErrors.contact_number = "Contact number must be 10 digits";
    }

    if (!userFormData.email) {
      validationErrors.userEmail = "Member email is required";
    }

    if (
      userFormData.password.length !== 0 &&
      userFormData.password.length < 6
    ) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    return validationErrors;
  }

  // Trim input values
  const trimInputValues = (data = {}) => {
    let newDataObject = { ...data };

    Object.keys(newDataObject).forEach((key) => {
      if (typeof newDataObject[key] === "string") {
        newDataObject = { ...newDataObject, [key]: newDataObject[key].trim() };
      }
    });
    return newDataObject;
  };

  // Submit updated data
  async function submitForm(e) {
    e.preventDefault();
    userFormData.username = userFormData?.email;
    let newFormData = { ...formData };
    let newUserFormData = { ...userFormData };
    newFormData.contact_number = `${companyCountryCode}-${newFormData.contact_number}`;
    newUserFormData.contactNumber = `${userCountryCode}-${newUserFormData.contactNumber}`;
    // console.log(newFormData)
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    newFormData = dataWithoutEmptyValues(newFormData)
    newUserFormData = dataWithoutEmptyValues(newUserFormData);

    newFormData = trimInputValues(newFormData);
    newUserFormData = trimInputValues(newUserFormData);

    const customerEditResponse = await edit(
      "customers",
      userSession?.data?.token,
      params.id,
      { data: { ...newFormData } }
    );
    const userEditResponse = await edit(
      "users",
      userSession?.data?.token,
      userId,
      { ...newUserFormData }
    );

    if (customerEditResponse?.ok && userEditResponse?.ok) {
      router.refresh();
      router.back();
    } else {
      const userEditError = await userEditResponse.json();
      const customerEditError = await customerEditResponse.json();
      const errorMessage = userEditError?.error?.message
        ? userEditError?.error?.message
        : customerEditError?.error?.message;
      setErrorOnSubmit(errorMessage);
    }
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
            <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
              <div>
                <h3 className=" bg-slate-200 w-fit py-1 rounded-md px-1 font-medium leading-6 text-gray-900">
                  Update Company Information
                </h3>
                {/* <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can recieve mail.</p> */}
              </div>
              <div className="bg-slate-100 text-center text-red-500 text-sm">
                {errorOnSubmit}
              </div>
              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="off"
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={formData?.name}
                  onChange={getFormData}
                />
                {errors.name && (
                  <div className="text-red-500 text-sm">{errors.name}</div>
                )}
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="contact_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Contact
                  </label>
                  <div className="flex items-center">
                    <select
                      className="mt-1 block w-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      value={companyCountryCode}
                      onChange={(e) => setCompanyCountryCode(e.target.value)}
                    >
                      {countryCodes.map((countryCode) => (
                        <option
                          key={countryCode.dialCode}
                          value={countryCode.dialCode}
                        >
                          {`${countryCode.country} (${countryCode.dialCode})`}
                        </option>
                      ))}
                    </select>

                    <input
                      id="contact_number"
                      type="text"
                      name="contact_number"
                      autoComplete="off"
                      className="remove-arrow mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.contact_number}
                      onChange={getFormData}
                    />
                  </div>

                  {errors.contact_number && (
                    <div className="text-red-500 text-sm">
                      {errors.contact_number}
                    </div>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="company_email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Email
                  </label>
                  <input
                    id="company_email"
                    type="text"
                    name="email"
                    autoComplete="off"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={formData?.email}
                    onChange={getFormData}
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm">{errors.email}</div>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="assignedCredits"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assign Credit Points
                  </label>
                  <input
                    id="assignedCredits"
                    type="text"
                    name="assignedCredits"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.assignedCredits || ""}
                    onChange={getFormData}
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="balanceCredits"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Balance Credit Points
                  </label>
                  <input
                    id="balanceCredits"
                    type="text"
                    name="balanceCredits"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.balanceCredits || ""}
                    onChange={getFormData}
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="gstNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    GST Number
                  </label>
                  <input
                    id="gstNumber"
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber || ""}
                    onChange={getFormData}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="panNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company PAN
                  </label>
                  <input
                    id="panNumber"
                    type="text"
                    name="panNumber"
                    value={formData.panNumber || ""}
                    onChange={getFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="incorporationCertificateNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Incorporation Certificate Number
                  </label>
                  <input
                    id="incorporationCertificateNumber"
                    type="text"
                    name="incorporationCertificateNumber"
                    value={formData.incorporationCertificateNumber || ""}
                    onChange={getFormData}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="msmeRegistrationNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    MSME Registration Number
                  </label>
                  <input
                    id="msmeRegistrationNumber"
                    type="text"
                    name="msmeRegistrationNumber"
                    value={formData.msmeRegistrationNumber || ""}
                    onChange={getFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="tanNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company TAN
                  </label>
                  <input
                    id="tanNumber"
                    type="text"
                    name="tanNumber"
                    value={formData.tanNumber || ""}
                    onChange={getFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3 md:col-span-4">
                  <label
                    htmlFor="registeredAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Registered Address
                  </label>
                  <textarea
                    id="registeredAddress"
                    type="text"
                    name="registeredAddress"
                    rows={3}
                    value={formData.registeredAddress || ""}
                    onChange={getFormData}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={getFormData}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* file upload */}

              <h3 className="font-medium text-gray-700">
                Upload KYC Documents
              </h3>
              <p className="text-red-500">
                {errorOnUpload ? errorOnUpload : ""}
              </p>
              {fileUploadOptions.map((ele) => {
                return (
                  <div key={ele.id} className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3 md:col-span-2">
                      <input
                        name=""
                        id={ele.fileName}
                        onChange={getFileNameAndId}
                        value={ele.displayValue}
                        disabled
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3 md:col-span-2 flex items-center">
                      {kycFilesData.find((file) => file?.fileName === ele.fileName) ?
                        <Link
                          href={`${Base_API_URL}${kycFilesData.find((file) => file?.fileName === ele.fileName)?.media.data?.[0]?.attributes?.url}`} target="_blank"
                          className="mt-1 block rounded-md cursor-pointer  py-1 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                        >
                          <MdRemoveRedEye className="text-2xl font-bold text-gray-600" />

                        </Link>
                        : <input
                          id="gstFile"
                          type="file"
                          accept="image/*, .pdf, .doc, .docx"
                          onChange={(e) =>
                            collectFilesForUpload(ele.id, e.target.files?.[0])
                          }
                          className="mt-1 block w-full rounded-md border cursor-pointer border-gray-300 py-1 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                        />
                      }
                    </div>

                    <div className="col-span-6 sm:col-span-3 md:col-span-2 flex items-center">
                      {selectedFiles[ele.id] && (
                        <button
                          disabled={!selectedFiles[ele.id]}
                          className="disabled:opacity-50 mt-1 ml-1 rounded-md border py-2 px-3 shadow-sm bg-red-500 text-white  sm:text-sm"
                          onClick={(e) =>
                            uploadKycFilesToDB(e, ele.id, ele.fileName)
                          }
                        >
                          Upload
                        </button>
                      )}
                      <p className={`text-sm ${fileUploadStatus?.[ele.id] == "success" ? "text-green-600" : "text-red-500"}`}>
                        {fileUploadStatus?.[ele.id] === "success" ? "File uploaded sucessfully" : fileUploadStatus?.[ele.id]}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* member details */}
              <div className="h-8"></div>
              <h3 className="mt-10 w-fit bg-slate-200 py-1 rounded-md px-1 font-medium leading-6 text-gray-900">
                Update Member/POC details
              </h3>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={userFormData.firstName || ""}
                    onChange={getUserFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={userFormData.lastName || ""}
                    onChange={getUserFormData}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact number
                  </label>
                  <div className="flex items-center">
                    <select
                      className="mt-1 block w-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      value={userCountryCode}
                      onChange={(e) => setUserCountryCode(e.target.value)}
                    >
                      {countryCodes.map((countryCode) => (
                        <option
                          key={countryCode.dialCode}
                          value={countryCode.dialCode}
                        >
                          {`${countryCode.country} (${countryCode.dialCode})`}
                        </option>
                      ))}
                    </select>

                    <input
                      id="contactNumber"
                      type="text"
                      name="contactNumber"
                      value={userFormData.contactNumber || ""}
                      onChange={getUserFormData}
                      className="remove-arrow mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Member email
                  </label>
                  <input
                    id="email"
                    type="text"
                    name="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={userFormData.email}
                    onChange={getUserFormData}
                  />
                  {errors.userEmail && (
                    <div className="text-red-500 text-sm">
                      {errors.userEmail}
                    </div>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password (Optional)
                  </label>
                  <input
                    id="password"
                    type="text"
                    name="password"
                    placeholder=""
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={userFormData.password || ""}
                    onChange={getUserFormData}
                  />
                  {errors.password && (
                    <div className="text-red-500 text-sm">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
              <MoreDetails
              formData={formData}
              setFormData={setFormData}
              getFormData={getFormData} />
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button
                onClick={submitForm}
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


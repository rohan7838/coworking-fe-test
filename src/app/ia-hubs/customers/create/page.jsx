"use client"
import { create, deleteData, getData } from '@/app/api/api';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavigateBackButton from '@/app/components/buttons/NavigateBackButton';
import { countryCodes, domainandsubdomain } from '@/app/common/constants';
import { validateForm } from '@/app/common/formValidations';
import { trimInputValues } from '@/app/common/formValidations';
import { dataWithoutEmptyValues } from '@/app/common/formValidations';


export default function AddCustomer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userSession = useSession();
  const hubId = searchParams.get("hubId")
  const initialFormData = {
    name:"", 
    email:"", 
    contact_number:"", 
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    registeredAddress:"",
    country:"",
    assignedCredits: "",
    balanceCredits:"",
    kycFiles:"",
    active:"",
    hub:Number(hubId),
    selectedSubdomain : "",
    selectedDomain :"",
    website:"",
    aboutservice:"",
  };

  // 'role 3' is assigned to customer-user, which co-relates with customer-user role on backend side, without it no role will be assigned and user
  // will not be able to login to customer side application
  const initialUserData = { firstName:"", lastName:"", username:"", email:"", password:"", contactNumber:"", role:3, ia_hubs:Number(hubId), customer:0};
  const [formData, setFormData] = useState(initialFormData);
  const [userFormData, setUserFormData] = useState(initialUserData);
  const [errors, setErrors] = useState({});
  const [errorOnSubmit, setErrorOnSubmit] = useState("");
  const [selectedCountryCodeForCompany, setSelectedCountryCodeForCompany] = useState(countryCodes[0].dialCode);
  const [selectedCountryCodeForMember, setSelectedCountryCodeForMember] = useState(countryCodes[0].dialCode);
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const FormValidationSchema = {
    name: [{ required: true }],
    email: [{ required: true }, { pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i }],
    contact_number: [{ required: true }, { minLength: 10, maxLength: 10 }],
  };
  const userFormValidationSchema = {
    email: [{ required: true }],
    contactNumber: [{ required: true }, { minLength: 10, maxLength: 10 }],
    username:[{ required: true }, { minLength: 4 }],
    password: [{ required: true }, { minLength: 6 }],
  }

// Get input values from form inputs
  function getFormData(e){
    let {name,value} = e.target;
    setFormData({...formData,[name]:value});
    setErrors({...errors,[name]:""})
  }

  function getUserFormData(e){
    let {name,value} = e.target;
    setUserFormData({...userFormData,[name]:value});
    setErrors({...errors,[name]:""});
  }

  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedSubdomain, setSelectedSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [customSubdomain, setCustomSubdomain] = useState("");

  // Synchronize selectedDomain with formData
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      selectedDomain: selectedDomain === "Others" ? `Others (${customDomain})` : selectedDomain,
      selectedSubdomain: selectedDomain === "Others" ? `Others (${customSubdomain})` : selectedSubdomain
    }));
  }, [selectedDomain, selectedSubdomain, customDomain, customSubdomain]);



  // function validateForm() {
  //   const validationErrors = {};

  //   if (!formData.name) {
  //     validationErrors.name = 'Name is required';
  //   }

  //   if (!formData.email) {
  //     validationErrors.email = 'Email is required';
  //   } 

  //   if (!formData.contact_number) {
  //     validationErrors.contact_number = 'Contact number is required';
  //   } else if (formData.contact_number.length !== 10) {
  //     validationErrors.contact_number = 'Contact number must be 10 digits';
  //   }

  //   if (!userFormData.email) {
  //     validationErrors.userEmail = 'Member email is required';
  //   } else if (userFormData.email.length < 4) {
  //     validationErrors.userEmail = 'Member email must be at least 4 characters';
  //   }

  //   if (!userFormData.password) {
  //     validationErrors.password = 'Password is required';
  //   } else if (userFormData.password.length < 6) {
  //     validationErrors.password = 'Password must be at least 6 characters';
  //   }

  //   return validationErrors;
  // }

  // async function submitForm(e) {
  //   e.preventDefault();
  //   userFormData.username = userFormData?.email;
  //   const newFormData = { ...formData };
  //   newFormData.contact_number = `${selectedCountryCodeForCompany}-${newFormData.contact_number}`;
  //   const validationErrors = validateForm();
    
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }
    
  //   try {
  //     const customerID = await createCustomer(newFormData);
  //     await createUser(userFormData, customerID);
  
  //     router.refresh();
  //     router.back();
  //   } catch (error) {
  //     console.log(error)
  //     setErrorOnSubmit(error.message);
  //   }
  // }
  
  // async function createCustomer(data) {
  //   const response = await create("customers", userSession?.data?.token, { data });
  //   if (response.ok) {
  //     const fetchedCustomerData = await response.json();
  //     return fetchedCustomerData.data.id;
  //   } else {
  //     const error = await response.json();
  //     const errorMessage = `Customer: ${error.message}`
  //     throw new Error(errorMessage);
  //   }
  // }
  
  // async function createUser(userFormData, customerID) {
  //   const responseUser = await create("users", userSession?.data?.token, { ...userFormData, customer: customerID });
  //   if (!responseUser.ok) {
  //     await deleteData("customers",userSession?.data?.token,customerID);
  //     const {error} = await responseUser.json();
  //     const errorMessage = `User: ${error.message}`
  //     throw new Error(errorMessage);
  //   }
  // }
  

  // console.log(errors)

  // second method

  /* Form submit */
  async function submitForm(e){
    e.preventDefault();
    userFormData.username = userFormData?.email;
    
    const companyFormValidationErrors = validateForm(formData, FormValidationSchema); // validate form inputs based on form validation schema
    const userFormValidationErrors = validateForm(userFormData,userFormValidationSchema);
    // console.log(companyFormValidationErrors, userFormValidationErrors)
    // condition will check if validationErrors object is empty or not
    // if empty, it will set error object to display at UI and will return from here
    if (Object.keys(companyFormValidationErrors).length > 0) {
      setErrors(companyFormValidationErrors);
      return;
    }
    if (Object.keys(userFormValidationErrors).length > 0) {
      setErrors(userFormValidationErrors);
      return;
    }
    
    let newFormData = {...formData} // new copy of object to avoid manipulation to original form data
    let newUserFormData = {...userFormData}
    newFormData.contact_number = `${selectedCountryCodeForCompany}-${newFormData.contact_number}` //concat country code with phone number
    newUserFormData.contactNumber = `${selectedCountryCodeForMember}-${newUserFormData.contactNumber}`;
    
    newFormData = dataWithoutEmptyValues(newFormData);
    newUserFormData = dataWithoutEmptyValues(newUserFormData)

    // remove spaces before and after input string
    newFormData = trimInputValues(newFormData);
    newUserFormData = trimInputValues(newUserFormData);
    
    // console.log("company",newFormData)
    // console.log("poc", newUserFormData)
    // return

    // if validation checks are passed, submit button will get disabled
    setDisableSubmitButton(true);

    const response = await create("customers",userSession?.data?.token,{data:{...newFormData}});
    // below response data is converted to JSON to use customer/company id to create a relation b/w customer/company and new  customer-user/member which
    // will be created after this request
    
    if(response?.ok){
      const fetchedCustomerData = await response.json();
      userFormData.customer = fetchedCustomerData?.data?.id;

      // on successful company creation, the following request is made to create a new  customer-user/poc/member, along with login credentials
      // here customer/company id is used to set a relation b/w the  customer-user and the company
      const responseUser = await create("users",userSession?.data?.token,{...newUserFormData, customer:fetchedCustomerData?.data?.id});
       
      // only after successful customer creation the folloiwing condition will get executed
      if(responseUser?.ok){
        router.refresh();
        router.back();
        } else{
            // if user is not created (error response), the customer will be deleted from the database
            // to avoid any duplicity, if admin-user tries makes the request again
            await deleteData("customers",userSession?.data?.token,fetchedCustomerData?.data?.id);
            const {error} = await responseUser.json();
            const errorMessage = `User: ${error.message}`
            // if customer-user creation request returns error response, submit button disable is set to false
            setDisableSubmitButton(false)
            setErrorOnSubmit(errorMessage);
        }
      }else{
        const {error} = await response.json();
        const errorMessage = `Customer: ${error.message}`
        // if customer creation request returns error response, submit button disable is set to false
        setDisableSubmitButton(false);
        setErrorOnSubmit(errorMessage);
      }
  }

  return (
    <div className="py-10 mb-10 m-auto max-w-6xl  w-full md:grid-cols-1 lg:grid lg:grid-cols-2 lg:gap-x-5">
      {/* Navigate back button */}
      <div className='w-full'><NavigateBackButton/></div>
      {/* Form */}
      <div className="m-auto mt-5  w-full space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" id='' method="POST" autoComplete='off'>
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add new company</h3>
              </div>
              {/* error message display on submit */}
              <div className='bg-slate-100 text-center text-red-500 text-sm'>{errorOnSubmit}</div>

              {/* Input fields */}
              {/* 1 */}
              <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id='company_name'
                    name="name"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.name}
                    onChange={getFormData}
                  />
                  {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                </div>
              
              {/* 2 */}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                    Company Contact
                  </label>
                  <div className='flex items-center'>
                    <select
                    className="mt-1 block w-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    value={selectedCountryCodeForCompany}
                    onChange={(e) => setSelectedCountryCodeForCompany(e.target.value)}
                    >
                      {countryCodes.map((countryCode) => (
                        <option key={countryCode.dialCode} value={countryCode.dialCode}>
                          {`${countryCode.country} (${countryCode.dialCode})`}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      id='contact_number'
                      name="contact_number"
                      className="remove-arrow mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                      value={formData.contact_number}
                      onChange={getFormData}
                    />
                  </div>
                  
                  {errors.contact_number && <div className="text-red-500 text-sm">{errors.contact_number}</div>}
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Company Email
                  </label>
                  <input
                    type="text"
                    id='email'
                    name="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.email}
                    onChange={getFormData}
                  />
                  {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="assignedCredits" className="block text-sm font-medium text-gray-700">
                    Assign Credit Points
                  </label>
                  <input
                    id='assignedCredits'
                    type="number"
                    name="assignedCredits"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.assignedCredits}
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
                    id='gstNumber'
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
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
                    id='panNumber'
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
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
                    id='tanNumber'
                    type="text"
                    name="tanNumber"
                    value={formData.tanNumber}
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
                    id='registeredAddress'
                    type="text"
                    name="registeredAddress"
                    rows={3}
                    value={formData.registeredAddress}
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
                    id='country'
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={getFormData}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* POC/Member Detail input fields */}
              <h3>Enter Member/POC details</h3>
              {/* 4 */}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id='firstName'
                    type="text"
                    name="firstName"
                    value={userFormData.firstName}
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
                    id='lastName'
                    type="text"
                    name="lastName"
                    value={userFormData.lastName}
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
                      value={selectedCountryCodeForMember}
                      onChange={(e) =>
                        setSelectedCountryCodeForMember(e.target.value)
                      }
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
                      id='contactNumber'
                      type="text"
                      name="contactNumber"
                      value={userFormData.contactNumber}
                      onChange={getUserFormData}
                      className="remove-arrow mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                  {errors.contactNumber && <div className="text-red-500 text-sm">{errors.contactNumber}</div>}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label  className="block text-sm font-medium text-gray-700">
                   Member Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={userFormData.email}
                    onChange={getUserFormData}
                  />
                  {errors.username && errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id='password'
                    type="text"
                    name="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={userFormData.password}
                    onChange={getUserFormData}
                  />
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                </div>
                {/* <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="text"
                    name="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={userFormData.password}
                    onChange={getUserFormData}
                  />
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                </div> */}
              </div>
              <div className="h-8"></div>
                <h3 className="mt-10 w-fit bg-slate-200 py-1 rounded-md px-1 font-medium leading-6 text-gray-900">
                  More Details 
                </h3>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Website
                  </label>
                  <input
                    id="website"
                    type="text"
                    name="website"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.website}
                    onChange={getFormData}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="aboutservice"
                    className="block text-sm font-medium text-gray-700"
                  >
                    About Services
                  </label>
                  <textarea
                    id="aboutservice"
                    type="text"
                    name="aboutservice"
                    rows={3}
                    className="mt-1 ml-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                    value={formData.aboutservice}
                    onChange={getFormData}
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">    
                  <label
                    htmlFor="selectedDomain"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Domain
                  </label>
                  <select
                    id="selectedDomain"
                    name="selectedDomain"
                    value={selectedDomain}
                    onChange={(e) => {
                      setSelectedDomain(e.target.value);
                      setSelectedSubdomain(''); // Reset subdomain when domain changes
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select Domain</option>
                    {domainandsubdomain.map((domain) => (
                      <option key={domain.domain} value={domain.domain}>
                        {domain.domain}
                      </option>
                    ))}
                    <option value="Others">Others</option>
                  </select>
                </div>

                {selectedDomain === "Others" && (
                  <>
                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                        Custom Domain
                      </label>
                      <input
                        type="text"
                        id="customDomain"
                        name="customDomain"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="Enter custom domain"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="customSubdomain" className="block text-sm font-medium text-gray-700">
                        Custom Subdomain
                      </label>
                      <input
                        type="text"
                        id="customSubdomain"
                        name="customSubdomain"
                        value={customSubdomain}
                        onChange={(e) => setCustomSubdomain(e.target.value)}
                        placeholder="Enter custom subdomain"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}

                {selectedDomain && selectedDomain !== "Others" && (
                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="selectedSubdomain"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subdomain (Select multiple)
                    </label>
                    <div className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm">
                      {domainandsubdomain
                        .find((domain) => domain.domain === selectedDomain)
                        ?.subdomains.map((subdomain) => (
                          <div key={subdomain} className="flex items-center">
                            <input
                              type="checkbox"
                              id={subdomain}
                              name="selectedSubdomain"
                              value={subdomain}
                              checked={selectedSubdomain.split(", ").includes(subdomain)}
                              onChange={(e) => {
                                const currentSelectedSubdomains = selectedSubdomain ? selectedSubdomain.split(", ").filter(Boolean) : [];
                                if (e.target.checked) {
                                  currentSelectedSubdomains.push(e.target.value);
                                } else {
                                  const index = currentSelectedSubdomains.indexOf(e.target.value);
                                  if (index > -1) {
                                    currentSelectedSubdomains.splice(index, 1);
                                  }
                                }
                                setSelectedSubdomain(currentSelectedSubdomains.join(", "));
                              }}
                              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label htmlFor={subdomain} className="ml-2 block text-sm text-gray-700">
                              {subdomain}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            {/* form submit button */}
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button
                onClick={submitForm}
                type="submit"
                disabled = {disableSubmitButton}
                className={` disabled:opacity-50 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
              >
                Save
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

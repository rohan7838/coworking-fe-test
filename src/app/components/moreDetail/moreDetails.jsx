"use client"
import React, { useState, useEffect } from "react";
import { domainandsubdomain } from "@/app/common/constants";

const MoreDetails = ({ formData, setFormData, getFormData }) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedSubdomain, setSelectedSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [customSubdomain, setCustomSubdomain] = useState("");

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      selectedDomain: selectedDomain === "Others" ? `Others (${customDomain})` : selectedDomain,
      selectedSubdomain: selectedDomain === "Others" ? `Others (${customSubdomain})` : selectedSubdomain
    }));
  }, [selectedDomain, selectedSubdomain, customDomain, customSubdomain]);

  return (
    <div>
      <h3 className="mt-10 w-fit bg-slate-200 py-1 rounded-md px-1 font-medium leading-6 text-gray-900">
        More Details
      </h3>
      <br></br>
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
            setSelectedSubdomain(""); // Reset subdomain when domain changes
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
            <label
              htmlFor="customDomain"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="customSubdomain"
              className="block text-sm font-medium text-gray-700"
            >
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
                      const currentSelectedSubdomains = selectedSubdomain
                        ? selectedSubdomain.split(", ").filter(Boolean)
                        : [];
                      if (e.target.checked) {
                        currentSelectedSubdomains.push(e.target.value);
                      } else {
                        const index = currentSelectedSubdomains.indexOf(
                          e.target.value
                        );
                        if (index > -1) {
                          currentSelectedSubdomains.splice(index, 1);
                        }
                      }
                      setSelectedSubdomain(
                        currentSelectedSubdomains.join(", ")
                      );
                    }}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor={subdomain}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {subdomain}
                  </label>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="col-span-6 sm:col-span-2 mt-4">
        <h3 className="text-sm font-medium text-gray-700">Selected Values</h3>
        <p className="mt-1 text-sm text-gray-600">
          Domain: {formData.selectedDomain || "None"} <br />
          Subdomains: {formData.selectedSubdomain}
        </p>
      </div>
    </div>
  );
};

export default MoreDetails;

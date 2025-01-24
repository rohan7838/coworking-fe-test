"use client";
import React from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

const NavigateBackButton = () => {
  const router = useRouter();

  return (
    <>
      <div className="m-auto">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 flex text-sm font-bold items-center justify-around bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          <MdArrowBack />
          &nbsp;Back
        </button>
      </div>
    </>
  );
};

export default NavigateBackButton;

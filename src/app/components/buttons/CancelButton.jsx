"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteData } from "@/app/api/api";

const CancelButton = ({ endPoint,token, id, deleteItemName }) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function deleteProduct() {
    const res = await deleteData(endPoint,token, id);
    if (res?.ok) {
      router.refresh();
    }
    setShowModal(false);
  }

  return (
    <div>
      <button
        className="text-red-600 hover:text-red-900"
        type="button"
        onClick={() => setShowModal(true)}
      >
       Cancel
      </button>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-64 sm:w-96 lg:w-1/3 my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 px-2 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*body*/}
                <div className="relative p-4 flex-auto">
                  <p className="my-0 text-base text-center text-slate-500 leading-relaxed">
                    Are you sure you want to cacel this meeting
                    {/* <span className="text-red-500 break-words font-semibold">{`"${deleteItemName}"`}</span> */}
                    ?
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-around p-4 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="bg-gray-300 text-black rounded background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-red-500 text-white active:bg-emerald-600 uppercase font-bold text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={deleteProduct}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </div>
  );
};

export default CancelButton;

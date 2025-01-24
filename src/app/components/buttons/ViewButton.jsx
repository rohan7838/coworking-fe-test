"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ViewButton = ({ id }) => {
    const pathName = usePathname();
    
  return (
    <>
      <Link
        href={`${pathName}/view/${id}`}
        className="text-red-600 hover:text-red-900">
        View details<span className="sr-only">, {id}</span>
      </Link>
    </>
  );
};

export default ViewButton;

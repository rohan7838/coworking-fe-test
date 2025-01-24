"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const EditButton = ({ id }) => {
    const pathName = usePathname();

  return (
    <>
      <Link
        href={`${pathName}/edit/${id}`}
        className="text-red-600 hover:text-red-900">
        Edit details<span className="sr-only">, {id}</span>
      </Link>
    </>
  );
};

export default EditButton;

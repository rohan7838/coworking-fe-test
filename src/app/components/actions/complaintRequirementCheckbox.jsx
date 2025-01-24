"use client"
import { edit } from "@/app/api/api"
import { useState } from "react"

function ComplaintRequirementCheckbox({ isHandledInitial, id, token, type}) {
    const [isHandled, setIsHandled] = useState(isHandledInitial);

    const handleComplaintCheckedChange = async () => {
        const newData = { isHandled: !isHandled };
        try {
            await edit("complaints", token, id, {data: {...newData}});
            setIsHandled((prev) => !prev);
        } catch (error) {
            console.error("Failed to update complaint:", error);
        }
    };

    const handleRequirementCheckedChange = async () => {
        console.log("requirement checked");
        console.log(isHandled);
        console.log(isHandledInitial);
        const newData = { isHandled: !isHandled };
        try {
            await edit("requirements", token, id, {data: {...newData}});
            setIsHandled((prev) => !prev);
        } catch (error) {
            console.error("Failed to update complaint:", error);
        }
    };

    return (
        <>
            <input
                type="checkbox"
                checked={isHandled}
                onChange={
                    type === "complaint" ? handleComplaintCheckedChange
                                         : handleRequirementCheckedChange
                }
            />
        </>
    )
}

export default ComplaintRequirementCheckbox
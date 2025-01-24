"use client"
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext({});

export const ContextProvider =({children})=>{
    let [token, setToken] = useState(null);

//     function getTokenFromLocalStorage(){
//         if(typeof window!=="undefined"){
//             const tokenValue = localStorage.getItem("userToken") || null;
//             const userToken = tokenValue ? JSON.stringify(tokenValue) : null;
//             setToken(userToken)
//             return true;
//         }
//         return false;
//     }

//     const myPromise = new Promise((resolve, reject)=>{
//           const isTokenAvailable = getTokenFromLocalStorage();
//           if(isTokenAvailable){
//             resolve("ok")
//           }else{
//             reject("error")
//           }
//     })

//  myPromise.then((val)=>{
//         console.log(val)
//     }).catch((err)=>{
//         console.error(err)
//     })

return (<AppContext.Provider value={{token}}>
        {children}
    </AppContext.Provider>)
}

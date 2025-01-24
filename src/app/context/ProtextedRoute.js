"use client"
import React, { useEffect, useState } from 'react';
import { AppContext } from './ContextProvider';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';

const ProtectedRoute = ({children}) => {

function getTokenFromLocalStorage(){
    if(typeof window!=="undefined"){
        const tokenValue = localStorage.getItem("userToken") || null;
        const userToken = tokenValue ? JSON.stringify(tokenValue) : null;
        return {responseStatus:true, token:userToken};
    }
    return {responseStatus:false, token:null};
}

const tokenPromise = new Promise((resolve, reject)=>{
      const {responseStatus, token} = getTokenFromLocalStorage();
      if(responseStatus){
        resolve(token)
      }else{
        reject("No token")
      }
})

const [token, setTOken] = useState();

useEffect(()=>{
    async function data(){
        try{
            const res = await tokenPromise;
            if(res===null){
                return
            }else{
                return "test"
            }
        }catch(err){
            console.error(err, "some error occured")
        }
    }
    data()
},[])

// console.log(token)
return token
}

export default ProtectedRoute
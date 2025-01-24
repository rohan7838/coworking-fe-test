"use client"
import App from "next/app";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

function AppContextProvider({children}){
    const [currentHub, setCurrentHub] = useState({});

    function changeCurrentHub(value){
        setCurrentHub(value);
    }
    
    return <AppContext.Provider value={{currentHub, changeCurrentHub}}>
        {children}
    </AppContext.Provider>
}

export default AppContextProvider
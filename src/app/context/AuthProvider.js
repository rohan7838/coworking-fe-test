// "use client";
// import { useEffect, useState } from "react";
// import { createContext } from "react";


// export const AppContext = createContext();
// let token;
// let name;
// if (typeof window !== "undefined") {
//     token = window.localStorage.getItem("userToken");
//     name = window.localStorage.getItem("userName");
//   }
// function AppContextProvider({ children }) {
//   const [authState, setAuthState] = useState({
//     isAuth: false,
//     token: token || null,
//     name: name || null,
//   });

//   useEffect(()=>{
    
//   },[authState])

//   const loginUser = (token, name) => {
//     token !== undefined &&
//       setAuthState({
//         isAuth: true,
//         token: token,
//         name: name,
//       });
//   };
//   const logoutUser = () => {
//     setAuthState({
//       isAuth: false,
//       token: null,
//     });
//   };
//   return (
//     <AppContext.Provider value={{ authState, loginUser, logoutUser }}>
//       {children}
//     </AppContext.Provider>
//   );
// }

// export default AppContextProvider;

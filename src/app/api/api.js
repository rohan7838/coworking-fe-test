import { NextRequest, NextResponse } from "next/server";
const iaBaseApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

export const userSignIn = async (formData) => {
  try {
    let response = await fetch(`${iaBaseApiUrl}/auth/local`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response?.ok) {
      const errorResponse = await response.json();
      const responseStatus = errorResponse?.error?.message;
      throw new Error(responseStatus);
      // return { responseStatus };
    }

    const responseStatus = response.statusText;
    const fetchedData = await response.json();
    const {
      jwt,
      user: { id, username, email },
    } = fetchedData;
    const userRoleAndHubs = await getUserRoleAndHubs(jwt);

    if (!userRoleAndHubs?.role) {
      throw new Error("User role does not exist!");
    }
    const responseData = {
      jwt: jwt,
      id: id,
      username: username,
      email: email,
      role: userRoleAndHubs?.role,
      hubs: userRoleAndHubs?.hubs,
    };

    return { responseStatus, responseData };
  } catch (error) {
    const errorMessage = error.message;
    // return { error, errorMessage };
    throw new Error(errorMessage);
  }
};

export const setToken = async (token) => {
  const resp = NextResponse.json({
    message: "login successful",
    success: true,
  });
  resp.cookies.set("token", token, { httpOnly: true });
  return resp;
};

export const getUserRoleAndHubs = async (jwtToken) => {
  const userAuthurl = `${iaBaseApiUrl}/users/me?populate=*`;

  try {
    if (!jwtToken) {
      throw new Error("Unauthorized user");
    }

    const response = await fetch(userAuthurl, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (!response?.ok) {
      const errorResponse = await response.json();
      const responseStatus = errorResponse?.error?.message;
      throw new Error(responseStatus);
    }

    const fetchedData = await response.json();

    return { role: fetchedData?.role?.type, hubs: fetchedData?.ia_hubs };
  } catch (error) {
    const errorMessage = error.message;
    return { error, errorMessage };
    // throw new Error(errorMessage)
  }
};

export const getData = async (endPoint, token, hubId, filters="", sort="", pagination="") => {
  try {
    const res = await fetch(iaBaseApiUrl + "/" + endPoint + `?filters[hub][id][$eq]=${hubId}&${filters}&${sort}&${pagination}` + "&populate=*", {headers:{ Authorization: `Bearer ${token}` }} , {
      cache: "no-store",
    });
    if (!res?.ok) {
      const responseStatus = res.statusText;
      return { responseStatus };
    }
    const responseStatus = res.statusText;
    const fetchedData = await res.json();
    const responseData = fetchedData;
    return { responseData, responseStatus };
  } catch (error) {
    const errorMessage = error.message;
    return { error, errorMessage };
  }
};

export const create = async (endPoint,token, newData) => {
  const res = await fetch(iaBaseApiUrl + "/" + endPoint, {
    method: "POST",
    headers: {Authorization:`Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(newData),
  });
  return res;
};

export const getSingleEntityData = async (endPoint, token) => {
  const res = await fetch(
    iaBaseApiUrl + endPoint,
    {headers:{Authorization:`Bearer ${token}`}},
    { cache: "no-store" }
  );
  const data = await res.json();
  return data;
};

export const getOne = async (endPoint, token, id, hubId) => {
  const res = await fetch(
    iaBaseApiUrl + "/" + endPoint + `?filters[hub][id][$contains]=${hubId}&filters[id][$eq]=${id}&populate=*`,
    {headers:{Authorization:`Bearer ${token}`}},
    { cache: "no-store" }
  );
  const data = await res.json();
  return data;
};

export const view = async (endPoint, id) => {
  const res = await fetch(iaBaseApiUrl + "/" + endPoint + "/" + id, {
    cache: "no-store",
  });
  const data = await res.json();
  return data;
};

export const edit = async (endPoint,token, id, updatedData) => {
  const res = await fetch(iaBaseApiUrl + "/" + endPoint + "/" + id, {
    method: "PUT",
    headers: {Authorization:`Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  return res;
};

export const deleteData = async (endPoint,token, id) => {
  const res = await fetch(iaBaseApiUrl + "/" + endPoint + "/" + id, {
    method: "DELETE",
    headers:{Authorization:`Bearer ${token}`}
  });
  return res;
};

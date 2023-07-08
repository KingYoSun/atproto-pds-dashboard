"use client";

import React, { useReducer } from "react";

type AdminAuthProviderProps = { children: React.ReactNode };

type AdminAuth = {
  host: string | undefined;
  username: string | undefined;
  password: string | undefined;
};

type Action = {
  type: "set" | "reset";
  payload: AdminAuth;
};

export const AdminAuthContext = React.createContext(
  {} as {
    data: AdminAuth;
    dispatchData: React.Dispatch<Action>;
  }
);

function reducer(state: AdminAuth, action: Action): AdminAuth {
  switch (action?.type) {
    case "set":
      return action?.payload;
    case "reset":
      return { host: undefined, username: undefined, password: undefined };
    default:
      return state;
  }
}

export default function AdminAuthProvider({
  children,
}: AdminAuthProviderProps) {
  const url = process.env.PDS_HOST;
  const initialState = { host: url, username: undefined, password: undefined };
  const [data, dispatchData] = useReducer(reducer, initialState);

  return (
    <AdminAuthContext.Provider value={{ data, dispatchData }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

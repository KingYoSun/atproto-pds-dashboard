"use client";

import React, { useReducer } from "react";

type AdminAuthProviderProps = { children: React.ReactNode };

type AdminAuth = {
  username: string | null;
  password: string | null;
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
      return { username: null, password: null };
    default:
      return state;
  }
}

export default function AdminAuthProvider({
  children,
}: AdminAuthProviderProps) {
  const initialState = { username: null, password: null };
  const [data, dispatchData] = useReducer(reducer, initialState);

  return (
    <AdminAuthContext.Provider value={{ data, dispatchData }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

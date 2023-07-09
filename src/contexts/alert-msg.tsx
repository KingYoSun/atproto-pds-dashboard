"use client";

import React, { useReducer } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type AlertMsgProviderProps = { children: React.ReactNode };

type AlertProps = React.ComponentProps<typeof Alert>;

type AlertMsg = {
  variant: AlertProps["variant"];
  title: string | undefined | null;
  message: string | undefined | null;
  open: boolean;
};

type Action = {
  type: "set" | "reset" | "open" | "close";
  payload: AlertMsg | undefined;
};

export const AlertMsgContext = React.createContext(
  {} as {
    alert: AlertMsg;
    dispatchAlert: React.Dispatch<Action>;
  }
);

function reducer(state: AlertMsg, action: Action): AlertMsg {
  switch (action?.type) {
    case "set":
      return action?.payload ? action.payload : state;
    case "reset":
      return {
        variant: "default",
        title: undefined,
        message: undefined,
        open: false,
      };
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false };
    default:
      return state;
  }
}

export default function AlertMsgProvider({ children }: AlertMsgProviderProps) {
  const initialState = {
    variant: "default" as AlertProps["variant"],
    title: undefined,
    message: undefined,
    open: false,
  };
  const [alert, dispatchAlert] = useReducer(reducer, initialState);

  return (
    <AlertMsgContext.Provider value={{ alert, dispatchAlert }}>
      {!!alert.open && (
        <Alert variant={alert.variant}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      {children}
    </AlertMsgContext.Provider>
  );
}

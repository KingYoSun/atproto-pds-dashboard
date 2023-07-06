"use client";

import { BskyAgent, AtpSessionEvent, AtpSessionData } from "@atproto/api";
import React, { useReducer } from "react";

type BskyAgentProviderProps = { children: React.ReactNode };

function setBskyAgent(url: string | undefined): BskyAgent {
  const agent: BskyAgent = new BskyAgent({
    service: url ? url : "http://localhost:2583",
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      // store the session-data for reuse
    },
  });
  return agent;
}

export const BskyAgentContext = React.createContext(
  {} as {
    agent: BskyAgent;
    dispatchAgent: React.Dispatch<Action>;
  }
);

type Action = {
  type: "set";
  payload: string;
};

function reducer(state: BskyAgent, action: Action): BskyAgent {
  switch (action?.type) {
    case "set":
      return setBskyAgent(action?.payload);
    default:
      throw state;
  }
}

export default function BskyAgentContextProvider({
  children,
}: BskyAgentProviderProps) {
  const url = process.env.PDS_HOST;
  const initialState = setBskyAgent(url);
  const [agent, dispatchAgent] = useReducer(reducer, initialState);

  return (
    <BskyAgentContext.Provider value={{ agent, dispatchAgent }}>
      {children}
    </BskyAgentContext.Provider>
  );
}

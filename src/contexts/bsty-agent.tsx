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
    agent: AgentWithHost;
    dispatchAgent: React.Dispatch<Action>;
  }
);

type AgentWithHost = {
  host: string | undefined;
  agent: BskyAgent;
};

type Action = {
  type: "set";
  payload: string;
};

function reducer(state: AgentWithHost, action: Action): AgentWithHost {
  switch (action?.type) {
    case "set":
      return {
        host: action?.payload,
        agent: setBskyAgent(action?.payload),
      };
    default:
      throw state;
  }
}

export default function BskyAgentContextProvider({
  children,
}: BskyAgentProviderProps) {
  const url = process.env.PDS_HOST;
  const initialState = {
    host: url,
    agent: setBskyAgent(url),
  };
  const [agent, dispatchAgent] = useReducer(reducer, initialState);

  return (
    <BskyAgentContext.Provider value={{ agent, dispatchAgent }}>
      {children}
    </BskyAgentContext.Provider>
  );
}

"use client";

import { BskyAgent, AtpSessionEvent, AtpSessionData } from "@atproto/api";
import React, { useReducer } from "react";

type AdminBskyAgentProviderProps = { children: React.ReactNode };

function setBskyAgent(url: string | undefined): BskyAgent {
  const agent: BskyAgent = new BskyAgent({
    service: url ? url : "http://localhost:2583",
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      // store the session-data for reuse
    },
  });
  return agent;
}

export const AdminBskyAgentContext = React.createContext(
  {} as {
    adminAgent: AgentWithHost;
    dispatchAdminAgent: React.Dispatch<Action>;
  }
);

type AgentWithHost = {
  host: string | undefined;
  agent: BskyAgent;
};

type Payload = {
  host?: string;
};

type Action = {
  type: "set";
  payload: Payload;
};

function reducer(state: AgentWithHost, action: Action): AgentWithHost {
  switch (action?.type) {
    case "set":
      return {
        host: action?.payload.host,
        agent: setBskyAgent(action?.payload.host),
      };
    default:
      throw state;
  }
}

export default function AdminBskyAgentContextProvider({
  children,
}: AdminBskyAgentProviderProps) {
  const url = process.env.PDS_HOST;
  const initialState = {
    host: url,
    agent: setBskyAgent(url),
  };
  const [adminAgent, dispatchAdminAgent] = useReducer(reducer, initialState);

  return (
    <AdminBskyAgentContext.Provider value={{ adminAgent, dispatchAdminAgent }}>
      {children}
    </AdminBskyAgentContext.Provider>
  );
}

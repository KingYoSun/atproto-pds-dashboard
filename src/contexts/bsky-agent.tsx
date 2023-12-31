"use client";

import { BskyAgent, AtpSessionEvent, AtpSessionData } from "@atproto/api";
import React, { useReducer } from "react";
import { OutputSchema } from "@atproto/api/dist/client/types/com/atproto/server/createSession";

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
  isLogin: boolean;
  session: OutputSchema | AtpSessionData | undefined;
  open: boolean;
};

type Payload = {
  host?: string;
  session?: OutputSchema | AtpSessionData | undefined;
};

type Action = {
  type: "set" | "session" | "open" | "close";
  payload: Payload;
};

function reducer(state: AgentWithHost, action: Action): AgentWithHost {
  switch (action?.type) {
    case "set":
      return {
        host: action?.payload.host,
        agent: setBskyAgent(action?.payload.host),
        isLogin: false,
        session: state.session,
        open: state.open,
      };
    case "session":
      return {
        host: state.host,
        agent: state.agent,
        isLogin: !!action?.payload.session,
        session: action?.payload.session,
        open: !!!action?.payload.session,
      };
    case "open":
      return {
        host: state.host,
        agent: state.agent,
        isLogin: state.isLogin,
        session: action?.payload.session,
        open: true,
      };
    case "close":
      return {
        host: state.host,
        agent: state.agent,
        isLogin: state.isLogin,
        session: action?.payload.session,
        open: false,
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
    isLogin: false,
    session: undefined,
    open: false,
  };
  const [agent, dispatchAgent] = useReducer(reducer, initialState);

  return (
    <BskyAgentContext.Provider value={{ agent, dispatchAgent }}>
      {children}
    </BskyAgentContext.Provider>
  );
}

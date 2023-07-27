import { AtpSessionData } from "@atproto/api";
import Cookies from "js-cookie";

interface adminAuthProps {
  host: string;
  username: string;
  password: string;
}

export function setAdminAuth({ host, username, password }: adminAuthProps) {
  const values = {
    host,
    username,
    password,
  };
  Cookies.set("authParams", JSON.stringify(values), { expires: 7 });
}

export function getAdminAuth(): adminAuthProps {
  const valuesJSON = Cookies.get("authParams");
  return typeof valuesJSON == "string" ? JSON.parse(valuesJSON) : undefined;
}

export function revokeAdminAuth() {
  Cookies.remove("authParams");
}

interface plcAuthProps {
  host: string;
  sessionData: AtpSessionData;
}

export function setPlcAuth({ host, sessionData }: plcAuthProps) {
  Cookies.set(`auth:${host}`, JSON.stringify(sessionData), { expires: 7 });
}

export function getPlcAuth(host: string): AtpSessionData {
  const valuesJSON = Cookies.get(`auth:${host}`);
  return typeof valuesJSON == "string" ? JSON.parse(valuesJSON) : undefined;
}

export function revokePlcAuth(host: string) {
  Cookies.remove(`auth:${host}`);
}

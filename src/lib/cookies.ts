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

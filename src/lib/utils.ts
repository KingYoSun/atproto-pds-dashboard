import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReportView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function hasProp<K extends PropertyKey>(
  data: object,
  prop: K
): data is Record<K, unknown> {
  return prop in data;
}
export function isReportView(v: unknown): v is ReportView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "com.atproto.admin.defs#reportView"
  );
}

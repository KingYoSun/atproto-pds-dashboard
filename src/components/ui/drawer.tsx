"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { Button } from "./button";
import { revokeAdminAuth } from "@/lib/cookies";
import { BskyAgentContext } from "@/contexts/bsky-agent";

export type DrawerItem = {
  icon: JSX.Element;
  text: string;
  path: string;
};

export interface DrawerPorps extends React.HTMLAttributes<HTMLDivElement> {
  items: Array<DrawerItem>;
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerPorps>(
  ({ className, items, tabIndex, ...props }, ref) => {
    const { data, dispatchData } = React.useContext(AdminAuthContext);
    const { agent, dispatchAgent } = React.useContext(BskyAgentContext);

    function resetAdminAuth() {
      dispatchData({
        type: "reset",
        payload: { host: undefined, username: undefined, password: undefined },
      });
      revokeAdminAuth();
    }

    function resetPlcAuth() {
      dispatchAgent({
        type: "session",
        payload: { session: undefined },
      });
    }

    return (
      <div
        id="drawer-navigation"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto bg-white w-64 dark:bg-gray-800 drop-shadow-lg",
          className
        )}
        ref={ref}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
        {...props}
      >
        <div className="flex flex-row flex-nowrap items-center justify-between">
          <Button
            variant="outline"
            size="default"
            onClick={resetPlcAuth}
            className="text-xs"
          >
            PLC {agent.isLogin ? "Logout" : "Login"}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={resetAdminAuth}
            className="text-xs"
          >
            Admin Logout
          </Button>
        </div>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  {item.icon}
                  <span className="ml-3">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);
Drawer.displayName = "Drawer";

export { Drawer };

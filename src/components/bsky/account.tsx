"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { RepoViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { useContext, useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "../ui/button";
import dayjs from "dayjs";
import { Separator } from "../ui/separator";
import Labels from "@/components/bsky/labels";

interface Props {
  did: string;
}

export default function Account({ did }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [account, setAccount] = useState<RepoViewDetail | undefined>(undefined);

  useEffect(() => {
    getRepoAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getRepoAdmin() {
    const encoded = btoa(`${data.username}:${data.password}`);
    adminAgent.agent.api.com.atproto.admin
      .getRepo(
        {
          did: did,
        },
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        console.log(res);
        dispatchAlert({
          type: "close",
          payload: undefined,
        });
        setAccount(res.data);
      })
      .catch((res) => {
        dispatchAlert({
          type: "set",
          payload: {
            variant: "destructive",
            title: "getRepo Failed!",
            message: JSON.stringify(res),
            open: true,
          },
        });
      });
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" size="sm">
          @{account?.handle}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 bg-white">
        <div>
          <p className="text-sm font-semibold">{account?.handle}</p>
          <p className="text-sm">{account?.did}</p>
          <p className="text-sm">{account?.email}</p>
          <p className="text-sm">labels:</p>
          {!!account?.labels && account.labels.length > 0 && (
            <Labels labels={account.labels} />
          )}
          <p className="text-sm">invitedBy: {account?.invitedBy?.forAccount}</p>
          <p className="text-sm">
            invites:{" "}
            {account?.invites?.map((item) => item.forAccount).join("\n")}
          </p>
          <p className="text-sm">
            inviteDisabled?: {String(account?.invitesDisabled)}
          </p>
          <Separator className="my-1" />
          <p className="text-sm">
            indextedAt:{" "}
            {dayjs(account?.indexedAt).format("YYYY-MM-DD HH:mm:ss Z")}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

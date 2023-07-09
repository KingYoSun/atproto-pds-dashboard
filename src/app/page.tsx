"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsty-agent";
import { ReportView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { useCallback, useContext, useEffect, useState } from "react";

const PAGINATION_COUNT = 2;

export default function Home() {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [reports, setReports] = useState<ReportView[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const encoded = btoa(`${data.username}:${data.password}`);
    getReports(encoded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.username, data.password]);

  function getReports(encoded: string) {
    agent.agent.api.com.atproto.admin
      .getModerationReports(
        {
          limit: PAGINATION_COUNT,
          cursor: cursor,
        },
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        console.log(res);
        dispatchAlert({
          type: "close",
          payload: undefined,
        });
        setReports(res.data.reports);
        setCursor(res.data.cursor);
      })
      .catch((res) => {
        dispatchAlert({
          type: "set",
          payload: {
            variant: "destructive",
            title: "getModerationReports Failed!",
            message: JSON.stringify(res),
            open: true,
          },
        });
      });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-24 py-12">
      test
    </div>
  );
}

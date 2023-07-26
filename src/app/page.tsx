"use client";

import ModerationReport from "@/components/moderation/report";
import { Button } from "@/components/ui/button";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { isReportView } from "@/lib/utils";
import {
  ActionView,
  ReportView,
} from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

const PAGINATION_COUNT = 5;

type PageDirection = "next" | "prev";

type Action = {
  type: "push" | "reset";
  payload: string;
};

function cursorReducer(
  state: Array<string | undefined>,
  action: Action
): Array<string | undefined> {
  switch (action?.type) {
    case "push":
      return [...state, action?.payload];
    case "reset":
      return [undefined];
    default:
      return state;
  }
}

export default function Home() {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [reports, setReports] = useState<ReportView[]>([]);
  const [cursorArr, dispatchCursorArr] = useReducer(cursorReducer, [undefined]);
  const [cursorArrIndex, setCursorArrIndex] = useState<number>(0);

  const getReports = useCallback(
    (encoded: string, direction: PageDirection) => {
      const index = direction == "prev" ? cursorArrIndex - 2 : cursorArrIndex;
      adminAgent.agent.api.com.atproto.admin
        .getModerationReports(
          {
            limit: PAGINATION_COUNT,
            cursor: cursorArr[index],
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
          if (
            direction != "prev" &&
            !!res.data.cursor &&
            index >= cursorArr.length - 1
          ) {
            dispatchCursorArr({
              type: "push",
              payload: res.data.cursor,
            });
          }
          setCursorArrIndex(index + 1);
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
    },
    [
      adminAgent.agent.api.com.atproto.admin,
      cursorArr,
      cursorArrIndex,
      dispatchAlert,
    ]
  );

  useEffect(() => {
    dispatchCursorArr({
      type: "reset",
      payload: "",
    });
    setCursorArrIndex(0);
    const encoded = btoa(`${data.username}:${data.password}`);
    getReports(encoded, "next");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function updateReport(report: ActionView) {
    const updateReports = reports.map((item) => {
      if (item.id == report.id) {
        const asserted = Object.keys(item).map((key) => report[key]);
        if (isReportView(asserted)) return asserted;
      }
      return item;
    });
    setReports(updateReports);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-start">
        {reports.map((report) => (
          <div key={report.id} className="my-2 w-full">
            <ModerationReport report={report} updateReport={updateReport} />
          </div>
        ))}
      </div>
      <div className="flex flex-row flex-nowrap items-center justify-center mt-5">
        {!!cursorArr[cursorArrIndex - 1] && (
          <Button
            className="mx-2"
            variant="outline"
            onClick={() =>
              getReports(btoa(`${data.username}:${data.password}`), "prev")
            }
          >
            Prev
          </Button>
        )}
        {!!cursorArr[cursorArrIndex] && (
          <Button
            className="mx-2"
            variant="outline"
            onClick={() =>
              getReports(btoa(`${data.username}:${data.password}`), "next")
            }
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

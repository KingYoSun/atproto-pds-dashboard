"use client";

import { Button } from "@/components/ui/button";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { ComAtprotoServerResetPassword } from "@atproto/api";
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
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  //const [reports, setReports] = useState<ReportView[]>([]);
  const [cursorArr, dispatchCursorArr] = useReducer(cursorReducer, [undefined]);
  const [cursorArrIndex, setCursorArrIndex] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const getActions = useCallback(
    (encoded: string, direction: PageDirection) => {
      const index = direction == "prev" ? cursorArrIndex - 2 : cursorArrIndex;
      console.log("index", index);
      agent.agent.api.com.atproto.admin
        .getModerationActions(
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
          console.log(res);
          // setReports(res.data.reports);
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
      agent.agent.api.com.atproto.admin,
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
    getActions(encoded, "next");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-start">
        {[].map((report, index) => (
          <div key={index} className="my-2 w-full"></div>
        ))}
      </div>
      <div className="flex flex-row flex-nowrap items-center justify-center mt-5">
        {!!cursorArr[cursorArrIndex - 1] && (
          <Button
            className="mx-2"
            variant="outline"
            onClick={() =>
              getActions(btoa(`${data.username}:${data.password}`), "prev")
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
              getActions(btoa(`${data.username}:${data.password}`), "next")
            }
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

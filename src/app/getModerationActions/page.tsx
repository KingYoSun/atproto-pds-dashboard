"use client";

import { Button } from "@/components/ui/button";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { ActionView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { ModerationAction } from "@/components/moderation/action";

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
  const [actions, setActions] = useState<ActionView[]>([]);
  const [cursorArr, dispatchCursorArr] = useReducer(cursorReducer, [undefined]);
  const [cursorArrIndex, setCursorArrIndex] = useState<number>(0);

  const getActions = useCallback(
    (encoded: string, direction: PageDirection) => {
      const index = direction == "prev" ? cursorArrIndex - 2 : cursorArrIndex;
      adminAgent.agent.api.com.atproto.admin
        .getModerationActions(
          {
            limit: PAGINATION_COUNT,
            cursor: cursorArr[index],
          },
          { headers: { Authorization: `Basic ${encoded}` } }
        )
        .then((res) => {
          dispatchAlert({
            type: "close",
            payload: undefined,
          });
          setActions(res.data.actions);
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
    if (!data.username || !data.password) return;
    dispatchCursorArr({
      type: "reset",
      payload: "",
    });
    setCursorArrIndex(0);
    const encoded = btoa(`${data.username}:${data.password}`);
    getActions(encoded, "next");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function updateAction(action: ActionView) {
    const updateActions = actions.map((item) => {
      if (item.id == action.id) {
        return action;
      }
      return item;
    });
    setActions(updateActions);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-start">
        {actions.map((action) => (
          <div key={action.id} className="my-2 w-full">
            <ModerationAction action={action} updateAction={updateAction} />
          </div>
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

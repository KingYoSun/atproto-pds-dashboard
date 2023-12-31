"use client";

import dayjs from "dayjs";
import { ActionView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import {
  Card,
  CardContent,
  CardDescription,
  CardDescriptionDiv,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Account from "@/components/bsky/account";
import Post, { PostHandles } from "@/components/bsky/post";
import { Button } from "@/components/ui/button";
import Labels from "@/components/bsky/labels";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { OutputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/getRecord";
import ResolveModerationReports from "@/components/functional/resolveModerationReports";
import { InputSchema as InputSchemaResolveModerationReports } from "@atproto/api/dist/client/types/com/atproto/admin/resolveModerationReports";
import ReverseModerationAction from "@/components/functional/reverseModerationAction";
import { InputSchema as InputSchemaReverseModerationAction } from "@atproto/api/dist/client/types/com/atproto/admin/reverseModerationAction";
import { Badge } from "@/components/ui/badge";

interface Props {
  action: ActionView;
  updateAction: (action: ActionView) => void;
}

export function ModerationAction({ action, updateAction }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const [postDetail, setPostDetail] = useState<OutputSchema | undefined>(
    undefined
  );
  const PostRef = useRef<PostHandles>(null);
  const [openResolve, setOpenResolve] = useState(false);
  const [openReverse, setOpenReverse] = useState(false);

  const getRecordByAdmin = useCallback(
    (action: ActionView) => {
      if (
        !action.subject.uri ||
        !action.subject.cid ||
        !data.username ||
        !data.password
      )
        return;
      const encoded = btoa(`${data.username}:${data.password}`);
      adminAgent.agent.api.com.atproto.admin
        .getRecord(
          {
            uri: action.subject.uri as string,
            cid: action.subject.cid as string,
          },
          { headers: { Authorization: `Basic ${encoded}` } }
        )
        .then((res) => {
          setPostDetail(res.data);
        })
        .catch((err) => {
          alert(err);
        });
    },
    [adminAgent.agent.api.com.atproto.admin, data.password, data.username]
  );

  function resolveModerationReports(
    input: InputSchemaResolveModerationReports
  ) {
    if (!data.password || !data.username) {
      alert("Admin Auth Required!");
      return;
    }
    const encoded = btoa(`${data.username}:${data.password}`);
    adminAgent.agent.api.com.atproto.admin
      .resolveModerationReports(input, {
        headers: { Authorization: `Basic ${encoded}` },
        encoding: "application/json",
      })
      .then((res) => {
        if (!res.success) alert("resolveModerationReports failed!");
        alert("Done!");
        setOpenResolve(false);
        updateAction(res.data);
      })
      .catch((err) => {
        alert(err);
      });
  }

  function reverseModerationAction(input: InputSchemaReverseModerationAction) {
    if (!data.password || !data.username) {
      alert("Admin Auth Required!");
      return;
    }
    const encoded = btoa(`${data.username}:${data.password}`);
    adminAgent.agent.api.com.atproto.admin
      .reverseModerationAction(input, {
        headers: { Authorization: `Basic ${encoded}` },
        encoding: "application/json",
      })
      .then((res) => {
        if (!res.success) alert("resolveModerationReports failed!");
        alert("Done!");
        setOpenReverse(false);
        updateAction(res.data);
      })
      .catch((err) => {
        alert(err);
      });
  }

  useEffect(() => {
    getRecordByAdmin(action);
  }, [action, getRecordByAdmin]);

  return (
    !!action && (
      <>
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-row items-center">
              <CardTitle>{action.action}</CardTitle>
              {!!action.reversal && (
                <Badge variant="destructive" className="mx-1">
                  Reversed
                </Badge>
              )}
            </div>
            <CardDescription>id: {action.id}</CardDescription>
            <CardDescriptionDiv className="flex flex-row items-center">
              Created by:
              <div className="mx-1" />
              <Account did={action.createdBy} />
            </CardDescriptionDiv>
            <CardDescription>Reason: {action.reason}</CardDescription>
            <CardDescription>
              created_at:{" "}
              {dayjs(action.createdAt).format("YYYY-MM-DD HH:mm:ss Z")}
            </CardDescription>
            <CardDescriptionDiv>
              createLabelVals:{" "}
              {!!action.createLabelVals ? (
                <Labels labels={action.createLabelVals} />
              ) : (
                ""
              )}
            </CardDescriptionDiv>
            <CardDescriptionDiv>
              negateLabelVals:{" "}
              {!!action.negateLabelVals ? (
                <Labels labels={action.negateLabelVals} />
              ) : (
                ""
              )}
            </CardDescriptionDiv>
            <CardDescription>
              relatedReports: {postDetail?.moderation.reports.length}
            </CardDescription>
            <CardDescriptionDiv>
              resolvedReportIds: {action.resolvedReportIds.join(", ")}
            </CardDescriptionDiv>
          </CardHeader>
          <CardContent>
            {action.subject.$type == "com.atproto.admin.defs#repoRef" && (
              <Account did={action.subject.did as string} />
            )}
            {action.subject.$type == "com.atproto.repo.strongRef" && (
              <Post
                ref={PostRef}
                cid={action.subject.cid as string}
                uri={action.subject.uri as string}
              />
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-row">
              <Button
                variant="secondary"
                onClick={() => setOpenResolve(true)}
                className="mx-1"
              >
                resolveModerationReports
              </Button>
              <Button
                variant="secondary"
                onClick={() => setOpenReverse(true)}
                className="mx-1"
              >
                reverseModerationAction
              </Button>
            </div>
          </CardFooter>
        </Card>
        {!!action && !!postDetail && (
          <ResolveModerationReports
            action={action}
            postDetail={postDetail}
            resolveModerationReportsFunc={resolveModerationReports}
            closeModalFunc={() => setOpenResolve(false)}
            open={openResolve}
          />
        )}
        {!!action && (
          <ReverseModerationAction
            action={action}
            reverseModerationActionFunc={reverseModerationAction}
            closeModalFunc={() => setOpenReverse(false)}
            open={openReverse}
          />
        )}
      </>
    )
  );
}

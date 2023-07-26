"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { RecordViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { useCallback, useContext, useEffect, useState } from "react";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescriptionDiv,
  CardHeader,
} from "@/components/ui/card";
import Account from "./account";
import Labels from "@/components/bsky/labels";

interface Props {
  cid: string;
  uri: string;
  subjectRepoHandle?: string;
}

export default function Post({ cid, uri, subjectRepoHandle }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [post, setPost] = useState<RecordViewDetail | undefined>(undefined);

  function getPostByAdmin() {
    const encoded = btoa(`${data.username}:${data.password}`);
    adminAgent.agent.api.com.atproto.admin
      .getRecord(
        {
          uri: uri,
          cid: cid,
        },
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        dispatchAlert({
          type: "close",
          payload: undefined,
        });
        setPost(res.data);
      })
      .catch((res) => {
        dispatchAlert({
          type: "set",
          payload: {
            variant: "destructive",
            title: "getPosts Failed!",
            message: JSON.stringify(res),
            open: true,
          },
        });
      });
  }

  useEffect(() => {
    getPostByAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseValue(value: {} | undefined) {
    if (!value) return undefined;
    const asserted = value as Record;
    return asserted;
  }

  return (
    post && (
      <Card>
        <CardHeader>
          <CardDescriptionDiv>
            Posted by: <Account did={post.repo.did} />, at:{" "}
            {dayjs(parseValue(post.value)?.createdAt).format(
              "YYYY-MM-DD HH:mm:ss Z"
            )}
          </CardDescriptionDiv>
          <CardDescriptionDiv>
            Labels: {!!post.labels && <Labels labels={post.labels} />}
          </CardDescriptionDiv>
        </CardHeader>
        <CardContent>{parseValue(post.value)?.text}</CardContent>
      </Card>
    )
  );
}

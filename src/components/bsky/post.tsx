"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsty-agent";
import { RecordViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { useContext, useEffect, useState } from "react";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Account from "./account";

interface Props {
  cid: string;
  uri: string;
  subjectRepoHandle?: string;
}

export default function Post({ cid, uri, subjectRepoHandle }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [post, setPost] = useState<RecordViewDetail | undefined>(undefined);

  useEffect(() => {
    const encoded = btoa(`${data.username}:${data.password}`);
    getPosts(encoded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function getPosts(encoded: string) {
    agent.agent.api.com.atproto.admin
      .getRecord(
        {
          uri: uri,
          cid: cid,
        },
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        console.log(res);
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

  function parseValue(value: {} | undefined) {
    if (!value) return undefined;
    const asserted = value as Record;
    return asserted;
  }

  return (
    post && (
      <Card>
        <CardHeader>
          <CardDescription>
            Posted by: <Account did={post.repo.did} />, at:{" "}
            {dayjs(parseValue(post.value)?.createdAt).format(
              "YYYY-MM-DD HH:mm:ss Z"
            )}
          </CardDescription>
          <CardDescription>Labels: {post.labels?.join(", ")}</CardDescription>
        </CardHeader>
        <CardContent>{parseValue(post.value)?.text}</CardContent>
        <CardFooter>TODO: actions</CardFooter>
      </Card>
    )
  );
}

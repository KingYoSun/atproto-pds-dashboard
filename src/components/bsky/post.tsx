"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { RecordViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { useContext, useEffect, useState } from "react";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescriptionDiv,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Account from "./account";
import Labels from "@/components/bsky/labels";
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Separator } from "@/components/ui/separator";
import { View } from "@atproto/api/dist/client/types/app/bsky/embed/images";
import { DialogImage } from "@/components/functional/dialog-image";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  cid?: string;
  uri?: string;
  subjectRepoHandle?: string;
}

export default function Post({ cid, uri, subjectRepoHandle }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const { alert, dispatchAlert } = useContext(AlertMsgContext);
  const [post, setPost] = useState<RecordViewDetail | undefined>(undefined);
  const [postThread, setPostThread] = useState<ThreadViewPost | undefined>(
    undefined
  );

  function getRecordByAdmin() {
    if (!uri || !cid) return;
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
            title: "getRecord by Admin Failed!",
            message: JSON.stringify(res),
            open: true,
          },
        });
      });
  }

  function getPost() {
    if (!uri) return;
    agent.agent
      .getPostThread({
        uri,
      })
      .then((res) => {
        dispatchAlert({
          type: "close",
          payload: undefined,
        });
        setPostThread(res.data.thread as ThreadViewPost);
      })
      .catch((err) => {
        dispatchAlert({
          type: "set",
          payload: {
            variant: "destructive",
            title: "getPostThread Failed!",
            message: JSON.stringify(err),
            open: true,
          },
        });
      });
  }

  useEffect(() => {
    if (agent.agent.hasSession) {
      getPost();
    } else if (!!uri && !!cid) {
      getRecordByAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.agent.hasSession]);

  function parseRecord(record: {} | undefined) {
    if (!record) return undefined;
    const asserted = record as Record;
    return asserted;
  }

  function parseEmbedImage(embed: {} | undefined) {
    if (!embed) return undefined;
    const asserted = embed as View;
    return asserted;
  }

  return (
    <Card>
      {!!post && !postThread && (
        <div>
          <CardHeader>
            <CardDescriptionDiv className="flex flex-row items-start">
              <Account did={post.repo.did} />
              {dayjs(parseRecord(post.value)?.createdAt).format(
                "YYYY-MM-DD HH:mm:ss Z"
              )}
            </CardDescriptionDiv>
            <CardDescriptionDiv>
              Labels: {!!post.labels && <Labels labels={post.labels} />}
            </CardDescriptionDiv>
          </CardHeader>
          <CardContent>{parseRecord(post.value)?.text}</CardContent>
        </div>
      )}
      {!!postThread && (
        <div>
          <CardHeader>
            <CardDescriptionDiv className="flex flex-row items-start">
              <Account
                did={postThread.post.author.did}
                author={postThread.post.author}
              />
              {dayjs(postThread.post.indexedAt).format("YYYY-MM-DD HH:mm:ss Z")}
              <Button
                variant="outline"
                size="icon"
                onClick={getPost}
                className="mx-2"
              >
                <RefreshCw />
              </Button>
            </CardDescriptionDiv>
            <CardDescriptionDiv>
              Labels:{" "}
              {!!postThread.post.labels && (
                <Labels labels={postThread.post.labels} />
              )}
            </CardDescriptionDiv>
          </CardHeader>
          <Separator className="mb-3" />
          <CardContent className="flex flex-col">
            <p>{parseRecord(postThread.post.record)?.text}</p>
            {!!postThread.post.embed &&
              postThread.post.embed.$type == "app.bsky.embed.images#view" && (
                <div
                  className={
                    parseEmbedImage(postThread.post.embed)?.images?.length ??
                    0 > 1
                      ? "grid-cols-2"
                      : ""
                  }
                >
                  {parseEmbedImage(postThread.post.embed)?.images.map(
                    (image, i) => (
                      <DialogImage image={image} key={i} />
                    )
                  )}
                </div>
              )}
          </CardContent>
          <Separator className="mb-2" />
          <CardFooter>
            {postThread.post.replyCount ?? 0} replies{" "}
            {postThread.post.repostCount ?? 0} repost{" "}
            {postThread.post.likeCount ?? 0} likes
          </CardFooter>
        </div>
      )}
    </Card>
  );
}

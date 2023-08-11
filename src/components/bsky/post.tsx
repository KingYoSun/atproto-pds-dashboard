"use client";

import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { RecordViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
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

export interface PostHandles {
  reloadPost(): void;
}

const Post = forwardRef<PostHandles, Props>(
  ({ cid, uri, subjectRepoHandle }, ref) => {
    const { data, dispatchData } = useContext(AdminAuthContext);
    const { agent, dispatchAgent } = useContext(BskyAgentContext);
    const { adminAgent, dispatchAdminAgent } = useContext(
      AdminBskyAgentContext
    );
    const { alert, dispatchAlert } = useContext(AlertMsgContext);
    const [postDetail, setPostDetail] = useState<RecordViewDetail | undefined>(
      undefined
    );
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
          setPostDetail(res.data);
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

    useImperativeHandle(ref, () => ({
      reloadPost: () => {
        if (agent.agent.hasSession) {
          getPost();
        }
        getRecordByAdmin();
      },
    }));

    useEffect(() => {
      if (agent.agent.hasSession) {
        getPost();
      }
      getRecordByAdmin();
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
        <div>
          <CardHeader>
            <CardDescriptionDiv className="flex flex-row items-start">
              {postDetail && (
                <Account
                  did={postThread?.post.author.did ?? postDetail?.repo.did}
                  author={postThread?.post.author}
                />
              )}
              {!!postThread
                ? dayjs(postThread?.post.indexedAt).format(
                    "YYYY-MM-DD HH:mm:ss Z"
                  )
                : dayjs(parseRecord(postDetail?.value)?.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss Z"
                  )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  getPost();
                  getRecordByAdmin();
                }}
                className="mx-2"
              >
                <RefreshCw />
              </Button>
            </CardDescriptionDiv>
            <CardDescriptionDiv>
              Labels:{" "}
              {!!postDetail?.labels && <Labels labels={postDetail.labels} />}
            </CardDescriptionDiv>
          </CardHeader>
          <Separator className="mb-3" />
          <CardContent className="flex flex-col">
            <p>
              {!!postThread
                ? parseRecord(postThread.post.record)?.text
                : parseRecord(postDetail?.value)?.text}
            </p>
            {!!postThread?.post.embed &&
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
            {postThread?.post.replyCount ?? 0} replies{", "}
            {postThread?.post.repostCount ?? 0} repost{", "}
            {postThread?.post.likeCount ?? 0} likes{", "}
            {postDetail?.moderation.reports.length ?? 0} reports{", "}
            {postDetail?.moderation.actions.length ?? 0} actions{", "}
            currentActionId: {postDetail?.moderation.currentAction?.id}
            {", "}
            currentAction: {postDetail?.moderation.currentAction?.action}
          </CardFooter>
        </div>
      </Card>
    );
  }
);

Post.displayName == "Post";

export default Post;

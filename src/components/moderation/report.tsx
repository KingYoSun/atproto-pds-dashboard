"use client";

import {
  ActionView,
  ReportView,
} from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import dayjs from "dayjs";
import { InputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/takeModerationAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardDescriptionDiv,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Post from "../bsky/post";
import Account from "../bsky/account";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import TakeModerationAction from "@/components/functional/takeModerationAction";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AlertMsgContext } from "@/contexts/alert-msg";
import { BskyAgentContext } from "@/contexts/bsty-agent";

interface Props {
  report: ReportView;
  updateReport: (report: ActionView) => void;
}

export default function ModerationReport({ report, updateReport }: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [modReport, setModReport] = useState<ReportView | undefined>(undefined);
  const [openActionModal, setOpenActionModal] = useState<boolean>(false);

  function takeModerationAction(props: InputSchema) {
    const encoded = btoa(`${data.username}:${data.password}`);
    console.log(props);
    agent.agent.api.com.atproto.admin
      .takeModerationAction(props, {
        headers: { Authorization: `Basic ${encoded}` },
        encoding: "application/json",
      })
      .then((res) => {
        updateReport(res.data);
        setOpenActionModal(false);
      })
      .catch((res) => {
        alert(JSON.stringify(res));
      });
  }

  function openModerationActionModal(report: ReportView) {
    setModReport(report);
    setOpenActionModal(true);
  }

  function closeModerationActionModal() {
    console.log("close!");
    setOpenActionModal(false);
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{report.reasonType}</CardTitle>
          <CardDescription>id: {report.id}</CardDescription>
          <CardDescriptionDiv>
            Reported by: <Account did={report.reportedBy} />
          </CardDescriptionDiv>
          <CardDescription>Resson: {report.reason}</CardDescription>
          <CardDescription>
            created_at:{" "}
            {dayjs(report.createdAt).format("YYYY-MM-DD HH:mm:ss Z")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Post
            cid={report.subject.cid as string}
            uri={report.subject.uri as string}
            subjectRepoHandle={report.subjectRepoHandle}
          />
        </CardContent>
        <CardFooter>
          <div className="flex flex-row">
            <Button
              variant="secondary"
              onClick={() => openModerationActionModal(report)}
            >
              takeModerationAction
            </Button>
          </div>
        </CardFooter>
      </Card>
      {!!modReport && (
        <TakeModerationAction
          report={modReport}
          open={openActionModal}
          takeModerationActionFunc={takeModerationAction}
          closeModalFunc={() => closeModerationActionModal()}
        />
      )}
    </>
  );
}

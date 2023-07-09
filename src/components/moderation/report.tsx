"use client";

import { ReportView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import dayjs from "dayjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Post from "../bsky/post";
import Account from "../bsky/account";

interface Props {
  report: ReportView;
}

export default function ModerationReport({ report }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{report.reasonType}</CardTitle>
        <CardDescription>id: {report.id}</CardDescription>
        <CardDescription>
          Reported by: <Account did={report.reportedBy} />
        </CardDescription>
        <CardDescription>Resson: {report.reason}</CardDescription>
        <CardDescription>
          created_at: {dayjs(report.createdAt).format("YYYY-MM-DD HH:mm:ss Z")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Post
          cid={report.subject.cid as string}
          uri={report.subject.uri as string}
          subjectRepoHandle={report.subjectRepoHandle}
        />
      </CardContent>
    </Card>
  );
}

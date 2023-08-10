"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { AdminBskyAgentContext } from "@/contexts/admin-bsky-agent";
import { useCallback, useContext, useEffect, useState } from "react";
import { InputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/takeModerationAction";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { RecordViewDetail } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { Badge } from "@/components/ui/badge";
import AddLabelBtn from "./add-label-btn";
import Labels from "@/components/bsky/labels";
import { BskyAgentContext } from "@/contexts/bsky-agent";

const formSchema = z.object({
  action: z.string(),
  subjectType: z.string(),
  createLabelVals: z.string().array(),
  negateLabelVals: z.string().array(),
  reason: z.string(),
  createdBy: z.string(),
});

interface Props {
  report: ReportView;
  takeModerationActionFunc: (input: InputSchema) => void;
  closeModalFunc: () => void;
  open: boolean;
}

export default function TakeModerationAction({
  report,
  takeModerationActionFunc,
  closeModalFunc,
  open,
}: Props) {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { adminAgent, dispatchAdminAgent } = useContext(AdminBskyAgentContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [post, setPost] = useState<RecordViewDetail | undefined>(undefined);
  const [isFlag, setIsFlag] = useState<boolean>(false);
  const [errTxt, setErrTxt] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: "",
      subjectType: "",
      createLabelVals: [],
      negateLabelVals: [],
      reason: "",
      createdBy: !!agent.agent.hasSession
        ? agent.agent.session?.did
        : "did:example:moderator",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const encoded = btoa(`${data.username}:${data.password}`);
    let subject;
    switch (values.subjectType) {
      case "com.atproto.admin.defs#repoRef":
        subject = {
          $type: values.subjectType,
          did: report.subject.did,
        };
        break;
      case "com.atproto.repo.strongRef":
        subject = {
          $type: values.subjectType,
          uri: report.subject.uri,
          cid: report.subject.cid,
        };
        break;
      default:
        setErrTxt("subjectType is wrong!");
        break;
    }
    if (!!subject) {
      takeModerationActionFunc({
        action: values.action,
        subject: subject,
        reason: values.reason,
        createLabelVals: values.createLabelVals,
        negateLabelVals: values.negateLabelVals,
        createdBy: values.createdBy,
        subjectBlobCids: [],
      });
    }
  }

  const getPost = useCallback(() => {
    const encoded = btoa(`${data.username}:${data.password}`);

    adminAgent.agent.api.com.atproto.admin
      .getRecord(
        {
          uri: String(report.subject.uri),
          cid: String(report.subject.cid),
        },
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        setErrTxt("");
        setPost(res.data);
      })
      .catch((res) => {
        setErrTxt(JSON.stringify(res));
      });
  }, [
    adminAgent.agent.api.com.atproto.admin,
    data.password,
    data.username,
    report.subject.cid,
    report.subject.uri,
  ]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name == "action" && value.action == "com.atproto.admin.defs#flag") {
        getPost();
        setIsFlag(true);
      } else if (
        name == "action" &&
        value.action != "com.atproto.admin.defs#flag"
      ) {
        setIsFlag(false);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  return (
    <Dialog
      open={open}
      onOpenChange={(flg) => {
        !flg && closeModalFunc();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>TakeModerationAction</DialogTitle>
        </DialogHeader>
        <div className="max-w-none grid gap-4 py-4">
          {errTxt.length > 0 && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-2 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Authorization Failed!</strong>
              <span className="block sm:inline">{errTxt}</span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select moderation action type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="com.atproto.admin.defs#takedown">
                          takedown
                        </SelectItem>
                        <SelectItem value="com.atproto.admin.defs#flag">
                          flag
                        </SelectItem>
                        <SelectItem value="com.atproto.admin.defs#acknowledge">
                          acknowledge
                        </SelectItem>
                        <SelectItem value="'com.atproto.admin.defs#escalate'">
                          escalate
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SubjectType</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="com.atproto.admin.defs#repoRef">
                          repoRef
                        </SelectItem>
                        <SelectItem value="com.atproto.repo.strongRef">
                          storongRef
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isFlag && (
                <div className="mt-4">
                  <p className="text-base font-medium">currentLabels</p>
                  <div className="my-1 flex flex-row">
                    {!!post?.labels && post?.labels.length > 0 && (
                      <Labels
                        labels={post.labels}
                        onClickLabel={(label) => {
                          form.setValue("negateLabelVals", [
                            ...form.getValues("negateLabelVals"),
                            label.val,
                          ]);
                        }}
                      />
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="createLabelVals"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <div className="flex flex-row items-center">
                          <FormLabel className="text-base mr-2">
                            createLabelVals
                          </FormLabel>
                          <AddLabelBtn
                            onClickItem={(val) => {
                              form.setValue("createLabelVals", [
                                ...field.value,
                                val,
                              ]);
                            }}
                          />
                        </div>
                        {field.value.map((val, i) => (
                          <Badge
                            key={i}
                            className="mx-1"
                            onClick={() => {
                              const removed = field.value.filter(
                                (item) => item !== val
                              );
                              form.setValue("createLabelVals", removed);
                            }}
                          >
                            {val}
                          </Badge>
                        ))}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="negateLabelVals"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row items-center">
                          <FormLabel className="text-base mr-2">
                            negateLabelVals
                          </FormLabel>
                        </div>
                        {field.value.map((val, i) => (
                          <Badge
                            key={i}
                            className="mx-1"
                            onClick={() => {
                              const removed = field.value.filter(
                                (item) => item !== val
                              );
                              form.setValue("negateLabelVals", removed);
                            }}
                          >
                            {val}
                          </Badge>
                        ))}
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <Button type="submit" className="my-4">
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

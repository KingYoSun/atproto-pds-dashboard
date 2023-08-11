"use client";

import { ActionView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import { OutputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/getRecord";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/resolveModerationReports";
import { useContext, useState } from "react";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  action: ActionView;
  postDetail: OutputSchema;
  resolveModerationReportsFunc: (input: InputSchema) => void;
  closeModalFunc: () => void;
  open: boolean;
}

const formSchema = z.object({
  reportIds: z.number().array(),
});

export default function ResolveModerationReports({
  action,
  postDetail,
  resolveModerationReportsFunc,
  closeModalFunc,
  open,
}: Props) {
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [errTxt, setErrTxt] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.reportIds.length == 0) {
      setErrTxt("reportIds is Empty!");
      return;
    }
    resolveModerationReportsFunc({
      actionId: action.id,
      reportIds: values.reportIds,
      createdBy: agent.agent.session?.did ?? "did:example:admin",
    });
  }

  return (
    <Dialog open={open} onOpenChange={(flg) => !flg && closeModalFunc}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ResolveModerationReports</DialogTitle>
        </DialogHeader>
        <div className="max-w-none grid gap-4 py-4">
          {errTxt.length > 0 && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-2 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Failed!</strong>
              <span className="block sm:inline">{errTxt}</span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="reportIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Select reports you want to resolve
                      </FormLabel>
                    </div>
                    {postDetail.moderation.reports.map((report) => (
                      <FormField
                        key={report.id}
                        control={form.control}
                        name="reportIds"
                        render={({ field }) => (
                          <FormItem
                            key={report.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(report.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        report.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (val) => val !== report.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {report.id}: {report.reasonType}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
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

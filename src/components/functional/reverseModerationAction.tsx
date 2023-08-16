"use client";

import { ActionView } from "@atproto/api/dist/client/types/com/atproto/admin/defs";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputSchema } from "@atproto/api/dist/client/types/com/atproto/admin/reverseModerationAction";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  action: ActionView;
  reverseModerationActionFunc: (input: InputSchema) => void;
  closeModalFunc: () => void;
  open: boolean;
}

const formSchema = z.object({
  reason: z.string(),
});

export default function ReverseModerationAction({
  action,
  reverseModerationActionFunc,
  closeModalFunc,
  open,
}: Props) {
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [errTxt, setErrTxt] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.reason.length == 0) {
      setErrTxt("reason is Empty!");
      return;
    }
    reverseModerationActionFunc({
      id: action.id,
      reason: values.reason,
      createdBy: agent.agent.session?.did ?? "did:example:admin",
    });
  }

  return (
    <Dialog open={open} onOpenChange={(flg) => !flg && closeModalFunc()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ReverseModerationAction</DialogTitle>
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Reason</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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

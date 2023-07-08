"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AdminAuthContext } from "@/contexts/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BskyAgentContext } from "@/contexts/bsty-agent";

const formSchema = z.object({
  host: z.string().url(),
  username: z.string(),
  password: z.string(),
});

export default function AdminAuthModal() {
  const { data, dispatchData } = useContext(AdminAuthContext);
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errTxt, setErrTxt] = useState("");

  useEffect(() => {
    if (!data.password || !data.username) {
      setDialogOpen(true);
      return;
    }

    const encoded = btoa(`${data.username}:${data.password}`);
    agent.agent.api.com.atproto.admin
      .getModerationReports(
        {},
        { headers: { Authorization: `Basic ${encoded}` } }
      )
      .then((res) => {
        console.log(res);
        setErrTxt("");
        setDialogOpen(!res.success);
      })
      .catch((res) => {
        setErrTxt(JSON.stringify(res));
      });
  }, [agent.agent.api.com.atproto.admin, data.password, data.username]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: data.host,
      username: "admin",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.host !== agent.host) {
      dispatchAgent({
        type: "set",
        payload: values.host,
      });
    }
    dispatchData({
      type: "set",
      payload: {
        host: values.host,
        username: values.username,
        password: values.password,
      },
    });
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate as administrator</DialogTitle>
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
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDS Host</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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

"use client";

import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BskyAgentContext } from "@/contexts/bsky-agent";
import { data } from "autoprefixer";
import { getPlcAuth, setPlcAuth } from "@/lib/cookies";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function PlcAuthModal() {
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errTxt, setErrTxt] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    agent.agent
      .login({
        identifier: form.getValues("username"),
        password: form.getValues("password"),
      })
      .then((res) => {
        setErrTxt("");
        setDialogOpen(!res.success);
        setPlcAuth({
          host: agent.host ?? "",
          sessionData: res.data,
        });
        dispatchAgent({
          type: "session",
          payload: { session: res.data },
        });
      })
      .catch((res) => {
        setErrTxt(JSON.stringify(res));
      });
  }

  useEffect(() => {
    if (!agent.isLogin && !!agent.host) {
      console.log("session?");
      const sessionExist = getPlcAuth(agent.host);
      if (sessionExist) {
        agent.agent
          .resumeSession(sessionExist)
          .then((res) => {
            dispatchAgent({
              type: "session",
              payload: { session: sessionExist },
            });
          })
          .catch((err) => {
            dispatchAgent({
              type: "session",
              payload: { session: undefined },
            });
          });
      }
    }
    if (agent.isLogin) {
      if (agent.agent.hasSession) {
        agent.agent.api.com.atproto.server
          .deleteSession()
          .then((res) => {
            if (!res.success) setErrTxt("Reset session failed!");
          })
          .catch((err) => {
            setErrTxt(err);
          });
      }
      setDialogOpen(true);
    }
  }, [
    agent.agent,
    agent.agent.api.com.atproto.server,
    agent.agent.hasSession,
    agent.host,
    agent.isLogin,
    dispatchAgent,
  ]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(flg) => {
        setDialogOpen(flg);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate as user on PLC Server</DialogTitle>
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
          <p className="text-base">PDS HOST: {agent.host}</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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

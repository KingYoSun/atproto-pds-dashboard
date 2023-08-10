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
import { getPlcAuth, revokePlcAuth, setPlcAuth } from "@/lib/cookies";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function PlcAuthModal() {
  const { agent, dispatchAgent } = useContext(BskyAgentContext);
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
      const sessionExist = getPlcAuth(agent.host);
      if (sessionExist && !agent.open) {
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
            revokePlcAuth(agent.host as string);
          });
      }
    }
    if (agent.open) {
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
      revokePlcAuth(agent.host as string);
      dispatchAgent({
        type: "open",
        payload: {},
      });
    }
  }, [
    agent.agent,
    agent.agent.api.com.atproto.server,
    agent.open,
    agent.host,
    agent.isLogin,
    dispatchAgent,
  ]);

  return (
    <Dialog
      open={agent?.open}
      onOpenChange={(flg) => {
        dispatchAgent({
          type: flg ? "open" : "close",
          payload: {},
        });
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

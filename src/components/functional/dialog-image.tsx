"use client";

import { ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  image: ViewImage;
}

export function DialogImage({ image }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={(flg) => setOpen(flg)}>
      <DialogTrigger asChild>
        <Image
          className="cursor-pointer"
          src={image.thumb}
          alt={image.alt}
          width={200}
          height={200}
        />
      </DialogTrigger>
      <DialogContent className="h-5/6 w-auto">
        <Image src={image.fullsize} alt={image.alt} fill objectFit="contain" />
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

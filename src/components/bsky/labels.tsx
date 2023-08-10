"use client";

import { Label } from "@atproto/api/dist/client/types/com/atproto/label/defs";
import { Badge } from "@/components/ui/badge";

interface Props {
  labels: Array<Label> | Array<string>;
  onClickLabel?: (label: Label) => void;
}

export default function Labels({ labels, onClickLabel }: Props) {
  return (
    <div className="flex flex-row">
      {labels.map((label, i) => (
        <Badge
          key={i}
          className="mx-1"
          onClick={() =>
            !!onClickLabel && typeof label == "object" && onClickLabel(label)
          }
        >
          {typeof label == "object" ? label.val : label}
        </Badge>
      ))}
    </div>
  );
}

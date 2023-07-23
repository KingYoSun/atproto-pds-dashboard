"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ALWAYS_FILTER_LABEL_GROUP,
  ALWAYS_WARN_LABEL_GROUP,
  CONFIGURABLE_LABEL_GROUPS,
  ILLEGAL_LABEL_GROUP,
  UNKNOWN_LABEL_GROUP,
} from "@/lib/label-groups";

const labelGroups = [
  ILLEGAL_LABEL_GROUP,
  ALWAYS_FILTER_LABEL_GROUP,
  ALWAYS_WARN_LABEL_GROUP,
  UNKNOWN_LABEL_GROUP,
  ...Object.values(CONFIGURABLE_LABEL_GROUPS),
];

interface Props {
  onClickItem: (val: string) => void;
}

export default function AddLabelBtn({ onClickItem }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {labelGroups.map((item) => (
            <DropdownMenuSub key={item.id}>
              <DropdownMenuSubTrigger>
                <span>{item.id}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {item.values.map((val, i) => (
                    <DropdownMenuItem
                      key={`${val}-${i}`}
                      onClick={() => onClickItem(val)}
                    >
                      <span>{val}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

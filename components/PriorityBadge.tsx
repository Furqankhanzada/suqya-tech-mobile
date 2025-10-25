// components/PriorityBadge.tsx
import React from "react";
import { Badge, BadgeText } from "@/components/ui/badge";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import type { Priority } from "@/api/types";

interface PriorityBadgeProps {
  priority?: Priority;
}

const badgeVariants = tva({
  base: "px-2 py-1 rounded-lg",
  variants: {
    priority: {
      URGENT: "bg-priority-urgent text-priority-urgent-foreground",
      HIGH: "bg-priority-high text-priority-high-foreground",
      MEDIUM: "bg-priority-medium text-priority-medium-foreground",
      LOW: "bg-priority-low text-priority-low-foreground",
    },
  },
  defaultVariants: {
    priority: "LOW",
  },
});

const textVariants = tva({
  base: "text-xs font-bold",
  variants: {
    priority: {
      URGENT: "text-priority-urgent-foreground",
      HIGH: "text-priority-high-foreground",
      MEDIUM: "text-priority-medium-foreground",
      LOW: "text-priority-low-foreground",
    },
  },
  defaultVariants: {
    priority: "LOW",
  },
});

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <Badge className={badgeVariants({ priority })}>
      <BadgeText className={textVariants({ priority })}>{priority}</BadgeText>
    </Badge>
  );
};

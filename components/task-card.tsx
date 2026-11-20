"use client";

import { MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/types";

interface Props {
  task: Task;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onDelete }: Props) {
  return (
    <Card className="relative flex flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute right-2 top-2 rounded-md p-1 hover:bg-muted">
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => {}}>Update</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onDelete(task.id)}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader>
        <CardTitle className="pr-6 text-base">{task.title}</CardTitle>
        <Badge variant={task.status === "COMPLETED" ? "default" : "secondary"}>
          {task.status.replace("_", " ").toLowerCase()}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-3">{task.description ?? "No description"}</p>
        <p className="mt-2 text-xs">ID: {task.id}</p>
        <p className="text-xs">
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </p>
        <p className="text-xs">
          Updated: {new Date(task.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  return (
    <div className="relative mx-auto mt-6 w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by title or id..."
        className="pl-9"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

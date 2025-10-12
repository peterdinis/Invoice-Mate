"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface FolderInput {
  name: string;
  description?: string;
}

export interface Folder {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

async function createFolder(data: FolderInput): Promise<Folder> {
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create folder");
  }

  return res.json();
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
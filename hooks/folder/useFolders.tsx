"use client";

import { useQuery } from "@tanstack/react-query";
import { Folder } from "./useCreateFolder";

async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch("/api/folders", { cache: "no-store" });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Nepodarilo sa načítať priečinky");
  }

  return res.json();
}

/**
 * Hook pre načítanie všetkých priečinkov
 */
export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: fetchFolders,
    staleTime: 1000 * 60 * 2, // 2 minúty - optimalizácia
  });
}

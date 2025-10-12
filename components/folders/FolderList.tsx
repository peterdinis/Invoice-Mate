"use client";

import { useMemo } from "react";
import { Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFolders } from "@/hooks/folder/useFolders";

interface FolderListProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export const FolderList = ({
  selectedFolder,
  onFolderSelect,
}: FolderListProps) => {
  const { data: folders, isLoading, isError } = useFolders();

  const allFolders = useMemo(() => {
    if (!folders) return [{ _id: null, name: "Všetky faktúry", count: 0 }];
    return [
      { _id: null, name: "Všetky faktúry", count: folders.length },
      ...folders,
    ];
  }, [folders]);

  const renderFolderButton = (folder: (typeof allFolders)[0]) => {
    const isSelected = selectedFolder === folder._id;
    const Icon = isSelected ? FolderOpen : Folder;

    return (
      <Button
        key={folder._id ?? "all"}
        variant={isSelected ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/20",
        )}
        onClick={() => onFolderSelect(folder._id)}
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-left">{folder.name}</span>
      </Button>
    );
  };

  if (isLoading)
    return <p className="text-center py-4">Načítavam priečinky...</p>;
  if (isError)
    return (
      <p className="text-center py-4 text-red-500">
        Chyba pri načítaní priečinkov
      </p>
    );

  return <div className="space-y-1">{allFolders.map(renderFolderButton)}</div>;
};

"use client";

import { useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFolders } from "@/hooks/folder/useFolders";
import { Spinner } from "../ui/spinner";
import type { Folder as FolderType } from "@/hooks/folder/useCreateFolder";
import { Folder as FolderIcon, FolderOpen, List } from "lucide-react";

interface FolderListProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

const FolderButton = memo(
  ({
    folder,
    isSelected,
    onSelect,
  }: {
    folder: FolderType;
    isSelected: boolean;
    onSelect: (folderId: string) => void;
  }) => {
    const Icon = isSelected ? FolderOpen : FolderIcon;

    const handleClick = useCallback(() => {
      onSelect(folder._id);
    }, [folder._id, onSelect]);

    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 transition-all duration-200 group",
          isSelected
            ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            : "hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={handleClick}
      >
        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
        <span className="flex-1 text-left truncate" title={folder.name}>
          {folder.name}
        </span>
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
        )}
      </Button>
    );
  },
);

FolderButton.displayName = "FolderButton";

const AllFoldersButton = memo(
  ({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) => (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 mb-2 transition-all duration-200 font-medium",
        isSelected
          ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
      onClick={onSelect}
    >
      <List className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">Všetky priečinky</span>
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </Button>
  ),
);

AllFoldersButton.displayName = "AllFoldersButton";

const FolderListLoading = memo(() => (
  <div className="flex flex-col items-center justify-center py-8 space-y-3">
    <Spinner className="w-6 h-6 text-primary" />
    <p className="text-sm text-muted-foreground">Načítavam priečinky...</p>
  </div>
));

FolderListLoading.displayName = "FolderListLoading";

const FolderListError = memo(() => (
  <div className="text-center py-4">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
      <p className="text-destructive text-sm font-medium">
        Nepodarilo sa načítať priečinky
      </p>
    </div>
  </div>
));

FolderListError.displayName = "FolderListError";

const FolderListEmpty = memo(() => (
  <div className="text-center py-8">
    <FolderIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
    <p className="text-muted-foreground text-sm mb-1">Žiadne priečinky</p>
    <p className="text-muted-foreground/60 text-xs">
      Vytvorte svoj prvý priečinok
    </p>
  </div>
));

FolderListEmpty.displayName = "FolderListEmpty";

export const FolderList = memo(
  ({ selectedFolder, onFolderSelect }: FolderListProps) => {
    const { data: folders, isLoading, isError } = useFolders();

    const allFolders = useMemo(() => folders || [], [folders]);

    const handleAllFoldersSelect = useCallback(() => {
      onFolderSelect(null);
    }, [onFolderSelect]);

    const handleFolderSelect = useCallback(
      (folderId: string) => {
        const newSelection = selectedFolder === folderId ? null : folderId;
        onFolderSelect(newSelection);
      },
      [selectedFolder, onFolderSelect],
    );

    const folderButtons = useMemo(
      () =>
        allFolders.map((folder) => (
          <FolderButton
            key={folder._id}
            folder={folder}
            isSelected={selectedFolder === folder._id}
            onSelect={handleFolderSelect}
          />
        )),
      [allFolders, selectedFolder, handleFolderSelect],
    );

    if (isLoading) {
      return <FolderListLoading />;
    }

    if (isError) {
      return <FolderListError />;
    }

    return (
      <div className="space-y-1 max-h-96 overflow-y-auto">
        <AllFoldersButton
          isSelected={selectedFolder === null}
          onSelect={handleAllFoldersSelect}
        />

        {allFolders.length === 0 ? <FolderListEmpty /> : folderButtons}
      </div>
    );
  },
);

FolderList.displayName = "FolderList";

export default FolderList;

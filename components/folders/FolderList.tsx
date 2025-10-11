import { Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FolderListProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

const mockFolders = [
  { id: null, name: "Všetky faktúry", count: 156 },
  { id: "1", name: "Projekt 2025", count: 45 },
  { id: "2", name: "Pravidelní klienti", count: 67 },
  { id: "3", name: "Jednorázové projekty", count: 32 },
  { id: "4", name: "Archív 2024", count: 12 },
];

export const FolderList = ({ selectedFolder, onFolderSelect }: FolderListProps) => {
  return (
    <div className="space-y-1">
      {mockFolders.map((folder) => {
        const isSelected = selectedFolder === folder.id;
        const Icon = isSelected ? FolderOpen : Folder;
        
        return (
          <Button
            key={folder.id || "all"}
            variant={isSelected ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isSelected && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => onFolderSelect(folder.id)}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1 text-left">{folder.name}</span>
            <span className="text-xs text-muted-foreground">{folder.count}</span>
          </Button>
        );
      })}
    </div>
  );
};

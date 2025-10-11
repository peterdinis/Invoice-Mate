import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface FolderDialogProps {
  onFolderCreated?: (name: string) => void;
}

export const FolderDialog = ({ onFolderCreated }: FolderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (!folderName.trim()) {
      toast.error("Zadajte názov priečinka");
      return;
    }

    onFolderCreated?.(folderName);
    toast.success("Priečinok bol vytvorený");
    setFolderName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nový priečinok
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vytvoriť nový priečinok</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Názov priečinka</Label>
            <Input
              id="folderName"
              placeholder="napr. Projekt 2025"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zrušiť
            </Button>
            <Button onClick={handleCreate}>
              Vytvoriť
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
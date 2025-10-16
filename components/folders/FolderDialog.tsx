"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateFolder } from "@/hooks/folder/useCreateFolder";

const folderSchema = z.object({
  name: z
    .string()
    .min(1, "Zadajte názov priečinka")
    .max(100, "Názov je príliš dlhý"),
  description: z.string().optional(),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface FolderDialogProps {
  onFolderCreated?: (name: string) => void;
}

export const FolderDialog = ({ onFolderCreated }: FolderDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: createFolder, isPending } = useCreateFolder();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: FolderFormValues) => {
    createFolder(data, {
      onSuccess: (newFolder) => {
        toast.success("Priečinok bol vytvorený");
        onFolderCreated?.(newFolder.name);
        reset();
        setOpen(false);
      },
      onError: (error: unknown) => {
        let message = "Nepodarilo sa vytvoriť priečinok";

        if (error instanceof Error) {
          message = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error
        ) {
          message = (error as { message: string }).message;
        }

        toast.error(message);
      },
    });
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Názov priečinka</Label>
            <Input
              id="name"
              placeholder="napr. Projekt 2025"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (voliteľný)</Label>
            <Input
              id="description"
              placeholder="napr. materiály k projektu"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Zrušiť
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Vytváranie..." : "Vytvoriť"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

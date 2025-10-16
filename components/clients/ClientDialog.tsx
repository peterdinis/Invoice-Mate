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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateClient } from "@/hooks/clients/useCreateClient";

const clientSchema = z.object({
  name: z.string().min(1, "Meno je povinné"),
  email: z.string().email("Zadajte platný email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  mode?: "create" | "edit";
  client?: Partial<ClientFormValues>;
  trigger?: React.ReactNode;
}

export const ClientDialog = ({
  mode = "create",
  client,
  trigger,
}: ClientDialogProps) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync: createClient, isPending } = useCreateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ?? {
      name: "",
      email: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    try {
      await createClient({
        name: data.name,
        email: data.email,
        address: data.address,
      });

      toast.success("Klient bol úspešne vytvorený 🎉");
      setOpen(false);
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Nepodarilo sa vytvoriť klienta");
      }
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset(client);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            {mode === "create" ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
            {mode === "create" ? "Nový klient" : "Upraviť"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Vytvoriť nového klienta" : "Upraviť klienta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meno / Firma *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Zadajte meno alebo názov firmy"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@priklad.sk"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefón</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+421 XXX XXX XXX"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Ulica, PSČ Mesto"
              rows={3}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Poznámky</Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder="Doplňujúce informácie o klientovi..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Zrušiť
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending
                ? "Ukladám..."
                : mode === "create"
                  ? "Vytvoriť"
                  : "Uložiť zmeny"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

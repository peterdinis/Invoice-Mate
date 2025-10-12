import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";

interface ClientDialogProps {
  mode?: "create" | "edit";
  client?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    note?: string;
  };
  onSave?: (client: any) => void;
  trigger?: React.ReactNode;
}

export const ClientDialog = ({ mode = "create", client, onSave, trigger }: ClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    note: client?.note || "",
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Vyplňte meno a email klienta");
      return;
    }

    onSave?.(formData);
    toast.success(mode === "create" ? "Klient bol vytvorený" : "Klient bol upravený");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            {mode === "create" ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meno / Firma *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Zadajte meno alebo názov firmy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@priklad.sk"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefón</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+421 XXX XXX XXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ulica, PSČ Mesto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Poznámky</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Doplňujúce informácie o klientovi..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zrušiť
            </Button>
            <Button onClick={handleSave}>
              {mode === "create" ? "Vytvoriť" : "Uložiť zmeny"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

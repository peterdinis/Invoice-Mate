"use client"

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const NewInvoice = () => {
  const navigate = useRouter()
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const handleSave = () => {
    toast.success("Invoice created successfully!");
    navigate.push("/invoices");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/invoices">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
        </Link>

        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Create New Invoice
        </h1>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" placeholder="Enter client name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input id="clientEmail" type="email" placeholder="client@example.com" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Textarea id="clientAddress" placeholder="Enter client address" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" placeholder="INV-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Line Items</h2>
            <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-5 space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-6 md:col-span-3 space-y-2">
                  <Label>Rate ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-10 md:col-span-1 flex items-center justify-center">
                  <p className="font-semibold text-foreground">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold text-foreground">Total</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Additional Notes</h2>
          <Textarea placeholder="Add any additional notes or terms..." rows={4} />
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave} size="lg">
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
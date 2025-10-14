"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomLink from "../shared/CustomLink";
import { useFolders } from "@/hooks/folder/useFolders";
import { Spinner } from "@/components/ui/spinner";
import { useAllClients } from "@/hooks/clients/useAllClients";
import {
  CreateInvoiceData,
  useCreateInvoice,
} from "@/hooks/invoices/useCreateNewInvoice";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const NewInvoice = () => {
  const navigate = useRouter();
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clientDetails, setClientDetails] = useState({
    name: "",
    email: "",
    address: "",
  });

  const {
    data: folders,
    isLoading: foldersLoading,
    error: foldersError,
  } = useFolders();
  const {
    data: clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useAllClients();
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();

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

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients?.find((c) => c._id === clientId);
    if (client) {
      setClientDetails({
        name: client.name,
        email: client.email,
        address: client.address || "",
      });
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const handleSave = () => {
    // Validácia
    if (!selectedFolder) {
      toast.error("Please select a folder");
      return;
    }

    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (!clientDetails.name || !clientDetails.email) {
      toast.error("Please fill in client details");
      return;
    }

    const invoiceNumber = (
      document.getElementById("invoiceNumber") as HTMLInputElement
    )?.value;
    const invoiceDate = (
      document.getElementById("invoiceDate") as HTMLInputElement
    )?.value;
    const dueDate = (document.getElementById("dueDate") as HTMLInputElement)
      ?.value;
    const notes = (document.getElementById("notes") as HTMLTextAreaElement)
      ?.value;

    if (!invoiceNumber || !invoiceDate || !dueDate) {
      toast.error("Please fill in all required invoice details");
      return;
    }

    const invoiceData: CreateInvoiceData = {
      client: selectedClient,
      clientName: clientDetails.name,
      clientEmail: clientDetails.email,
      clientAddress: clientDetails.address,
      invoiceNumber,
      invoiceDate,
      dueDate,
      lineItems: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })),
      notes: notes || "",
      total: calculateTotal(),
      folder: selectedFolder,
      status: "draft",
      paidAmount: 0,
    };

    createInvoice(invoiceData, {
      onSuccess: () => {
        navigate.push("/invoices");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CustomLink href="/invoices">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
        </CustomLink>

        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Create New Invoice
        </h1>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Folder Selection
          </h2>
          <div className="space-y-2">
            <Label htmlFor="folder">Select Folder *</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a folder" />
              </SelectTrigger>
              <SelectContent>
                {foldersLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Spinner />
                  </div>
                ) : foldersError ? (
                  <div className="text-red-500 p-2 text-sm">
                    Error loading folders
                  </div>
                ) : (
                  folders?.map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      {folder.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!selectedFolder && (
              <p className="text-sm text-red-500">Please select a folder</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Client Selection
          </h2>
          <div className="space-y-2 mb-4">
            <Label htmlFor="client">Select Client *</Label>
            <Select value={selectedClient} onValueChange={handleClientChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Spinner />
                  </div>
                ) : clientsError ? (
                  <div className="text-red-500 p-2 text-sm">
                    Error loading clients
                  </div>
                ) : (
                  clients?.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!selectedClient && (
              <p className="text-sm text-red-500">Please select a client</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientDetails.name}
                onChange={(e) =>
                  setClientDetails((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email *</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                value={clientDetails.email}
                onChange={(e) =>
                  setClientDetails((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Textarea
              id="clientAddress"
              placeholder="Enter client address"
              value={clientDetails.address}
              onChange={(e) =>
                setClientDetails((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input id="invoiceNumber" placeholder="INV-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input id="invoiceDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" required />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Line Items
            </h2>
            <Button
              onClick={addItem}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-5 space-y-2">
                  <Label>Description *</Label>
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    required
                  />
                </div>
                <div className="col-span-6 md:col-span-3 space-y-2">
                  <Label>Rate ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "rate",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    required
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
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Additional Notes
          </h2>
          <Textarea
            id="notes"
            placeholder="Add any additional notes or terms..."
            rows={4}
          />
        </Card>

        <div className="flex justify-end gap-4">
          <CustomLink href="/invoices">
            <Button variant="outline" size="lg" disabled={isCreating}>
              Cancel
            </Button>
          </CustomLink>
          <Button onClick={handleSave} size="lg" disabled={isCreating}>
            {isCreating ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;

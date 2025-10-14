"use client";

import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Eye, Search as SearchIcon, Trash2, Edit } from "lucide-react";
import DashboardNavigation from "../dashboard/DashboardNavigation";
import { ClientDialog } from "./ClientDialog";
import { useClients } from "@/hooks/clients/useClients";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useToast } from "@/hooks/shared/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const ClientsWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [, copyToClipboard] = useCopyToClipboard();
  const { data, isLoading, isError, isFetching } = useClients({
    page,
    limit: 9,
    searchTerm,
  });
  const { toast } = useToast();
  const clients = data?.data ?? [];
  const pagination = data?.pagination;

  // State pre dialógy
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editedClient, setEditedClient] = useState<any>(null);

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setEditedClient({ ...client }); // Vytvoríme kópiu pre editáciu
    setEditDialogOpen(true);
  };

  const handleDeleteClient = (client: any) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // Tu pridajte logiku na uloženie zmien
    console.log("Ukladám zmeny:", editedClient);
    
    toast({
      title: "Klient bol upravený",
      description: `Údaje klienta ${editedClient.name} boli úspešne aktualizované.`,
      duration: 3000,
      className: "bg-green-800 text-white font-bold text-base",
    });
    
    setEditDialogOpen(false);
    setSelectedClient(null);
    setEditedClient(null);
  };

  const confirmDelete = () => {
    // Tu pridajte logiku na odstránenie klienta
    console.log("Odstraňujem klienta:", selectedClient);
    
    toast({
      title: "Klient bol odstránený",
      description: `Klient ${selectedClient.name} bol úspešne odstránený.`,
      duration: 3000,
      className: "bg-green-800 text-white font-bold text-base",
    });
    
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedClient((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <DashboardNavigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
                Klienti
              </h1>
              <p className="text-muted-foreground mt-2">
                Spravujte vzťahy s vašimi klientmi
              </p>
            </div>
            <ClientDialog />
          </div>

          {/* Search + Cards */}
          <Card className="p-6 bg-gradient-card">
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Hľadať klientov..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <p className="text-red-500 text-center py-6">
                Nepodarilo sa načítať klientov.
              </p>
            ) : clients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              >
                <SearchIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">
                  Žiadni klienti neboli nájdení
                </p>
                <p className="text-sm mt-1">Skúste zmeniť hľadaný výraz</p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <Card
                      key={client._id}
                      className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center"></div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              copyToClipboard(client.email);
                              toast({
                                title: "Email bol skopírovaný",
                                duration: 2000,
                                className: "bg-green-800 text-white font-bold text-base",
                              });
                            }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClient(client)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {client.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {client.email}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Faktúr
                          </p>
                          <p className="font-semibold text-foreground">—</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Celkom
                          </p>
                          <p className="font-semibold text-foreground">—</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-3 mt-8">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Predchádzajúca
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Strana {pagination.page} / {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= pagination.pages}
                      onClick={() =>
                        setPage((p) =>
                          pagination && p < pagination.pages ? p + 1 : p,
                        )
                      }
                    >
                      Ďalšia
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>

          {isFetching && (
            <p className="text-center text-muted-foreground mt-2 text-sm">
              Načítavam nové dáta...
            </p>
          )}
        </div>
      </div>

      {/* Dialog pre zobrazenie detailov klienta */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail klienta</DialogTitle>
            <DialogDescription>
              Informácie o vybranom klientovi
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {selectedClient.name?.charAt(0) || "K"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Faktúr</p>
                  <p className="font-semibold">—</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Celkom</p>
                  <p className="font-semibold">—</p>
                </div>
              </div>

              {selectedClient.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Telefón</p>
                  <p className="font-semibold">{selectedClient.phone}</p>
                </div>
              )}

              {selectedClient.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Adresa</p>
                  <p className="font-semibold">{selectedClient.address}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Badge variant="secondary">Aktívny</Badge>
                <Badge variant="outline">Klient</Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDialogOpen(false)}
            >
              Zavrieť
            </Button>
            <Button 
              onClick={() => {
                handleEditClient(selectedClient);
                setViewDialogOpen(false);
              }}
            >
              Upraviť klienta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pre úpravu klienta */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upraviť klienta</DialogTitle>
            <DialogDescription>
              Upravte informácie o klientovi
            </DialogDescription>
          </DialogHeader>
          
          {editedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {editedClient.name?.charAt(0) || "K"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upraviť klienta</h3>
                  <p className="text-sm text-muted-foreground">Aktualizujte údaje</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Meno klienta</Label>
                  <Input
                    id="name"
                    value={editedClient.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Zadajte meno klienta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedClient.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Zadajte email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefón</Label>
                  <Input
                    id="phone"
                    value={editedClient.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Zadajte telefónne číslo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input
                    id="address"
                    value={editedClient.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Zadajte adresu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Spoločnosť</Label>
                  <Input
                    id="company"
                    value={editedClient.company || ""}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Zadajte názov spoločnosti"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="flex-1"
            >
              Zrušiť
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="flex-1"
            >
              Uložiť zmeny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pre odstránenie klienta */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Odstrániť klienta</DialogTitle>
            <DialogDescription>
              Naozaj chcete odstrániť tohto klienta? Táto akcia je nevratná.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                  {selectedClient.name?.charAt(0) || "K"}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedClient.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1"
            >
              Zrušiť
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
            >
              Odstrániť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientsWrapper;
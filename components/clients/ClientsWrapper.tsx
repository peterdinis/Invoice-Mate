"use client";

import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Eye, Search as SearchIcon } from "lucide-react";
import DashboardNavigation from "../dashboard/DashboardNavigation";
import { ClientDialog } from "./ClientDialog";
import { useClients } from "@/hooks/clients/useClients";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useToast } from "@/hooks/shared/use-toast";
import Link from "next/link";

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
                          <Button variant="ghost" size="icon" 
                            onClick={() => {
                            copyToClipboard(client.email);
                            toast({
                              title: "Email bol skopírovaný",
                              duration: 2000,
                              className:
                                "bg-green-800 text-white font-bold text-base",
                            });
                          }}>
                            <Mail
                              className="w-4 h-4"
                            />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Link href={`/clients/${client._id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
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
    </>
  );
};

export default ClientsWrapper;

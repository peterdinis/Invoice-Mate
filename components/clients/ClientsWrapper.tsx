"use client"

import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Eye, Edit } from "lucide-react";
import DashboardNavigation from "../dashboard/DashboardNavigation";

const mockClients = [
  { id: "1", name: "Acme Corporation", email: "contact@acme.com", invoices: 12, totalSpent: "$45,280" },
  { id: "2", name: "Tech Startup Inc", email: "hello@techstartup.com", invoices: 8, totalSpent: "$28,450" },
  { id: "3", name: "Design Studio LLC", email: "info@designstudio.com", invoices: 15, totalSpent: "$67,890" },
  { id: "4", name: "Marketing Agency", email: "team@marketing.com", invoices: 6, totalSpent: "$18,750" },
  { id: "5", name: "Consulting Firm", email: "consult@firm.com", invoices: 10, totalSpent: "$52,340" },
];

const ClientsWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
    <DashboardNavigation />
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Klienti
            </h1>
            <p className="text-muted-foreground mt-2">
              Spravujte vzťahy s vašimi klientmi
            </p>
          </div>
          CLIENT DIALOG
        </div>

        <Card className="p-6 bg-gradient-card">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Hľadať klientov..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockClients.map((client) => (
              <Card key={client.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Mail className="w-4 h-4" />
                    </Button>
                    CLIENT DIALOG
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">{client.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{client.email}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Faktúr</p>
                    <p className="font-semibold text-foreground">{client.invoices}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Celkom</p>
                    <p className="font-semibold text-foreground">{client.totalSpent}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ClientsWrapper;

"use client";

import { FC, useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import jsPDF from "jspdf";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  GhostIcon,
  FileText,
} from "lucide-react";
import DashboardNavigation from "../dashboard/DashboardNavigation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CustomLink from "../shared/CustomLink";
import { FolderDialog } from "../folders/FolderDialog";
import { FolderList } from "../folders/FolderList";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { usePaginatedInvoices } from "@/hooks/invoices/usePaginatedInovices";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import autoTable from "jspdf-autotable";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  total: number;
  status: "paid" | "pending" | "overdue" | "draft";
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

const statusConfig = {
  paid: {
    label: "Zaplatené",
    className: "bg-success/10 text-success hover:bg-success/20",
  },
  pending: {
    label: "Čakajúce",
    className: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  overdue: {
    label: "Po splatnosti",
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  draft: {
    label: "Koncept",
    className: "bg-muted/10 text-muted-foreground hover:bg-muted/20",
  },
};

const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  );
};

const ITEMS_PER_PAGE = 5;

const InvoicesWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editedStatus, setEditedStatus] = useState<Invoice["status"]>("draft");

  const { data, isLoading, isError, error, refetch } = usePaginatedInvoices(
    pageIndex,
    ITEMS_PER_PAGE,
    selectedFolder as unknown as string,
    searchTerm,
  );

  useEffect(() => {
    setPageIndex(1);
    refetch();
  }, [selectedFolder, searchTerm, refetch]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditedStatus(invoice.status);
    setEditDialogOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleGeneratePDF = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPdfDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    try {
      // replace with real API call
      const res = await fetch(`/api/invoices/${selectedInvoice._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Nepodarilo sa odstrániť faktúru");
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
      refetch();
    } catch (err) {
      console.error(err);
      // fallback: close dialog and refetch
      setDeleteDialogOpen(false);
      refetch();
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedInvoice) return;

    const doc = new jsPDF();

    // 🔹 Hlavička
    doc.setFontSize(20);
    doc.text("FAKTÚRA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Číslo faktúry: ${selectedInvoice.invoiceNumber}`, 14, 35);
    doc.text(
      `Klient: ${typeof selectedInvoice.client === "object" ? selectedInvoice.client.name : "Neznámy klient"}`,
      14,
      42,
    );
    doc.text(
      `Email: ${typeof selectedInvoice.client === "object" ? selectedInvoice.client.email : "-"}`,
      14,
      49,
    );
    doc.text(
      `Dátum vystavenia: ${new Date(selectedInvoice.invoiceDate).toLocaleDateString("sk-SK")}`,
      14,
      56,
    );
    doc.text(
      `Splatnosť: ${new Date(selectedInvoice.dueDate).toLocaleDateString("sk-SK")}`,
      14,
      63,
    );
    doc.text(`Stav: ${getStatusConfig(selectedInvoice.status).label}`, 14, 70);

    // 🔹 Položky faktúry tabuľka
    if (selectedInvoice.items && selectedInvoice.items.length > 0) {
      const tableData = selectedInvoice.items.map((item) => [
        item.description,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 80,
        head: [["Popis", "Množstvo", "Cena", "Celkom"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        foot: [
          [
            "",
            "",
            "Celkom",
            `$${selectedInvoice.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}`,
          ],
        ],
        footStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    }

    doc.setFontSize(10);
    doc.text("Ďakujeme za spoluprácu!", 14, doc.internal.pageSize.height - 20);

    doc.save(`faktura_${selectedInvoice.invoiceNumber}.pdf`);

    setPdfDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editedStatus }),
      });
      if (!res.ok) throw new Error("Nepodarilo sa upraviť faktúru");
      setEditDialogOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Číslo",
      enableSorting: true,
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "client",
      header: "Klient",
      cell: (info) => {
        const client = info.getValue() as Invoice["client"];
        const clientName =
          typeof client === "object" ? client.name : "Unknown Client";
        return <span>{clientName}</span>;
      },
    },
    {
      accessorKey: "total",
      header: "Suma",
      enableSorting: true,
      cell: (info) => (
        <span className="font-semibold">
          ${(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Stav",
      enableSorting: true,
      cell: (info) => {
        const status = info.getValue() as Invoice["status"];
        const cfg = getStatusConfig(status);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cfg.className}`}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Dátum",
      enableSorting: true,
      cell: (info) => (
        <span className="text-muted-foreground">
          {new Date(info.getValue() as string).toLocaleDateString("sk-SK")}
        </span>
      ),
      sortingFn: (a, b) =>
        new Date(a.getValue<string>("invoiceDate")).getTime() -
        new Date(b.getValue<string>("invoiceDate")).getTime(),
    },
    {
      id: "actions",
      header: "Akcie",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewInvoice(row.original)}
            title="Zobraziť detail"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditInvoice(row.original)}
            title="Upraviť faktúru"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleGeneratePDF(row.original)}
            title="Generovať PDF"
          >
            <FileText className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteInvoice(row.original)}
            title="Odstrániť faktúru"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const tableData: Invoice[] = useMemo(() => {
    return (
      data?.invoices.map((invoice) => ({
        _id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        client: {
          _id:
            typeof invoice.client === "object"
              ? invoice.client.toString()
              : invoice.client,
          name: invoice.clientName,
          email: invoice.clientEmail,
        },
        total: invoice.total,
        status: invoice.status as Invoice["status"],
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        items: invoice.lineItems?.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          price: li.rate, // alebo amount podľa potreby
        })),
      })) || []
    );
  }, [data?.invoices]);

  const table = useReactTable<Invoice>({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.pagination?.pages || 0,
  });

  const totalPages = data?.pagination?.pages || 0;

  return (
    <>
      <DashboardNavigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
                Faktúry
              </h1>
              <p className="text-muted-foreground mt-2">
                Spravujte a sledujte všetky vaše faktúry
              </p>
            </div>
            <CustomLink href="/invoices/new">
              <Button className="gap-2" size="lg">
                <Plus className="w-5 h-5" /> Nová faktúra
              </Button>
            </CustomLink>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Priečinky</h3>
                <FolderDialog />
              </div>
              <FolderList
                selectedFolder={selectedFolder}
                onFolderSelect={(folderId) => setSelectedFolder(folderId)}
              />
            </Card>

            <Card className="p-6 bg-gradient-card lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Hľadať faktúry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">
                    Chyba pri načítaní faktúr: {error?.message}
                  </p>
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-12">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GhostIcon className="animate-bounce w-8 h-8" />
                      </EmptyMedia>
                      <EmptyTitle>Žiadne faktúry</EmptyTitle>
                      <EmptyDescription>
                        {searchTerm
                          ? "Nenašli sa žiadne faktúry pre váš vyhľadávací výraz"
                          : "Zatiaľ nemáte žiadne faktúry"}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) =>
                          headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="text-left py-3 px-4 font-semibold text-sm"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={
                                    header.column.getCanSort()
                                      ? "cursor-pointer select-none flex items-center gap-2"
                                      : ""
                                  }
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                  {header.column.getCanSort() && (
                                    <span className="text-xs">
                                      {{
                                        asc: "↑",
                                        desc: "↓",
                                      }[
                                        header.column.getIsSorted() as string
                                      ] ?? "↕"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </th>
                          )),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-4 px-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && !isLoading && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPageIndex((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            pageIndex === 1
                              ? "opacity-50 pointer-events-none"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPageIndex(i + 1)}
                            isActive={pageIndex === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPageIndex((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          className={
                            pageIndex === totalPages
                              ? "opacity-50 pointer-events-none"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* 🔹 VIEW INVOICE DIALOG */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail faktúry</DialogTitle>
            <DialogDescription>Podrobné informácie o faktúre</DialogDescription>
          </DialogHeader>

          {selectedInvoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Číslo faktúry</p>
                  <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Klient</p>
                  <p className="font-medium">
                    {typeof selectedInvoice.client === "object"
                      ? selectedInvoice.client.name
                      : "Neznámy klient"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dátum vystavenia
                  </p>
                  <p>
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                      "sk-SK",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Splatnosť</p>
                  <p>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString(
                      "sk-SK",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suma</p>
                  <p className="font-semibold">
                    ${selectedInvoice.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stav</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      getStatusConfig(selectedInvoice.status).className
                    }`}
                  >
                    {getStatusConfig(selectedInvoice.status).label}
                  </span>
                </div>
              </div>

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-4 mb-2">Položky</h4>
                  <table className="w-full text-sm border border-border rounded-md overflow-hidden">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Popis</th>
                        <th className="text-left p-2">Množstvo</th>
                        <th className="text-left p-2">Cena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="p-2">{item.description}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">${item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Zavrieť
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    setEditDialogOpen(true);
                  }}
                >
                  Upraviť
                </Button>
              </div>
            </div>
          ) : (
            <p>Načítavam údaje...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* 🔹 EDIT DIALOG */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upraviť faktúru</DialogTitle>
            <DialogDescription>Upravte informácie o faktúre</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Stav faktúry</label>
                  <Select
                    value={editedStatus}
                    onValueChange={(val: Invoice["status"]) =>
                      setEditedStatus(val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte stav" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Zaplatené</SelectItem>
                      <SelectItem value="pending">Čakajúce</SelectItem>
                      <SelectItem value="overdue">Po splatnosti</SelectItem>
                      <SelectItem value="draft">Koncept</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Zrušiť
            </Button>
            <Button onClick={handleSaveEdit}>Uložiť zmeny</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔹 DELETE DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Odstrániť faktúru</DialogTitle>
            <DialogDescription>
              Naozaj chcete odstrániť túto faktúru? Táto akcia je nevratná.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {selectedInvoice
                ? `Faktúra ${selectedInvoice.invoiceNumber} — ${typeof selectedInvoice.client === "object" ? selectedInvoice.client.name : ""}`
                : "Žiadna faktúra vybraná."}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Zrušiť
            </Button>
            <Button
              className="bg-destructive text-white"
              onClick={confirmDelete}
            >
              Odstrániť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔹 PDF DIALOG */}
      <Dialog
        open={pdfDialogOpen}
        onOpenChange={(open) => {
          setPdfDialogOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generovať PDF</DialogTitle>
            <DialogDescription>
              Vytvoriť a stiahnuť PDF pre túto faktúru.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {selectedInvoice
                ? `Faktúra ${selectedInvoice.invoiceNumber}`
                : "Žiadna faktúra vybraná."}
            </p>
            <p className="text-sm">
              Kliknite na Generovať pre vytvorenie a stiahnutie PDF.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
              Zrušiť
            </Button>
            <Button onClick={handleDownloadPDF}>Generovať</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoicesWrapper;

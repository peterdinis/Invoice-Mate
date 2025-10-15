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
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  GhostIcon,
  FileText,
  Download,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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

  const { data, isLoading, isError, error, refetch } = usePaginatedInvoices(
    pageIndex,
    ITEMS_PER_PAGE,
    selectedFolder as unknown as string,
    searchTerm
  );

  useEffect(() => {
    setPageIndex(1); // reset stránkovania pri zmene priečinka alebo search
    refetch();
  }, [selectedFolder, searchTerm, refetch]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
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

  const confirmDelete = () => {
    console.log("Odstraňujem faktúru:", selectedInvoice);
    setTimeout(() => {
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
      refetch();
    }, 1000);
  };

  const handleDownloadPDF = () => {
    console.log("Generujem PDF pre faktúru:", selectedInvoice);
    setTimeout(() => {
      setPdfDialogOpen(false);
      setSelectedInvoice(null);
    }, 1500);
  };

  const columns: ColumnDef<Invoice, any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Číslo",
      enableSorting: true,
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "client",
      header: "Klient",
      cell: (info) => {
        const client = info.getValue();
        const clientName = typeof client === "object" ? client.name : "Unknown Client";
        return <span>{clientName}</span>;
      },
    },
    {
      accessorKey: "total",
      header: "Suma",
      enableSorting: true,
      cell: (info) => <span className="font-semibold">${(info.getValue() as number).toFixed(2)}</span>,
    },
    {
      accessorKey: "status",
      header: "Stav",
      enableSorting: true,
      cell: (info) => {
        const status = info.getValue() as string;
        const cfg = getStatusConfig(status);
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Dátum",
      enableSorting: true,
      cell: (info) => <span className="text-muted-foreground">{new Date(info.getValue() as string).toLocaleDateString("sk-SK")}</span>,
      sortingFn: (a, b) =>
        new Date(a.getValue<string>("invoiceDate")).getTime() -
        new Date(b.getValue<string>("invoiceDate")).getTime(),
    },
    {
      id: "actions",
      header: "Akcie",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(row.original)} title="Zobraziť detail">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(row.original)} title="Upraviť faktúru">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleGeneratePDF(row.original)} title="Generovať PDF">
            <FileText className="w-4 h-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(row.original)} title="Odstrániť faktúru">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const tableData = useMemo(() => {
    return data?.invoices.map((invoice) => ({
      ...invoice,
      id: invoice.invoiceNumber || invoice._id,
    })) || [];
  }, [data?.invoices]);

  const table = useReactTable<Invoice>({
    data: tableData as any,
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
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">Faktúry</h1>
              <p className="text-muted-foreground mt-2">Spravujte a sledujte všetky vaše faktúry</p>
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
                  <p className="text-destructive">Chyba pri načítaní faktúr: {error?.message}</p>
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
                            <th key={header.id} className="text-left py-3 px-4 font-semibold text-sm">
                              {header.isPlaceholder ? null : (
                                <div
                                  className={header.column.getCanSort() ? "cursor-pointer select-none flex items-center gap-2" : ""}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && (
                                    <span className="text-xs">
                                      {{
                                        asc: "↑",
                                        desc: "↓",
                                      }[header.column.getIsSorted() as string] ?? "↕"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-4 px-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
                          onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                          className={pageIndex === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
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
                          onClick={() => setPageIndex((prev) => Math.min(totalPages, prev + 1))}
                          className={pageIndex === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
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

      {/* Dialog pre zobrazenie faktúry */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail faktúry</DialogTitle>
            <DialogDescription>Kompletné informácie o faktúre</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Faktúra #{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    Vytvorená: {new Date(selectedInvoice.createdAt).toLocaleDateString("sk-SK")}
                  </p>
                </div>
                <Badge className={getStatusConfig(selectedInvoice.status).className}>
                  {getStatusConfig(selectedInvoice.status).label}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Klient</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">
                      {typeof selectedInvoice.client === "object"
                        ? selectedInvoice.client.name
                        : "Unknown Client"}
                    </p>
                    {typeof selectedInvoice.client === "object" && (
                      <p className="text-muted-foreground">{selectedInvoice.client.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dátumy</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      Vystavená: {new Date(selectedInvoice.invoiceDate).toLocaleDateString("sk-SK")}
                    </p>
                    <p>
                      Splatnosť: {new Date(selectedInvoice.dueDate).toLocaleDateString("sk-SK")}
                    </p>
                  </div>
                </div>
              </div>

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Položky</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Celková suma:</span>
                <span>${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Zavrieť</Button>
            <Button
              onClick={() => {
                handleGeneratePDF(selectedInvoice!);
                setViewDialogOpen(false);
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" /> Stiahnuť PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pre úpravu faktúry */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upraviť faktúru</DialogTitle>
            <DialogDescription>Upravte informácie o faktúre</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Funkcionalita úpravy bude doplnená v ďalšej verzii.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Zrušiť</Button>
            <Button onClick={() => setEditDialogOpen(false)}>Uložiť zmeny</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pre generovanie PDF */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generovať PDF</DialogTitle>
            <DialogDescription>Vyberte možnosti pre generovanie PDF faktúry</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Faktúra #{selectedInvoice.invoiceNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof selectedInvoice.client === "object" ? selectedInvoice.client.name : "Unknown Client"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="includeLogo" defaultChecked className="rounded" />
                  <label htmlFor="includeLogo" className="text-sm">Zahrnúť logo</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="includeSignature" defaultChecked className="rounded" />
                  <label htmlFor="includeSignature" className="text-sm">Zahrnúť podpis</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="includeTerms" defaultChecked className="rounded" />
                  <label htmlFor="includeTerms" className="text-sm">Zahrnúť obchodné podmienky</label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>Zrušiť</Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" /> Generovať a stiahnuť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pre odstránenie faktúry */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Odstrániť faktúru</DialogTitle>
            <DialogDescription>Naozaj chcete odstrániť túto faktúru? Táto akcia je nevratná.</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">#</div>
                <div>
                  <h4 className="font-semibold">Faktúra #{selectedInvoice.invoiceNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    {typeof selectedInvoice.client === "object" ? selectedInvoice.client.name : "Unknown Client"} • ${selectedInvoice.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1">Zrušiť</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Odstrániť</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoicesWrapper;

"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Invoice } from "@/types/InvoiceTypes";

// Constants
const ITEMS_PER_PAGE = 5;
const STATUS_CONFIG = {
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
} as const;

// Memoized components
const StatusBadge = ({ status }: { status: string }) => {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const ActionButtons = ({
  row,
  onView,
  onEdit,
  onGeneratePDF,
  onDelete,
}: {
  row: any;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onGeneratePDF: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}) => (
  <div className="flex justify-end gap-1">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onView(row.original)}
      title="Zobraziť detail"
    >
      <Eye className="w-4 h-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(row.original)}
      title="Upraviť faktúru"
    >
      <Edit className="w-4 h-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onGeneratePDF(row.original)}
      title="Generovať PDF"
    >
      <FileText className="w-4 h-4 text-blue-600" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(row.original)}
      title="Odstrániť faktúru"
    >
      <Trash2 className="w-4 h-4 text-destructive" />
    </Button>
  </div>
);

const TablePagination = ({
  pageIndex,
  totalPages,
  onPageChange,
}: {
  pageIndex: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, pageIndex - 1))}
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
                onClick={() => onPageChange(i + 1)}
                isActive={pageIndex === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, pageIndex + 1))}
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
  );
};

// Main Component
const InvoicesWrapper = () => {
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
    selectedFolder || undefined,
    searchTerm,
  );

  // Memoized data transformation
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
        invoiceDate: invoice.invoiceDate as unknown as string,
        dueDate: invoice.dueDate as unknown as string,
        createdAt: invoice.createdAt as unknown as string,
        updatedAt: invoice.updatedAt as unknown as string,
        items: invoice.lineItems?.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          price: li.rate,
        })),
      })) || []
    );
  }, [data?.invoices]);

  // Memoized columns
  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
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
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
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
          <ActionButtons
            row={row}
            onView={handleViewInvoice}
            onEdit={handleEditInvoice}
            onGeneratePDF={handleGeneratePDF}
            onDelete={handleDeleteInvoice}
          />
        ),
      },
    ],
    [],
  );

  // Memoized table instance
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

  // Memoized callbacks
  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  }, []);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditedStatus(invoice.status);
    setEditDialogOpen(true);
  }, []);

  const handleDeleteInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  }, []);

  const handleGeneratePDF = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPdfDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPageIndex(page);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPageIndex(1);
  }, []);

  const handleFolderSelect = useCallback((folderId: string | null) => {
    setSelectedFolder(folderId);
    setPageIndex(1);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedInvoice) return;

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Nepodarilo sa odstrániť faktúru");

      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
      refetch();
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteDialogOpen(false);
      refetch();
    }
  }, [selectedInvoice, refetch]);

  const handleDownloadPDF = useCallback(() => {
    if (!selectedInvoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    // Header
    doc.setFontSize(20);
    doc.text("FAKTÚRA", pageWidth / 2, currentY, { align: "center" });
    currentY += 25;

    // Invoice details
    doc.setFontSize(12);
    const details = [
      `Číslo faktúry: ${selectedInvoice.invoiceNumber}`,
      `Klient: ${typeof selectedInvoice.client === "object" ? selectedInvoice.client.name : "Neznámy klient"}`,
      `Email: ${typeof selectedInvoice.client === "object" ? selectedInvoice.client.email : "-"}`,
      `Dátum vystavenia: ${new Date(selectedInvoice.invoiceDate).toLocaleDateString("sk-SK")}`,
      `Splatnosť: ${new Date(selectedInvoice.dueDate).toLocaleDateString("sk-SK")}`,
      `Stav: ${STATUS_CONFIG[selectedInvoice.status]?.label || STATUS_CONFIG.draft.label}`,
    ];

    details.forEach((detail, index) => {
      doc.text(detail, 14, currentY + index * 7);
    });

    currentY += details.length * 7 + 15;

    // Items table
    if (selectedInvoice.items?.length) {
      // Simple table implementation without autoTable
      const tableTop = currentY;

      // Table header
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, currentY, pageWidth - 28, 10, "F");
      doc.text("Popis", 16, currentY + 7);
      doc.text("Množstvo", 100, currentY + 7);
      doc.text("Cena", 140, currentY + 7);
      doc.text("Celkom", 170, currentY + 7);

      currentY += 10;
      doc.setTextColor(0, 0, 0);

      // Table rows
      selectedInvoice.items.forEach((item, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(item.description.substring(0, 40), 16, currentY + 7);
        doc.text(item.quantity.toString(), 100, currentY + 7);
        doc.text(`$${item.price.toFixed(2)}`, 140, currentY + 7);
        doc.text(
          `$${(item.quantity * item.price).toFixed(2)}`,
          170,
          currentY + 7,
        );

        // Add line separator
        if (index < selectedInvoice.items!.length - 1) {
          doc.line(14, currentY + 10, pageWidth - 14, currentY + 10);
        }

        currentY += 10;
      });

      // Total row
      currentY += 5;
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, currentY, pageWidth - 28, 10, "F");
      doc.text("Celkom:", 120, currentY + 7);
      doc.text(
        `$${selectedInvoice.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}`,
        170,
        currentY + 7,
      );

      currentY += 15;
    }

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Ďakujeme za spoluprácu!", 14, currentY + 10);

    doc.save(`faktura_${selectedInvoice.invoiceNumber}.pdf`);
    setPdfDialogOpen(false);
    setSelectedInvoice(null);
  }, [selectedInvoice]);

  const handleSaveEdit = useCallback(async () => {
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
      console.error("Edit error:", err);
    }
  }, [selectedInvoice, editedStatus, refetch]);

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
            {/* Folders Sidebar */}
            <Card className="p-6 bg-gradient-card lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Priečinky</h3>
                <FolderDialog />
              </div>
              <FolderList
                selectedFolder={selectedFolder}
                onFolderSelect={handleFolderSelect}
              />
            </Card>

            {/* Main Content */}
            <Card className="p-6 bg-gradient-card lg:col-span-3">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Hľadať faktúry..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Table Content */}
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
                <>
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr
                            key={headerGroup.id}
                            className="border-b border-border bg-muted/50"
                          >
                            {headerGroup.headers.map((header) => (
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
                            ))}
                          </tr>
                        ))}
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

                  <TablePagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
        onEdit={() => {
          setViewDialogOpen(false);
          setEditDialogOpen(true);
        }}
      />

      <InvoiceEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoice={selectedInvoice}
        editedStatus={editedStatus}
        onStatusChange={setEditedStatus}
        onSave={handleSaveEdit}
      />

      <InvoiceDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        invoice={selectedInvoice}
        onConfirm={confirmDelete}
      />

      <PdfDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        invoice={selectedInvoice}
        onGenerate={handleDownloadPDF}
      />
    </>
  );
};

// Dialog Components
const InvoiceViewDialog = ({
  open,
  onOpenChange,
  invoice,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEdit: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Detail faktúry</DialogTitle>
        <DialogDescription>Podrobné informácie o faktúre</DialogDescription>
      </DialogHeader>

      {invoice ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Číslo faktúry</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Klient</p>
              <p className="font-medium">
                {typeof invoice.client === "object"
                  ? invoice.client.name
                  : "Neznámy klient"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dátum vystavenia</p>
              <p>{new Date(invoice.invoiceDate).toLocaleDateString("sk-SK")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Splatnosť</p>
              <p>{new Date(invoice.dueDate).toLocaleDateString("sk-SK")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suma</p>
              <p className="font-semibold">${invoice.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stav</p>
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          {invoice.items && invoice.items.length > 0 && (
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
                  {invoice.items.map((item, idx) => (
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Zavrieť
            </Button>
            <Button onClick={onEdit}>Upraviť</Button>
          </div>
        </div>
      ) : (
        <p>Načítavam údaje...</p>
      )}
    </DialogContent>
  </Dialog>
);

const InvoiceEditDialog = ({
  open,
  onOpenChange,
  invoice,
  editedStatus,
  onStatusChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  editedStatus: Invoice["status"];
  onStatusChange: (status: Invoice["status"]) => void;
  onSave: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Upraviť faktúru</DialogTitle>
        <DialogDescription>Upravte informácie o faktúre</DialogDescription>
      </DialogHeader>

      {invoice && (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Stav faktúry</label>
              <Select
                value={editedStatus}
                onValueChange={(val: Invoice["status"]) => onStatusChange(val)}
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
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Zrušiť
        </Button>
        <Button onClick={onSave}>Uložiť zmeny</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const InvoiceDeleteDialog = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Odstrániť faktúru</DialogTitle>
        <DialogDescription>
          Naozaj chcete odstrániť túto faktúru? Táto akcia je nevratná.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          {invoice
            ? `Faktúra ${invoice.invoiceNumber} — ${typeof invoice.client === "object" ? invoice.client.name : ""}`
            : "Žiadna faktúra vybraná."}
        </p>
      </div>

      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Zrušiť
        </Button>
        <Button className="bg-destructive text-white" onClick={onConfirm}>
          Odstrániť
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const PdfDialog = ({
  open,
  onOpenChange,
  invoice,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onGenerate: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Generovať PDF</DialogTitle>
        <DialogDescription>
          Vytvoriť a stiahnuť PDF pre túto faktúru.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          {invoice
            ? `Faktúra ${invoice.invoiceNumber}`
            : "Žiadna faktúra vybraná."}
        </p>
        <p className="text-sm">
          Kliknite na Generovať pre vytvorenie a stiahnutie PDF.
        </p>
      </div>

      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Zrušiť
        </Button>
        <Button onClick={onGenerate}>Generovať</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default InvoicesWrapper;

"use client";

import { FC, useState, useMemo } from "react";
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

// Definujte správny interface pre Invoice
interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    name: string;
    email: string;
  } | string; // Môže byť string (ID) alebo populated objekt
  total: number;
  status: "paid" | "pending" | "overdue" | "draft";
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
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

const ITEMS_PER_PAGE = 5;

const InvoicesWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, isError, error } = usePaginatedInvoices(
    pageIndex,
    ITEMS_PER_PAGE,
  );

  const filteredData = useMemo(() => {
    if (!data?.invoices) return [];
    return data.invoices.filter(
      (invoice: Invoice) => {
        const clientName = typeof invoice.client === 'object' 
          ? invoice.client.name 
          : 'Unknown Client';
        
        const invoiceNumber = invoice.invoiceNumber || invoice._id;
        
        return (
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    );
  }, [data?.invoices, searchTerm]);

  const columns: ColumnDef<Invoice, any>[] = [
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
        const client = info.getValue();
        const clientName = typeof client === 'object' 
          ? client.name 
          : 'Unknown Client';
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
        const status = info.getValue() as keyof typeof statusConfig;
        const cfg = statusConfig[status] || statusConfig.draft;
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
          {new Date(info.getValue() as string).toLocaleDateString('sk-SK')}
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
        <div className="flex justify-end gap-2">
          <CustomLink href={`/invoices/${row.original._id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </CustomLink>
          <CustomLink href={`/invoices/${row.original._id}/edit`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </CustomLink>
          <Button variant="ghost" size="icon">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const tableData = useMemo(() => {
    return filteredData.map((invoice: { invoiceNumber: any; _id: any; }) => ({
      ...invoice,
      id: invoice.invoiceNumber || invoice._id, // Pre kompatibilitu s pôvodným kódom
    }));
  }, [filteredData]);

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
                <Plus className="w-5 h-5" />
                Nová faktúra
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
                onFolderSelect={setSelectedFolder}
              />
            </Card>

            <Card className="p-6 bg-gradient-card lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Hľadať faktúry..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
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
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GhostIcon className="animate-bounce w-8 h-8" />
                      </EmptyMedia>
                      <EmptyTitle>Žiadne faktúry</EmptyTitle>
                      <EmptyDescription>
                        {searchTerm ? 'Nenašli sa žiadne faktúry pre váš vyhľadávací výraz' : 'Zatiaľ nemáte žiadne faktúry'}
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
    </>
  );
};

export default InvoicesWrapper;
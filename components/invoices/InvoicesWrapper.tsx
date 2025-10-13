"use client";

import { FC, useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

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

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  date: string;
}

const mockInvoices: Invoice[] = [
  { id: "INV-001", client: "Acme Corporation", amount: "$5,280", status: "paid", date: "2025-10-05" },
  { id: "INV-002", client: "Tech Startup Inc", amount: "$3,420", status: "pending", date: "2025-10-03" },
  { id: "INV-003", client: "Design Studio LLC", amount: "$7,890", status: "paid", date: "2025-10-01" },
  { id: "INV-004", client: "Marketing Agency", amount: "$2,150", status: "overdue", date: "2025-09-28" },
  { id: "INV-005", client: "Consulting Firm", amount: "$4,560", status: "pending", date: "2025-09-25" },
  { id: "INV-006", client: "E-commerce Store", amount: "$8,920", status: "paid", date: "2025-09-22" },
  { id: "INV-007", client: "WebWorks Ltd", amount: "$3,750", status: "paid", date: "2025-09-20" },
  { id: "INV-008", client: "Cloudify", amount: "$9,320", status: "pending", date: "2025-09-15" },
  { id: "INV-009", client: "DataCorp", amount: "$12,500", status: "paid", date: "2025-09-12" },
  { id: "INV-010", client: "GreenEnergy", amount: "$2,990", status: "overdue", date: "2025-09-10" },
];

const statusConfig = {
  paid: { label: "Zaplatené", className: "bg-success/10 text-success hover:bg-success/20" },
  pending: { label: "Čakajúce", className: "bg-warning/10 text-warning hover:bg-warning/20" },
  overdue: { label: "Po splatnosti", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
};

const ITEMS_PER_PAGE = 5;

const InvoicesWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(
    () =>
      mockInvoices.filter(
        (invoice) =>
          invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  const columns: ColumnDef<Invoice, any>[] = [
    { accessorKey: "id", header: "Číslo", enableSorting: true, cell: (info) => <span className="font-medium">{info.getValue() as string}</span> },
    { accessorKey: "client", header: "Klient" },
    { 
      accessorKey: "amount", 
      header: "Suma", 
      enableSorting: true, 
      cell: (info) => <span className="font-semibold">{info.getValue() as string}</span>,
      sortingFn: (a, b) => {
        // Odstrániť $ a čiarky pre číselné porovnanie
        const aVal = parseFloat(a.getValue<string>("amount").replace(/[$,]/g, ""));
        const bVal = parseFloat(b.getValue<string>("amount").replace(/[$,]/g, ""));
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    },
    { 
      accessorKey: "status", 
      header: "Stav", 
      enableSorting: true, 
      cell: (info) => {
        const status = info.getValue() as keyof typeof statusConfig;
        const cfg = statusConfig[status];
        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
      } 
    },
    { 
      accessorKey: "date", 
      header: "Dátum", 
      enableSorting: true,
      cell: (info) => <span className="text-muted-foreground">{info.getValue() as string}</span>,
      sortingFn: (a, b) => new Date(a.getValue<string>("date")).getTime() - new Date(b.getValue<string>("date")).getTime()
    },
    {
      id: "actions",
      header: "Akcie",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <CustomLink href={`/invoices/${row.original.id}`}>
            <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
          </CustomLink>
          <CustomLink href={`/invoices/${row.original.id}/edit`}>
            <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
          </CustomLink>
          <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const table = useReactTable<Invoice>({
    data: filteredData,
    columns,
    state: { pagination: { pageIndex, pageSize: ITEMS_PER_PAGE }, sorting },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        setPageIndex((old) => updater({ pageIndex: old, pageSize: ITEMS_PER_PAGE }).pageIndex);
      } else {
        setPageIndex(updater.pageIndex);
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
  });

  const totalPages = table.getPageCount();

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
              <Button className="gap-2" size="lg"><Plus className="w-5 h-5" />Nová faktúra</Button>
            </CustomLink>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Priečinky</h3>
                <FolderDialog />
              </div>
              <FolderList selectedFolder={selectedFolder} onFolderSelect={setSelectedFolder} />
            </Card>

            <Card className="p-6 bg-gradient-card lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Hľadať faktúry..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPageIndex(0); }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id} className="border-b border-border">
                        {hg.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground cursor-pointer select-none"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </th>
                        ))}
                      </tr>
                    ))}
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

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => table.previousPage()}
                          className={!table.getCanPreviousPage() ? "opacity-50 pointer-events-none" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink onClick={() => table.setPageIndex(i)} isActive={pageIndex === i}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => table.nextPage()}
                          className={!table.getCanNextPage() ? "opacity-50 pointer-events-none" : ""}
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

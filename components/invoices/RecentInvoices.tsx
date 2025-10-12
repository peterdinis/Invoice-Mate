"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import CustomLink from "../shared/CustomLink";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

const mockInvoices = [
  {
    id: "INV-001",
    client: "Acme Corporation",
    amount: "$5,280",
    status: "paid",
    date: "2025-10-05",
  },
  {
    id: "INV-002",
    client: "Tech Startup Inc",
    amount: "$3,420",
    status: "pending",
    date: "2025-10-03",
  },
  {
    id: "INV-003",
    client: "Design Studio LLC",
    amount: "$7,890",
    status: "paid",
    date: "2025-10-01",
  },
  {
    id: "INV-004",
    client: "Marketing Agency",
    amount: "$2,150",
    status: "overdue",
    date: "2025-09-28",
  },
  {
    id: "INV-005",
    client: "E-commerce Solutions",
    amount: "$4,560",
    status: "paid",
    date: "2025-09-25",
  },
  {
    id: "INV-006",
    client: "Consulting Group",
    amount: "$6,320",
    status: "pending",
    date: "2025-09-22",
  },
  {
    id: "INV-007",
    client: "Software Development Co",
    amount: "$9,870",
    status: "paid",
    date: "2025-09-20",
  },
  {
    id: "INV-008",
    client: "Creative Agency",
    amount: "$3,210",
    status: "overdue",
    date: "2025-09-18",
  },
];

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
};

const ITEMS_PER_PAGE = 4;

export const RecentInvoices = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockInvoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvoices = mockInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (currentPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (currentPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Posledné faktúry</h2>
        <CustomLink href="/invoices">
          <Button variant="outline">Zobraziť všetky</Button>
        </CustomLink>
      </div>

      <div className="space-y-4">
        {currentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-foreground">{invoice.id}</p>
                <Badge
                  className={
                    statusConfig[invoice.status as keyof typeof statusConfig]
                      .className
                  }
                >
                  {
                    statusConfig[invoice.status as keyof typeof statusConfig]
                      .label
                  }
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{invoice.client}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-bold text-foreground">{invoice.amount}</p>
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
              </div>
              <CustomLink href={`/invoices/${invoice.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </CustomLink>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {renderPageNumbers()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};

export default RecentInvoices;

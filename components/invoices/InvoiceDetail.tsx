"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Loader2 } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { debounce } from "lodash-es";

// Mock data - v reálnej app by prišlo z API
const mockInvoices = [
  {
    id: "INV-001",
    client: "Acme Corp",
    amount: 1500,
    status: "paid",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    client: "Globex",
    amount: 2300,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "INV-003",
    client: "Stark Industries",
    amount: 4500,
    status: "paid",
    date: "2024-01-13",
  },
  {
    id: "INV-004",
    client: "Wayne Enterprises",
    amount: 3200,
    status: "overdue",
    date: "2024-01-12",
  },
  {
    id: "INV-005",
    client: "Oscorp",
    amount: 1800,
    status: "pending",
    date: "2024-01-11",
  },
];

// Status badges
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    paid: { label: "Zaplatené", class: "bg-green-100 text-green-800" },
    pending: { label: "Čaká", class: "bg-yellow-100 text-yellow-800" },
    overdue: { label: "Po splatnosti", class: "bg-red-100 text-red-800" },
  }[status] || { label: status, class: "bg-gray-100 text-gray-800" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}
    >
      {config.label}
    </span>
  );
};

// Search component
const SearchBox = ({
  value,
  onSearch,
  isLoading,
}: {
  value: string;
  onSearch: (value: string) => void;
  isLoading: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        onSearch(searchTerm);
      }, 300),
    [onSearch],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedSearch(newValue);
    },
    [debouncedSearch],
  );

  const clearSearch = useCallback(() => {
    setLocalValue("");
    onSearch("");
  }, [onSearch]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Hľadať faktúry..."
          value={localValue}
          onChange={handleChange}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
        {localValue && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Filter component
const FilterSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Všetky stavy</option>
        <option value="paid">Zaplatené</option>
        <option value="pending">Čakajúce</option>
        <option value="overdue">Po splatnosti</option>
      </select>
    </div>
  );
};

// Main component
const InvoiceSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedInvoices, setDisplayedInvoices] = useState(mockInvoices);

  // Simulácia API call
  const searchInvoices = useCallback(async (term: string, status: string) => {
    setIsLoading(true);

    // Simulácia sieťového oneskorenia
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = mockInvoices.filter((invoice) => {
      const matchesSearch =
        !term ||
        invoice.id.toLowerCase().includes(term.toLowerCase()) ||
        invoice.client.toLowerCase().includes(term.toLowerCase());

      const matchesStatus = !status || invoice.status === status;

      return matchesSearch && matchesStatus;
    });

    setDisplayedInvoices(filtered);
    setIsLoading(false);
  }, []);

  // Handle search
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      searchInvoices(term, statusFilter);
    },
    [statusFilter, searchInvoices],
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
      searchInvoices(searchTerm, status);
    },
    [searchTerm, searchInvoices],
  );

  // Reset filters
  const handleReset = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setDisplayedInvoices(mockInvoices);
  }, []);

  // Initial load
  useEffect(() => {
    searchInvoices("", "");
  }, [searchInvoices]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faktúry</h1>
          <p className="text-gray-600">Spravujte a vyhľadávajte vo faktúrach</p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <SearchBox
                value={searchTerm}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
              <FilterSelect
                value={statusFilter}
                onChange={handleFilterChange}
              />
            </div>

            {(searchTerm || statusFilter) && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="whitespace-nowrap"
              >
                Resetovať filtre
              </Button>
            )}
          </div>

          {/* Active filters info */}
          {(searchTerm || statusFilter) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Hľadaný výraz: "{searchTerm}"
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Stav: {statusFilter}
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Results */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Nájdené faktúry ({displayedInvoices.length})
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Načítavam...
              </div>
            )}
          </div>

          {displayedInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Žiadne výsledky
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter
                  ? "Skúste zmeniť kritériá hľadania"
                  : "Momentálne nemáte žiadne faktúry"}
              </p>
              {(searchTerm || statusFilter) && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-4"
                >
                  Zobraziť všetky faktúry
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {invoice.id}
                      </p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">${invoice.amount}</p>
                    <p className="text-sm text-gray-500">{invoice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        {!isLoading && displayedInvoices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {displayedInvoices.filter((i) => i.status === "paid").length}
              </p>
              <p className="text-sm text-gray-600">Zaplatené</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {displayedInvoices.filter((i) => i.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Čakajúce</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {displayedInvoices.filter((i) => i.status === "overdue").length}
              </p>
              <p className="text-sm text-gray-600">Po splatnosti</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSearch;

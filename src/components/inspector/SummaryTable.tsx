import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ProbeResult, ProbeStatus } from '@/stores/themeProbeStore';

interface SummaryTableProps {
  result: ProbeResult | null;
  activeFilters: Set<ProbeStatus>;
  onRowClick: (id: string) => void;
}

const STATUS_COLORS: Record<ProbeStatus, string> = {
  OK: 'text-green-600',
  AMBIGUOUS: 'text-yellow-600',
  UNMAPPED: 'text-red-600',
  NON_SCALAR: 'text-gray-600',
};

const PAGE_SIZE = 10;

export const SummaryTable: React.FC<SummaryTableProps> = ({
  result,
  activeFilters,
  onRowClick,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<'confidence' | null>(null);
  const [sortDesc, setSortDesc] = useState(true);

  const filteredItems = useMemo(() => {
    if (!result) return [];

    let items = result.items.filter(item => activeFilters.has(item.status));

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item =>
        item.id.toLowerCase().includes(searchLower) ||
        item.bestPath?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortBy === 'confidence') {
      items = [...items].sort((a, b) => {
        const aVal = a.confidence || 0;
        const bVal = b.confidence || 0;
        return sortDesc ? bVal - aVal : aVal - bVal;
      });
    }

    return items;
  }, [result, activeFilters, search, sortBy, sortDesc]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (column: 'confidence') => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No results yet. Run "Probe & Paint" to analyze theme coverage.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Element ID or JSON Path..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Element ID</TableHead>
              <TableHead>JSON Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('confidence')}
              >
                Confidence {sortBy === 'confidence' && (sortDesc ? '↓' : '↑')}
              </TableHead>
              <TableHead>Changed Props</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No items match the current filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(item.id)}
                >
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                    {item.bestPath || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.confidence !== undefined 
                      ? `${Math.round(item.confidence * 100)}%` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.changedProps?.join(', ') || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

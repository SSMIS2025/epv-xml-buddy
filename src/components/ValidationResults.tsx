import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidationError } from '@/types/validation';
import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface ValidationResultsProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  xmlLines: string[];
}

export function ValidationResults({ errors, warnings, xmlLines }: ValidationResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAdZone, setFilterAdZone] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const itemsPerPage = 10;

  const allIssues = [...errors, ...warnings];

  // Filter issues
  const filteredIssues = useMemo(() => {
    return allIssues.filter(issue => {
      const adZoneMatch = filterAdZone === 'all' || (issue.adZone && issue.adZone.toString() === filterAdZone);
      const typeMatch = filterType === 'all' || issue.type === filterType;
      return adZoneMatch && typeMatch;
    });
  }, [allIssues, filterAdZone, filterType]);

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  // Get unique AdZones for filter
  const uniqueAdZones = useMemo(() => {
    const zones = new Set<number>();
    allIssues.forEach(issue => {
      if (issue.adZone) zones.add(issue.adZone);
    });
    return Array.from(zones).sort((a, b) => a - b);
  }, [allIssues]);

  // Group issues by AdZone and PHT
  const groupedIssues = useMemo(() => {
    const groups: Record<string, ValidationError[]> = {};
    
    filteredIssues.forEach(issue => {
      const key = issue.adZone && issue.pht 
        ? `AdZone ${issue.adZone} (PHT ${issue.pht})`
        : 'General';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(issue);
    });
    
    return groups;
  }, [filteredIssues]);

  const getXMLLinePreview = (lineNumber: number) => {
    const line = xmlLines[lineNumber - 1];
    if (!line) return 'Line not found';
    return line.trim().length > 100 ? line.trim().substring(0, 100) + '...' : line.trim();
  };

  if (allIssues.length === 0) {
    return (
      <Card className="animate-slide-up">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
          <p className="text-muted-foreground">Your XML file has passed all validation checks!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Validation Issues
              </CardTitle>
              <CardDescription>
                Found {filteredIssues.length} issues ({errors.length} errors, {warnings.length} warnings)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterAdZone} onValueChange={setFilterAdZone}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {uniqueAdZones.map(zone => (
                    <SelectItem key={zone} value={zone.toString()}>
                      Zone {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grouped Results */}
      {Object.entries(groupedIssues).map(([groupName, groupIssues]) => (
        <Card key={groupName}>
          <CardHeader>
            <CardTitle className="text-lg">{groupName}</CardTitle>
            <CardDescription>
              {groupIssues.length} issues in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupIssues.slice(startIndex, startIndex + itemsPerPage).map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.type === 'error'
                      ? 'validation-error'
                      : 'validation-warning'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {issue.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      )}
                      <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                        Line {issue.line}
                      </Badge>
                      {issue.field && (
                        <Badge variant="outline">{issue.field}</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {issue.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-2">{issue.message}</p>
                  <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                    <span className="text-muted-foreground">Line {issue.line}: </span>
                    <span>{getXMLLinePreview(issue.line)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
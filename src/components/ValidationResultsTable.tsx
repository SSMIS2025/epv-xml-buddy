import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidationError } from '@/types/validation';
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Download, FileText, Table } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ValidationResultsTableProps {
  errors: ValidationError[];
  fileName: string;
}

export function ValidationResultsTable({ errors, fileName }: ValidationResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAdZone, setFilterAdZone] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const itemsPerPage = 10;

  const allIssues = [...errors];

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

  const getErrorTag = (message: string) => {
    if (message.includes('{Dimension-Mismatch}')) return 'Dimension-Mismatch';
    if (message.includes('{File-Not-Found}')) return 'File-Not-Found';
    if (message.includes('Missing')) return 'Missing-Element';
    if (message.includes('Invalid')) return 'Invalid-Value';
    if (message.includes('Expected')) return 'Count-Mismatch';
    return 'Validation-Error';
  };

  const getXMLLinePreview = (lineNumber: number) => {
    const line = xmlLines[lineNumber - 1];
    if (!line) return 'Line not found';
    return line.trim();
  };

  const exportToCSV = () => {
    const headers = ['Line', 'AdZone', 'PHT', 'Error Type', 'Error Tag', 'Message', 'XML Content'];
    const rows = filteredIssues.map(issue => [
      issue.line,
      issue.adZone || '',
      issue.pht || '',
      issue.type.toUpperCase(),
      getErrorTag(issue.message),
      issue.message.replace(/[{}]/g, ''),
      getXMLLinePreview(issue.line)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_validation_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Validation report exported to CSV file",
    });
  };

  const exportToJSON = () => {
    const exportData = {
      fileName,
      validationDate: new Date().toISOString(),
      summary: {
        totalIssues: filteredIssues.length,
        errors: errors.length
      },
      issues: filteredIssues.map(issue => ({
        line: issue.line,
        adZone: issue.adZone,
        pht: issue.pht,
        errorType: issue.type,
        errorTag: getErrorTag(issue.message),
        message: issue.message,
        field: issue.field,
        xmlContent: getXMLLinePreview(issue.line)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_validation_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Validation report exported to JSON file",
    });
  };

  if (allIssues.length === 0) {
    return (
      <Card className="animate-slide-up">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No Issues Found</h3>
          <p className="text-muted-foreground">Your XML file has passed all validation checks!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Table className="w-5 h-5" />
                Validation Issues Details
              </CardTitle>
              <CardDescription>
                Found {filteredIssues.length} issues ({errors.length} errors)
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
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

              <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                CSV
              </Button>
              
              <Button variant="outline" onClick={exportToJSON} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-3 text-left font-semibold text-foreground">Line</th>
                  <th className="p-3 text-left font-semibold text-foreground">AdZone/PHT</th>
                  <th className="p-3 text-left font-semibold text-foreground">Error Tag</th>
                  <th className="p-3 text-left font-semibold text-foreground">Message</th>
                  <th className="p-3 text-left font-semibold text-foreground">Expected</th>
                  <th className="p-3 text-left font-semibold text-foreground">Actual</th>
                  <th className="p-3 text-left font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIssues.map((issue, index) => {
                  const errorTag = getErrorTag(issue.message);
                  const isEven = index % 2 === 0;
                  
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${
                        isEven ? 'bg-background' : 'bg-muted/10'
                      } ${issue.type === 'error' ? 'border-l-4 border-l-destructive' : ''}`}
                    >
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">
                          {issue.line}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground">
                        {issue.adZone && issue.pht ? (
                          <div>
                            <div className="font-medium">Zone {issue.adZone}</div>
                            <div className="text-sm text-muted-foreground">PHT {issue.pht}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={issue.type === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {errorTag}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground max-w-xs">
                        <div className="break-words">
                          {issue.message.replace(/[{}]/g, '')}
                        </div>
                      </td>
                      <td className="p-3 text-foreground">
                        {errorTag === 'Dimension-Mismatch' && issue.message.includes('declares') ? (
                          <div className="text-sm">
                            {issue.message.match(/declares (\d+x\d+)/)?.[1] || 'N/A'}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-foreground">
                        {errorTag === 'Dimension-Mismatch' && issue.message.includes('actual is') ? (
                          <div className="text-sm">
                            {issue.message.match(/actual is (\d+x\d+)/)?.[1] || 'N/A'}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="destructive">
                          FAIL
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* XML Line Details */}
      {paginatedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">XML Line Details</CardTitle>
            <CardDescription>Full XML content for validation errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedIssues.map((issue, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Line {issue.line}</Badge>
                    <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                      {getErrorTag(issue.message)}
                    </Badge>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/20 p-3 rounded font-mono text-sm text-foreground">
                    <div className="text-destructive font-semibold mb-1">ERROR LINE:</div>
                    <div className="whitespace-pre-wrap break-all">
                      {getXMLLinePreview(issue.line)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
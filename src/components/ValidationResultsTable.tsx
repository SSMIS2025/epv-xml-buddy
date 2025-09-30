import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ValidationError } from '@/types/validation';
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Download, FileText, Table, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PHT_VALIDATION_RULES } from '@/config/phtValidationRules';

interface ValidationResultsTableProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  xmlLines: string[];
  fileName: string;
  selectedPHT: string;
}

export function ValidationResultsTable({ errors, warnings = [], xmlLines, fileName, selectedPHT }: ValidationResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAdZone, setFilterAdZone] = useState<string>('all');
  const itemsPerPage = 10;

  const allIssues = [...errors];

  // Filter issues by both PHT and AdZone
  const filteredIssues = useMemo(() => {
    return allIssues.filter(issue => {
      const phtMatch = selectedPHT === 'all' || (issue.pht && issue.pht.toString() === selectedPHT);
      const adZoneMatch = filterAdZone === 'all' || (issue.adZone && issue.adZone.toString() === filterAdZone);
      return phtMatch && adZoneMatch;
    });
  }, [allIssues, selectedPHT, filterAdZone]);

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

  // Get PHT name
  const getPHTName = (phtType: number) => {
    const rule = Object.values(PHT_VALIDATION_RULES).find(r => r.phtType === phtType);
    return rule ? rule.name : 'Unknown';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Validation Issues Details with Accordion */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Table className="w-5 h-5" />
                Validation Issues Details
                {selectedPHT !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    PHT {selectedPHT} - {getPHTName(parseInt(selectedPHT))}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Found {filteredIssues.length} issues in {selectedPHT === 'all' ? 'all PHT types' : `PHT ${selectedPHT}`}
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

      {/* Report Container */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Validation Report</CardTitle>
          <CardDescription>
            Expand each item below to see detailed validation failure information including tags, attributes, expected vs actual values, and XML content.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {paginatedIssues.map((issue, index) => {
              const errorTag = getErrorTag(issue.message);
              
              return (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-destructive/30 bg-destructive/5 rounded-lg overflow-hidden transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/10"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-destructive/10 hover:no-underline transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          Line {issue.line}
                        </Badge>
                        {issue.adZone && issue.pht && (
                          <div className="flex gap-2">
                            <Badge variant="secondary">Zone {issue.adZone}</Badge>
                            <Badge variant="secondary">PHT {issue.pht}</Badge>
                          </div>
                        )}
                        <Badge 
                          variant={issue.type === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {errorTag}
                        </Badge>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        FAIL
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-destructive/5">
                    <div className="space-y-4">
                      {/* Error Details Table */}
                      <div className="border border-destructive/20 rounded-lg overflow-hidden bg-card/50">
                        <table className="w-full text-sm">
                          <tbody>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30 w-32">Tag</td>
                              <td className="p-3 text-foreground">
                                {issue.field || 'XML Structure'}
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Attribute</td>
                              <td className="p-3 text-foreground">
                                {errorTag === 'Dimension-Mismatch' ? 'width, height' : 'Various'}
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Error Type</td>
                              <td className="p-3">
                                <Badge variant="destructive" className="bg-destructive/90">{errorTag}</Badge>
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Expected</td>
                              <td className="p-3 text-foreground">
                                {errorTag === 'Dimension-Mismatch' && issue.message.includes('declares') ? (
                                  <span className="font-mono">{issue.message.match(/declares (\d+x\d+)/)?.[1] || 'N/A'}</span>
                                ) : (
                                  <span className="text-muted-foreground">See description</span>
                                )}
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Actual</td>
                              <td className="p-3 text-foreground">
                                {errorTag === 'Dimension-Mismatch' && issue.message.includes('actual is') ? (
                                  <span className="font-mono text-destructive font-bold">{issue.message.match(/actual is (\d+x\d+)/)?.[1] || 'N/A'}</span>
                                ) : (
                                  <span className="text-muted-foreground">See description</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold bg-muted/30">Why Failed</td>
                              <td className="p-3 text-destructive font-medium">
                                {issue.message.replace(/[{}]/g, '')}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* XML Line Preview */}
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-2">XML Content:</div>
                        <div className="bg-destructive/10 border border-destructive/30 p-3 rounded font-mono text-xs">
                          <div className="text-destructive font-bold mb-1">ERROR LINE {issue.line}:</div>
                          <div className="whitespace-pre-wrap break-all text-foreground">
                            {getXMLLinePreview(issue.line)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-card/50 border-border/50">
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
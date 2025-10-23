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
  xmlLines?: string[];
  fileName?: string;
  selectedPHT?: string;
}

export function ValidationResultsTable({ errors, warnings = [], xmlLines = [], fileName = 'validation', selectedPHT = 'all' }: ValidationResultsTableProps) {
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

  // Extract actual tag and attribute from error message
  const parseErrorDetails = (issue: ValidationError) => {
    let tag = 'image'; // Default to 'image' as most errors are image-related
    let attribute = 'Various';
    
    // File Not Found errors
    if (issue.message.includes('{File-Not-Found}')) {
      tag = 'image';
      attribute = 'fileName';
    } 
    // Dimension Mismatch errors
    else if (issue.message.includes('{Dimension-Mismatch}')) {
      tag = 'image';
      // Extract which dimension from message
      if (issue.message.includes('width')) {
        attribute = 'w (width)';
      } else if (issue.message.includes('height')) {
        attribute = 'h (height)';
      } else {
        attribute = 'w, h (width, height)';
      }
    }
    // Missing-Attribute (empty or missing attribute value)
    else if (issue.message.includes('Missing-Attribute') || issue.message.includes('Missing attribute')) {
      // Extract attribute name from message like "Missing 'zOrder' attribute"
      const attrMatch = issue.message.match(/Missing '([^']+)'/i) || 
                       issue.message.match(/attribute '([^']+)'/i);
      
      tag = 'image';
      attribute = attrMatch ? attrMatch[1] : (issue.field || 'attribute');
    }
    // Missing Element
    else if (issue.message.includes('Missing element') || issue.message.includes('Missing required element')) {
      if (issue.field) {
        tag = issue.field.includes('.') ? issue.field.split('.')[0] : 'AdZone';
        attribute = issue.field.includes('.') ? issue.field.split('.').slice(1).join('.') : issue.field;
      }
    }
    // Missing value for attribute
    else if (issue.message.includes('Missing value for')) {
      const attrMatch = issue.message.match(/for attribute '([^']+)'/i) || 
                       issue.message.match(/for '([^']+)'/i);
      tag = 'image';
      attribute = attrMatch ? attrMatch[1] : (issue.field || 'value');
    }
    // Invalid values - extract proper tag and attribute
    else if (issue.message.includes('Invalid') && issue.field) {
      if (issue.field.includes('.')) {
        const parts = issue.field.split('.');
        tag = parts[0];
        attribute = parts.slice(1).join('.');
      } else {
        // Check if field is just an attribute name (w, h, zOrder, etc.)
        const commonAttributes = ['w', 'h', 'x', 'y', 'zOrder', 'type', 'fileName', 'resolution', 'duration', 'align', 'style'];
        if (commonAttributes.includes(issue.field)) {
          tag = 'image';
          attribute = issue.field;
        } else {
          tag = issue.field;
          const attrMatch = issue.message.match(/attribute '([^']+)'/i) || 
                           issue.message.match(/field '([^']+)'/i) ||
                           issue.message.match(/Invalid ([a-zA-Z]+)/i);
          attribute = attrMatch ? attrMatch[1] : 'value';
        }
      }
    }
    // Expected/count errors
    else if (issue.message.includes('Expected') && issue.field) {
      if (issue.field.includes('.')) {
        const parts = issue.field.split('.');
        tag = parts[0];
        attribute = parts.slice(1).join('.');
      } else {
        tag = issue.field;
        attribute = 'count';
      }
    }
    // Fallback: use field if available
    else if (issue.field) {
      // Check if field is just an attribute name
      const commonAttributes = ['w', 'h', 'x', 'y', 'zOrder', 'type', 'fileName', 'resolution', 'duration', 'align', 'style'];
      if (commonAttributes.includes(issue.field)) {
        tag = 'image';
        attribute = issue.field;
      } else if (issue.field.includes('.')) {
        const parts = issue.field.split('.');
        tag = parts[0];
        attribute = parts.slice(1).join('.');
      } else {
        tag = issue.field;
        attribute = 'Various';
      }
    }
    
    return { tag, attribute };
  };

  const getXMLLinePreview = (lineNumber: number) => {
    if (!xmlLines.length) return 'Not available for historical data';
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

      {/* Summary Table grouped by AdZone and PHT */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Table className="w-5 h-5" />
            Error Summary by Zone & PHT
          </CardTitle>
          <CardDescription>
            Overview of validation errors organized by AdZone and PHT type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b">
                  <th className="p-3 text-left font-semibold">AdZone</th>
                  <th className="p-3 text-left font-semibold">PHT Type</th>
                  <th className="p-3 text-left font-semibold">PHT Name</th>
                  <th className="p-3 text-center font-semibold">Total Errors</th>
                  <th className="p-3 text-left font-semibold">Error Types</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const grouped = new Map<string, {
                    adZone: number;
                    pht: number;
                    count: number;
                    errorTypes: Set<string>;
                  }>();
                  
                  filteredIssues.forEach(issue => {
                    if (issue.adZone && issue.pht) {
                      const key = `${issue.adZone}-${issue.pht}`;
                      if (!grouped.has(key)) {
                        grouped.set(key, {
                          adZone: issue.adZone,
                          pht: issue.pht,
                          count: 0,
                          errorTypes: new Set()
                        });
                      }
                      const entry = grouped.get(key)!;
                      entry.count++;
                      entry.errorTypes.add(getErrorTag(issue.message));
                    }
                  });
                  
                  return Array.from(grouped.values())
                    .sort((a, b) => a.adZone - b.adZone || a.pht - b.pht)
                    .map((entry, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <Badge variant="secondary">Zone {entry.adZone}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">PHT {entry.pht}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {getPHTName(entry.pht)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="destructive" className="font-bold">
                            {entry.count}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(entry.errorTypes).map((type, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ));
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Container */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">Validation Report</CardTitle>
              <CardDescription>
                Expand each item to see detailed validation failure information including tags, attributes, and XML content.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {paginatedIssues.map((issue, index) => {
              const errorTag = getErrorTag(issue.message);
              const { tag, attribute } = parseErrorDetails(issue);
              const serialNumber = startIndex + index + 1;
              
              return (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-destructive/30 bg-destructive/5 rounded-lg overflow-hidden transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/10"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-destructive/10 hover:no-underline transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono bg-background">
                          #{serialNumber}
                        </Badge>
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
                              <td className="p-3 text-foreground font-mono">
                                {tag}
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Attribute</td>
                              <td className="p-3 text-foreground font-mono">
                                {attribute}
                              </td>
                            </tr>
                            <tr className="border-b border-destructive/10">
                              <td className="p-3 font-semibold bg-muted/30">Error Type</td>
                              <td className="p-3">
                                <Badge variant="destructive" className="bg-destructive/90">{errorTag}</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold bg-muted/30">Description</td>
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
            <div className="flex items-center justify-center">
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
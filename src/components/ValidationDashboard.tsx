import { useState } from 'react';
import { ValidationResult } from '@/types/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHT_VALIDATION_RULES } from '@/config/phtValidationRules';

interface ValidationDashboardProps {
  result: ValidationResult;
  fileName: string;
}

interface ValidationDashboardProps {
  result: ValidationResult;
  fileName: string;
  selectedPHT: string;
  onPHTFilterChange: (value: string) => void;
}

export const ValidationDashboard = ({ result, fileName, selectedPHT, onPHTFilterChange }: ValidationDashboardProps) => {

  const exportToCSV = () => {
    
    const headers = ['Line', 'AdZone', 'PHT', 'Error Type', 'Message', 'Field'];
    const rows = filteredErrors.map(error => [
      error.line,
      error.adZone || '',
      error.pht || '',
      'ERROR',
      error.message.replace(/[{}]/g, ''),
      error.field || ''
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
  };

  const exportToJSON = () => {
    const exportData = {
      fileName,
      validationDate: new Date().toISOString(),
      summary: {
        totalIssues: filteredErrors.length,
        errors: result.errors.length,
        isValid: result.isValid
      },
      issues: filteredErrors.map(error => ({
        line: error.line,
        adZone: error.adZone,
        pht: error.pht,
        errorType: 'ERROR',
        message: error.message,
        field: error.field
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
  };

  // Filter errors by PHT type
  const filteredErrors = result.errors.filter(error => {
    if (selectedPHT === 'all') return true;
    return error.pht === parseInt(selectedPHT);
  });

  return (
    <div className="space-y-6">
      <>
          {/* Large Validation Status Banner */}
          <Card className={`relative overflow-hidden border-2 ${result.isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-6">
                {result.isValid ? (
                  <>
                    <div className="text-6xl animate-bounce">😊</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-2">Validation Passed ✓</div>
                      <div className="text-green-600">All checks completed successfully</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl animate-[pulse_1.5s_ease-in-out_infinite]">😢</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-700 mb-2 animate-[pulse_1s_ease-in-out_infinite]">
                        Validation Failed
                      </div>
                      <div className="text-red-600">Please review the errors below</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {result.errors.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AdZones Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Expected:</span>
                    <span className="font-medium">{result.summary.expectedAdZones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual:</span>
                    <span className="font-medium">{result.summary.totalAdZones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={result.summary.expectedAdZones === result.summary.totalAdZones ? "default" : "destructive"}>
                      {result.summary.expectedAdZones === result.summary.totalAdZones ? "Match" : "Mismatch"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ads Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Expected:</span>
                    <span className="font-medium">{result.summary.expectedAds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual:</span>
                    <span className="font-medium">{result.summary.totalAds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={result.summary.expectedAds === result.summary.totalAds ? "default" : "destructive"}>
                      {result.summary.expectedAds === result.summary.totalAds ? "Match" : "Mismatch"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Select value={selectedPHT} onValueChange={onPHTFilterChange}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Filter by PHT Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All PHT Types</SelectItem>
                      {Object.values(PHT_VALIDATION_RULES).map((rule) => (
                        <SelectItem key={rule.phtType} value={rule.phtType.toString()}>
                          PHT {rule.phtType} - {rule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={exportToJSON} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      </div>
  );
};
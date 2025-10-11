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
          <Card className={`relative overflow-hidden border-2 ${result.isValid ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' : 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20'}`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-6">
                {result.isValid ? (
                  <>
                    <div className="text-6xl animate-bounce">😊</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">Validation Passed ✓</div>
                      <div className="text-green-600 dark:text-green-400">All checks completed successfully</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl animate-[pulse_1.5s_ease-in-out_infinite]">😢</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2 animate-[pulse_1s_ease-in-out_infinite]">
                        Validation Failed
                      </div>
                      <div className="text-red-600 dark:text-red-400">Please review the errors below</div>
                    </div>
                    <div className="ml-8 text-center">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-1">Total Errors</div>
                      <div className="text-6xl font-bold text-red-700 dark:text-red-300">{result.errors.length}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Validation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">Metric</th>
                      <th className="text-center p-3 font-semibold">Expected</th>
                      <th className="text-center p-3 font-semibold">Actual</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">AdZones</td>
                      <td className="text-center p-3">{result.summary.expectedAdZones}</td>
                      <td className="text-center p-3">{result.summary.totalAdZones}</td>
                      <td className="text-center p-3">
                        <Badge variant={result.summary.expectedAdZones === result.summary.totalAdZones ? "default" : "destructive"}>
                          {result.summary.expectedAdZones === result.summary.totalAdZones ? "✓ Match" : "✗ Mismatch"}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">Ads</td>
                      <td className="text-center p-3">{result.summary.expectedAds}</td>
                      <td className="text-center p-3">{result.summary.totalAds}</td>
                      <td className="text-center p-3">
                        <Badge variant={result.summary.expectedAds === result.summary.totalAds ? "default" : "destructive"}>
                          {result.summary.expectedAds === result.summary.totalAds ? "✓ Match" : "✗ Mismatch"}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800">
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
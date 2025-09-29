import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { ValidationResultsTable } from './ValidationResultsTable';
import { ValidationHistoryComponent } from './ValidationHistory';
import { validateEPGXML } from '@/utils/xmlValidator';
import { ValidationResult } from '@/types/validation';
import { saveValidationHistory } from '@/utils/historyStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, FileX, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHT_VALIDATION_RULES } from '@/config/phtValidationRules';

export const ValidationDashboard = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedPHT, setSelectedPHT] = useState<string>('all');

  const handleFileValidation = async (file: File, content: string) => {
    setIsValidating(true);
    setFileName(file.name);
    
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = validateEPGXML(content);
      setValidationResult(result);
      
      // Save to history
      saveValidationHistory(file.name, result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const exportToCSV = () => {
    if (!validationResult) return;
    
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
    if (!validationResult) return;
    
    const exportData = {
      fileName,
      validationDate: new Date().toISOString(),
      summary: {
        totalIssues: filteredErrors.length,
        errors: validationResult.errors.length,
        isValid: validationResult.isValid
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
  const filteredErrors = validationResult?.errors.filter(error => {
    if (selectedPHT === 'all') return true;
    return error.pht === parseInt(selectedPHT);
  }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FileUpload onFileValidation={handleFileValidation} isValidating={isValidating} />
        </div>
        <div className="lg:col-span-1">
          <ValidationHistoryComponent />
        </div>
      </div>
      
      {validationResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Validation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Valid
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 animate-pulse" />
                      <Badge variant="destructive" className="animate-pulse">
                        Invalid
                      </Badge>
                    </>
                  )}
                </div>
                {!validationResult.isValid && (
                  <div className="mt-2 text-xs text-red-600 animate-pulse">
                    ❤️ Validation failed - Please check errors
                  </div>
                )}
              </CardContent>
            </Card>

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
                    {validationResult.errors.length}
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
                    <span className="font-medium">{validationResult.summary.expectedAdZones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual:</span>
                    <span className="font-medium">{validationResult.summary.totalAdZones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={validationResult.summary.expectedAdZones === validationResult.summary.totalAdZones ? "default" : "destructive"}>
                      {validationResult.summary.expectedAdZones === validationResult.summary.totalAdZones ? "Match" : "Mismatch"}
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
                    <span className="font-medium">{validationResult.summary.expectedAds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual:</span>
                    <span className="font-medium">{validationResult.summary.totalAds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={validationResult.summary.expectedAds === validationResult.summary.totalAds ? "default" : "destructive"}>
                      {validationResult.summary.expectedAds === validationResult.summary.totalAds ? "Match" : "Mismatch"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Validation Results</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Select value={selectedPHT} onValueChange={setSelectedPHT}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by PHT" />
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
            </CardHeader>
            <CardContent>
              <ValidationResultsTable 
                errors={filteredErrors} 
                fileName={fileName}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
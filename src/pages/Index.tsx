import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { FileUpload } from '@/components/FileUpload';
import { ValidationDashboard } from '@/components/ValidationDashboard';
import { validateEPGXML } from '@/utils/xmlValidator';
import { ValidationResult, MockFileData } from '@/types/validation';
import { ValidationResultsTable } from '@/components/ValidationResultsTable';
import { PHTPresenceTable } from '@/components/PHTPresenceTable';
import { Header } from '@/components/Header';
import { FileText, RotateCcw, Home, FilePlus } from 'lucide-react';
import { saveValidationHistory } from '@/utils/historyStorage';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [filePath, setFilePath] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [xmlLines, setXmlLines] = useState<string[]>([]);
  const [selectedPHT, setSelectedPHT] = useState<string>('all');
  const [revalidationCount, setRevalidationCount] = useState<number>(0);

  useEffect(() => {
    // Check if user has already accepted terms
    const hasAcceptedTerms = document.cookie
      .split('; ')
      .find(row => row.startsWith('epg-validator-terms-accepted='))
      ?.split('=')[1] === 'true';
    
    if (hasAcceptedTerms) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeAccept = () => {
    // Set cookie to remember terms acceptance
    document.cookie = 'epg-validator-terms-accepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    setShowWelcome(false);
  };

  const handleFileSelect = async (content: string, name: string, mockDatabase?: Record<string, MockFileData>, path?: string) => {
    setXmlContent(content);
    setFileName(name);
    setFilePath(path || '');
    setXmlLines(content.split('\n'));
    setIsValidating(true);
    setRevalidationCount(0); // Reset revalidation count on new file

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = validateEPGXML(content, mockDatabase);
      setValidationResult(result);
      
      // Save to history
      saveValidationHistory(name, result, path);
      
      if (result.isValid) {
        toast({
          title: "Validation Successful",
          description: `${name} passed all validation checks!`,
        });
      } else {
        toast({
          title: "Validation Issues Found",
          description: `Found ${result.errors.length} errors and ${result.warnings.length} warnings in ${name}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "An error occurred while validating the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearFile = () => {
    setXmlContent('');
    setFileName('');
    setFilePath('');
    setValidationResult(null);
    setXmlLines([]);
    setSelectedPHT('all');
    setRevalidationCount(0);
  };

  const handleRestart = () => {
    handleClearFile();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRevalidation = async () => {
    if (!window.electron?.Revalidation) {
      toast({
        title: "Feature Not Available",
        description: "Re-validation is only available when running in Electron mode.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const response = await window.electron.Revalidation();
      
      if (response.success && response.xmlContent) {
        setXmlContent(response.xmlContent);
        setFileName(response.fileName);
        setFilePath(response.filePath || '');
        setXmlLines(response.xmlContent.split('\n'));
        
        const result = validateEPGXML(response.xmlContent, response.mockDatabase);
        setValidationResult(result);
        
        // Increment revalidation count
        const newCount = revalidationCount + 1;
        setRevalidationCount(newCount);
        
        // Save to history
        saveValidationHistory(response.fileName, result, response.filePath);
        
        toast({
          title: "Re-validation Complete",
          description: `Re-validation #${newCount} completed. ${result.errors.length} errors found.`,
          variant: result.isValid ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Re-validation Failed",
          description: response.error || "Failed to fetch XML data from system.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Re-validation Error",
        description: "An error occurred during re-validation.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onAccept={handleWelcomeAccept} />;
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header onLogoClick={handleRestart} />
          <main className="container mx-auto px-4 py-4 lg:py-8">
        {/* Header */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">EPG XML Validator</CardTitle>
                  <p className="text-muted-foreground">
                    Professional validation tool for Electronic Program Guide XML files
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {validationResult && (
                  <>
                    <Button variant="outline" onClick={handleRestart}>
                      <FilePlus className="w-4 h-4 mr-2" />
                      New Validation
                    </Button>
                    <Button variant="secondary" onClick={handleRevalidation}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Re-validation {revalidationCount > 0 && `(${revalidationCount})`}
                    </Button>
                  </>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowWelcome(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-muted-foreground"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-8">
          {/* File Upload Section */}
          {!validationResult && (
            <FileUpload 
              onFileSelect={handleFileSelect}
              selectedFile={fileName}
              onClearFile={fileName ? handleClearFile : undefined}
            />
          )}

          {/* Loading State */}
          {isValidating && (
            <Card className="animate-slide-up">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-semibold mb-2">Validating XML File</h3>
                <p className="text-muted-foreground">
                  Analyzing structure, tags, and attributes...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validation Results */}
          {validationResult && !isValidating && (
            <>
              {/* File Info Card */}
              {fileName && (
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-indigo-900 dark:text-indigo-100">File Name:</span>
                        <span className="text-indigo-700 dark:text-indigo-300">{fileName}</span>
                      </div>
                      {filePath && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-semibold text-indigo-900 dark:text-indigo-100">File Path:</span>
                          <span className="text-indigo-700 dark:text-indigo-300 text-sm truncate" title={filePath}>{filePath}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dashboard */}
              <ValidationDashboard
                result={validationResult} 
                fileName={fileName}
                selectedPHT={selectedPHT}
                onPHTFilterChange={setSelectedPHT}
              />

              {/* PHT Presence Table */}
              <PHTPresenceTable 
                presentPHTs={validationResult.presentPHTs}
              />

              {/* Detailed Results */}
              {(() => {
                const filteredErrors = validationResult.errors.filter(error => {
                  if (selectedPHT === 'all') return true;
                  return error.pht === parseInt(selectedPHT);
                });

                if (filteredErrors.length === 0 && selectedPHT !== 'all') {
                  return (
                    <Card className="animate-slide-up bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h3 className="text-2xl font-bold mb-2 text-green-700 dark:text-green-300">No Issues Found</h3>
                        <p className="text-green-600 dark:text-green-400">
                          PHT {selectedPHT} has no validation errors!
                        </p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <ValidationResultsTable 
                    errors={validationResult.errors}
                    warnings={validationResult.warnings}
                    xmlLines={xmlLines}
                    fileName={fileName}
                    selectedPHT={selectedPHT}
                  />
                );
              })()}
            </>
          )}

          {/* Instructions Card (shown when no file is selected) */}
          {!xmlContent && !isValidating && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-foreground">How to Use the EPG XML Validator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Validation Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• XML structure and tag validation</li>
                      <li>• AdZone count verification</li>
                      <li>• Advertisement count checking</li>
                      <li>• File attribute validation</li>
                      <li>• Dimension mismatch detection</li>
                      <li>• Error grouping by AdZone and PHT</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Supported Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Schema vs actual comparison</li>
                      <li>• Line-by-line error reporting</li>
                      <li>• File format validation (PNG, JPG, M2V)</li>
                      <li>• Mock database file verification</li>
                      <li>• Pagination for large result sets</li>
                      <li>• Detailed error descriptions</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Getting Started:</strong> Upload your EPG XML or TXT file using the upload area above. 
                    The validator will automatically check the file structure, count AdZones and advertisements, 
                    validate attributes, and cross-reference file information with the mock database.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

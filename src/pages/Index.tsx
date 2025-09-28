import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { FileUpload } from '@/components/FileUpload';
import { ValidationDashboard } from '@/components/ValidationDashboard';
import { validateEPGXML } from '@/utils/xmlValidator';
import { ValidationResult } from '@/types/validation';
import { ValidationResultsTable } from '@/components/ValidationResultsTable';
import { Header } from '@/components/Header';
import { FileText, RotateCcw, Home } from 'lucide-react';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [xmlLines, setXmlLines] = useState<string[]>([]);

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

  const handleFileSelect = async (content: string, name: string) => {
    setXmlContent(content);
    setFileName(name);
    setXmlLines(content.split('\n'));
    setIsValidating(true);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = validateEPGXML(content);
      setValidationResult(result);
      
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
    setValidationResult(null);
    setXmlLines([]);
  };

  const handleRestart = () => {
    handleClearFile();
  };

  if (showWelcome) {
    return <WelcomeScreen onAccept={handleWelcomeAccept} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-accent/20">
      <Header onLogoClick={() => setShowWelcome(true)} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 border-0 shadow-lg bg-card/95 backdrop-blur-sm">
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
                  <Button variant="outline" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Validation
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => setShowWelcome(true)}
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
              {/* Dashboard */}
              <ValidationDashboard 
                result={validationResult} 
                fileName={fileName}
              />

              {/* Detailed Results */}
              <ValidationResultsTable 
                errors={validationResult.errors}
                warnings={validationResult.warnings}
                xmlLines={xmlLines}
                fileName={fileName}
              />
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
      </div>
    </div>
  );
};

export default Index;

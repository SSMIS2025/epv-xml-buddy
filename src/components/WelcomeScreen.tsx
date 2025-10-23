import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, FileText, Shield, Zap } from 'lucide-react';
import { ValidationHistoryComponent } from '@/components/ValidationHistory';

interface WelcomeScreenProps {
  onAccept: () => void;
}

export function WelcomeScreen({ onAccept }: WelcomeScreenProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      // Set localStorage to remember user acceptance
      localStorage.setItem('epg-validator-terms-accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl animate-welcome space-y-6">
        {/* Recent Validations History */}
        <ValidationHistoryComponent />
        
        <div className="w-full">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-primary rounded-full flex items-center justify-center animate-bounce-gentle">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EPG XML Validator
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground">
              Professional XML validation tool for Electronic Program Guide data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-secondary/50">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Comprehensive Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Validates XML structure, tag matching, and attribute completeness
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-accent/50">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Instant feedback with detailed error reporting and line highlighting
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-secondary/50">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">File Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Cross-references file dimensions and properties with mock database
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">Features Include:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>XML tag validation and structure checking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>AdZone and advertisement count verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>File dimension and format validation</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Error grouping by AdZone and PHT type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Schema vs actual comparison tables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Pagination and detailed reporting</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
              <h4 className="font-semibold text-warning-foreground mb-2">Terms and Conditions</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  By using this EPG XML Validator tool, you agree to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>This tool is provided for validation purposes only</li>
                  <li>Uploaded files are processed locally and not stored permanently</li>
                  <li>Mock file database is used for demonstration and testing</li>
                  <li>Results should be verified against actual production systems</li>
                  <li>Tool accuracy depends on proper XML formatting and structure</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label 
                htmlFor="terms" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and accept the terms and conditions
              </label>
            </div>
          </CardContent>

          <CardFooter className="pt-6 flex flex-col gap-3">
            <Button 
              onClick={handleAccept}
              disabled={!accepted}
              className="w-full py-6 text-lg font-semibold"
              size="lg"
            >
              Accept Terms & Start Validation
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/about'}
              className="w-full"
            >
              View Terms & Privacy Policy
            </Button>
          </CardFooter>
        </Card>
        </div>
      </div>
    </div>
  );
}
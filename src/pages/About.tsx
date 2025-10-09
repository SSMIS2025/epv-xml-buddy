import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Validator
        </Button>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">About XML PHT Validator</CardTitle>
              <CardDescription>Version 1.0.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                XML PHT Validator is a professional tool designed to validate XML files against PHT (Product Hardware Type) specifications. 
                It helps ensure your XML configurations meet the required standards for AdZone and advertisement management.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm text-muted-foreground">
                  By accessing and using this XML PHT Validator tool, you accept and agree to be bound by the terms and conditions of this agreement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Use License</h3>
                <p className="text-sm text-muted-foreground">
                  Permission is granted to temporarily use this validation tool for personal or commercial purposes. This is the grant of a license, not a transfer of title.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  The tool is provided "as is" without warranty of any kind, express or implied. We do not warrant that the tool will be error-free or uninterrupted.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Limitations</h3>
                <p className="text-sm text-muted-foreground">
                  In no event shall we be liable for any damages arising out of the use or inability to use this tool, even if we have been notified of the possibility of such damages.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Data Collection</h3>
                <p className="text-sm text-muted-foreground">
                  This tool processes XML files locally in your browser. We do not collect, store, or transmit your XML files to any external servers. 
                  All validation is performed client-side to ensure your data privacy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Local Storage</h3>
                <p className="text-sm text-muted-foreground">
                  We use local browser storage to save your validation history (last 5 results) for your convenience. 
                  This data remains on your device and can be cleared at any time through your browser settings.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  This tool does not use cookies for tracking or advertising purposes. We respect your privacy and do not collect personal information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For support, questions, or feedback regarding the XML PHT Validator, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValidationResult } from '@/types/validation';
import { AlertCircle, CheckCircle, AlertTriangle, FileX, Target } from 'lucide-react';

interface ValidationDashboardProps {
  result: ValidationResult;
  fileName: string;
}

export function ValidationDashboard({ result, fileName }: ValidationDashboardProps) {
  const { isValid, errors, warnings, summary } = result;
  const totalIssues = errors.length + warnings.length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Status Card */}
      <Card className={cn(
        "border-2",
        isValid 
          ? "border-success bg-success/5" 
          : "border-destructive bg-destructive/5"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isValid ? (
                <CheckCircle className="w-8 h-8 text-success" />
              ) : (
                <AlertCircle className="w-8 h-8 text-destructive" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {isValid ? 'Validation Passed' : 'Validation Failed'}
                </CardTitle>
                <CardDescription className="text-base">
                  File: {fileName}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={isValid ? "default" : "destructive"}
              className="px-4 py-2 text-lg"
            >
              {totalIssues === 0 ? 'No Issues' : `${totalIssues} Issues Found`}
            </Badge>
          </div>
        </CardHeader>
        {totalIssues > 0 && (
          <CardContent>
            <div className="flex gap-4">
              {errors.length > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">{errors.length} Errors</span>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">{warnings.length} Warnings</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{summary.totalAdZones}</div>
            <div className="text-sm text-muted-foreground">AdZones Found</div>
            <div className="text-xs text-muted-foreground mt-1">
              Expected: {summary.expectedAdZones}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileX className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{summary.totalAds}</div>
            <div className="text-sm text-muted-foreground">Total Ads</div>
            <div className="text-xs text-muted-foreground mt-1">
              Expected: {summary.expectedAds}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold">{errors.length}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
            <div className="text-xs text-muted-foreground mt-1">
              Critical Issues
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{warnings.length}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
            <div className="text-xs text-muted-foreground mt-1">
              Minor Issues
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schema vs Actual Comparison */}
      {(summary.expectedAdZones !== summary.totalAdZones || summary.expectedAds !== summary.totalAds) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Schema vs Actual Comparison
            </CardTitle>
            <CardDescription>
              Differences between declared values and actual content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Property</th>
                    <th className="border border-border p-3 text-center font-semibold">Schema/Expected</th>
                    <th className="border border-border p-3 text-center font-semibold">Actual/Found</th>
                    <th className="border border-border p-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-medium">Number of AdZones</td>
                    <td className="border border-border p-3 text-center">{summary.expectedAdZones}</td>
                    <td className="border border-border p-3 text-center">{summary.totalAdZones}</td>
                    <td className="border border-border p-3 text-center">
                      {summary.expectedAdZones === summary.totalAdZones ? (
                        <Badge variant="default" className="bg-success text-success-foreground">Match</Badge>
                      ) : (
                        <Badge variant="destructive">Mismatch</Badge>
                      )}
                    </td>
                  </tr>
                  <tr className="bg-muted/25">
                    <td className="border border-border p-3 font-medium">Total Number of Ads</td>
                    <td className="border border-border p-3 text-center">{summary.expectedAds}</td>
                    <td className="border border-border p-3 text-center">{summary.totalAds}</td>
                    <td className="border border-border p-3 text-center">
                      {summary.expectedAds === summary.totalAds ? (
                        <Badge variant="default" className="bg-success text-success-foreground">Match</Badge>
                      ) : (
                        <Badge variant="destructive">Mismatch</Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}
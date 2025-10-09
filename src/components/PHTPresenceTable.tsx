import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { PHT_VALIDATION_RULES } from '@/config/phtValidationRules';

interface PHTPresenceTableProps {
  presentPHTs: number[];
}

export function PHTPresenceTable({ presentPHTs }: PHTPresenceTableProps) {
  // Don't show if all 4 PHTs are present
  if (presentPHTs.length === 4) {
    return null;
  }

  const allPHTs = Object.values(PHT_VALIDATION_RULES).map(rule => ({
    type: rule.phtType,
    name: rule.name
  })).sort((a, b) => a.type - b.type);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          PHT Type Presence Analysis
        </CardTitle>
        <CardDescription>
          Overview of which PHT types are present in this XML file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-card/80">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b">
                <th className="p-3 text-left font-semibold">PHT Type</th>
                <th className="p-3 text-left font-semibold">PHT Name</th>
                <th className="p-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {allPHTs.map((pht) => {
                const isPresent = presentPHTs.includes(pht.type);
                return (
                  <tr key={pht.type} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <Badge variant="secondary">PHT {pht.type}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {pht.name}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        {isPresent ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Present</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Not Found</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

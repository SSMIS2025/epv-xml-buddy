import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { ValidationHistory, getValidationHistory, clearValidationHistory } from '@/utils/historyStorage';

export const ValidationHistoryComponent = () => {
  const [history, setHistory] = useState<ValidationHistory[]>([]);

  const loadHistory = () => {
    setHistory(getValidationHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = () => {
    clearValidationHistory();
    loadHistory();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Validations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No validation history found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Validations
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearHistory}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {item.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.isValid ? "default" : "destructive"}>
                  {item.isValid ? 'Valid' : `${item.errorCount} errors`}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {item.summary.totalAdZones} zones
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
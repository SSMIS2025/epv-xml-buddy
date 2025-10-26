import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { ValidationHistory, getValidationHistory, clearValidationHistory } from '@/utils/historyStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ValidationResultsTable } from './ValidationResultsTable';
import { PHTPresenceTable } from './PHTPresenceTable';

export const ValidationHistoryComponent = () => {
  const [history, setHistory] = useState<ValidationHistory[]>([]);
  const [selectedItem, setSelectedItem] = useState<ValidationHistory | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadHistory = () => {
    setHistory(getValidationHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = () => {
    clearValidationHistory();
    loadHistory();
    setShowClearConfirm(false);
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
          onClick={() => setShowClearConfirm(true)}
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
                  {item.filePath && (
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]" title={item.filePath}>
                      {item.filePath}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge variant={item.isValid ? "default" : "destructive"}>
                  {item.isValid ? 'Valid' : `${item.errorCount} errors`}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {item.summary.totalAdZones} zones • {item.summary.totalAds} ads
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="mt-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validation Details - {selectedItem?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Status: </span>
                  <Badge variant={selectedItem.isValid ? "default" : "destructive"}>
                    {selectedItem.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold">Validated: </span>
                  {formatTimestamp(selectedItem.timestamp)}
                </div>
              </div>

              <PHTPresenceTable presentPHTs={selectedItem.presentPHTs} />

              <ValidationResultsTable
                errors={selectedItem.errors}
                warnings={selectedItem.warnings}
                fileName={selectedItem.fileName}
                selectedPHT="all"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Validation History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all validation history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
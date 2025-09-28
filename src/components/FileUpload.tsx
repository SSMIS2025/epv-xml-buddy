import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  selectedFile?: string;
  onClearFile?: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClearFile }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect(content, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'text/plain': ['.txt'],
      'application/xml': ['.xml']
    },
    multiple: false
  });

  return (
    <Card className="animate-slide-up">
      <CardContent className="p-6">
        {selectedFile ? (
          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-success" />
              <span className="font-medium">{selectedFile}</span>
            </div>
            {onClearFile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload XML or TXT File</h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop your EPG XML file here, or click to browse
            </p>
            <Button type="button" variant="outline">
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: .xml, .txt • Max file size: 10MB
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
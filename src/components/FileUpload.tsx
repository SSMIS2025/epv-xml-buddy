import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MockFileData } from '@/types/validation';

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string, mockDatabase?: Record<string, MockFileData>) => void;
  selectedFile?: string;
  onClearFile?: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClearFile }: FileUploadProps) {
  const [isLoadingFromSystem, setIsLoadingFromSystem] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');

  const handleSystemLoad = async () => {
    if (!window.electron?.getXmlData) {
      setSystemMessage('Electron API not available. Please use file upload instead.');
      setTimeout(() => setSystemMessage(''), 3000);
      return;
    }

    setIsLoadingFromSystem(true);
    setSystemMessage('Fetching XML data from system...');

    try {
      const response = await window.electron.getXmlData();
      
      if (response.success && response.xmlContent) {
        setSystemMessage('Data loaded successfully!');
        onFileSelect(response.xmlContent, response.fileName, response.mockDatabase);
        setTimeout(() => setSystemMessage(''), 2000);
      } else {
        setSystemMessage(response.error || 'Failed to load data from system. Please use file upload.');
        setTimeout(() => setSystemMessage(''), 3000);
      }
    } catch (error) {
      setSystemMessage('Error connecting to system API. Please use file upload instead.');
      setTimeout(() => setSystemMessage(''), 3000);
    } finally {
      setIsLoadingFromSystem(false);
    }
  };

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
          <div className="space-y-4">
            {/* System Load Button */}
            <div className="flex flex-col items-center gap-4">
              <Button 
                type="button" 
                onClick={handleSystemLoad}
                disabled={isLoadingFromSystem}
                className="w-full max-w-md"
                size="lg"
              >
                {isLoadingFromSystem ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading from System...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Load XML from System
                  </>
                )}
              </Button>
              
              {systemMessage && (
                <div className={cn(
                  "text-sm px-4 py-2 rounded-md",
                  systemMessage.includes('success') 
                    ? "bg-success/10 text-success border border-success/20" 
                    : systemMessage.includes('Fetching')
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {systemMessage}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/25"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or upload manually</span>
              </div>
            </div>

            {/* File Upload Area */}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
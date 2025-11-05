import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, AlertTriangle } from 'lucide-react';
import { MockFileData } from '@/types/validation';

interface ImagesTableProps {
  mockDatabase: Record<string, MockFileData>;
  selectedPHT?: string;
}

export const ImagesTable = ({ mockDatabase, selectedPHT }: ImagesTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Convert mockDatabase to array and filter
  const images = useMemo(() => {
    return Object.values(mockDatabase).filter(image => {
      const matchesSearch = searchQuery === '' || 
        image.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (image.imgPath?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      return matchesSearch;
    });
  }, [mockDatabase, searchQuery]);

  // Check if file is a video file (m2v)
  const isVideoFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.m2v');
  };

  // Group images by PHT if needed
  const imagesByPHT = useMemo(() => {
    const grouped: Record<string, MockFileData[]> = {};
    
    images.forEach(image => {
      // Extract PHT from filename pattern if possible (adjust pattern as needed)
      const phtMatch = image.fileName.match(/pht[_-]?(\d+)/i);
      const pht = phtMatch ? phtMatch[1] : 'unknown';
      
      if (!grouped[pht]) {
        grouped[pht] = [];
      }
      grouped[pht].push(image);
    });
    
    return grouped;
  }, [images]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderImageTable = (imageList: MockFileData[], title?: string) => (
    <Card key={title || 'all'} className="mb-6 animate-fade-in border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title ? `PHT ${title} Images` : 'All Images'}
            <Badge variant="secondary" className="ml-3">{imageList.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/50 transition-colors border-b-2 border-primary/10">
                <TableHead className="w-16 font-semibold text-foreground">S.No</TableHead>
                <TableHead className="font-semibold text-foreground">Image Name</TableHead>
                <TableHead className="font-semibold text-foreground">Size</TableHead>
                <TableHead className="font-semibold text-foreground">Dimensions</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Path</TableHead>
                <TableHead className="w-24 text-center font-semibold text-foreground">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imageList.map((image, index) => (
                <TableRow 
                  key={`${image.fileName}-${index}`}
                  className="hover:bg-accent/50 transition-all duration-200 animate-slide-up border-b border-border/30"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{image.fileName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatFileSize(image.fileSize)}</TableCell>
                  <TableCell className="text-muted-foreground font-medium">{image.actualWidth}x{image.actualHeight}</TableCell>
                  <TableCell>
                    {image.imgCorrupted === false ? (
                      <Badge variant="destructive" className="gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" />
                        Corrupted
                      </Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground hover:bg-success/80 shadow-sm">Valid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <span className="text-xs text-muted-foreground truncate block font-mono bg-muted/30 px-2 py-1 rounded" title={image.imgPath}>
                      {image.imgPath || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {image.imgPath && image.imgCorrupted !== false && !isVideoFile(image.fileName) ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl animate-scale-in">
                          <DialogHeader>
                            <DialogTitle className="text-foreground font-semibold">{image.fileName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-muted/50 to-accent/20 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] gap-4 border border-border/30">
                              <div className="text-center space-y-3 animate-fade-in">
                                <AlertTriangle className="w-16 h-16 mx-auto text-warning/70 animate-pulse" />
                                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                                  Image preview is not available in the browser due to security restrictions. 
                                  The image file is located at the path shown below.
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border border-border/30">
                              <div className="space-y-1">
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">File Name:</span>
                                <p className="text-muted-foreground font-mono text-xs">{image.fileName}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Size:</span>
                                <p className="text-muted-foreground">{formatFileSize(image.fileSize)}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Dimensions:</span>
                                <p className="text-muted-foreground font-medium">{image.actualWidth}x{image.actualHeight}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Type:</span>
                                <p className="text-muted-foreground">{image.mimeType}</p>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Path:</span>
                                <p className="text-muted-foreground break-all mt-1 font-mono text-xs bg-muted/50 p-3 rounded border border-border/30">
                                  {image.imgPath}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled
                        className="opacity-40 cursor-not-allowed"
                        title={isVideoFile(image.fileName) ? "Video preview not available" : "Image preview not available"}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 w-5 h-5" />
            <Input
              placeholder="Search images by name or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border/50 focus:border-primary transition-colors duration-200 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Tables */}
      {images.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">No images found matching your search.</p>
          </CardContent>
        </Card>
      ) : selectedPHT && selectedPHT !== 'all' ? (
        // Show only selected PHT
        imagesByPHT[selectedPHT] ? (
          renderImageTable(imagesByPHT[selectedPHT], selectedPHT)
        ) : (
          <Card className="animate-fade-in">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-warning/60 mb-4" />
              <p className="text-muted-foreground text-lg">No images found for PHT {selectedPHT}.</p>
            </CardContent>
          </Card>
        )
      ) : (
        // Show all PHTs grouped
        Object.entries(imagesByPHT)
          .sort(([a], [b]) => {
            if (a === 'unknown') return 1;
            if (b === 'unknown') return -1;
            return parseInt(a) - parseInt(b);
          })
          .map(([pht, imageList]) => renderImageTable(imageList, pht))
      )}
    </div>
  );
};

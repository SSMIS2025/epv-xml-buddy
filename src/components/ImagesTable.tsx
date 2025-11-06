import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Eye, AlertTriangle, ImageIcon } from 'lucide-react';
import { MockFileData } from '@/types/validation';

interface ImagesTableProps {
  mockDatabase: Record<string, MockFileData>;
  selectedPHT?: string;
}

export const ImagesTable = ({ mockDatabase, selectedPHT }: ImagesTableProps) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  // Convert mockDatabase to array
  const allImages = useMemo(() => {
    return Object.values(mockDatabase);
  }, [mockDatabase]);

  // Check if file is a video file (m2v)
  const isVideoFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.m2v');
  };

  // Group images by PHT
  const imagesByPHT = useMemo(() => {
    const grouped: Record<string, MockFileData[]> = {};
    
    allImages.forEach(image => {
      // Extract PHT from filename pattern
      const phtMatch = image.fileName.match(/pht[_-]?(\d+)/i);
      const pht = phtMatch ? phtMatch[1] : 'unknown';
      
      if (!grouped[pht]) {
        grouped[pht] = [];
      }
      grouped[pht].push(image);
    });
    
    return grouped;
  }, [allImages]);

  // Filter images by search query for each PHT
  const getFilteredImages = (pht: string, images: MockFileData[]) => {
    const searchQuery = searchQueries[pht] || '';
    if (searchQuery === '') return images;
    
    return images.filter(image => {
      return image.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (image.imgPath?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderImageTable = (imageList: MockFileData[], pht: string) => {
    const filteredImages = getFilteredImages(pht, imageList);
    
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 w-4 h-4" />
          <Input
            placeholder="Search images by name or path..."
            value={searchQueries[pht] || ''}
            onChange={(e) => setSearchQueries({ ...searchQueries, [pht]: e.target.value })}
            className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Table */}
        {filteredImages.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 rounded-lg border border-border/30">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No images found matching your search.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/40 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent hover:from-primary/8 hover:via-primary/5 transition-all border-b border-primary/20 h-9">
                  <TableHead className="w-14 font-semibold text-foreground/90 text-xs">S.No</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-xs">Image Name</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-xs">Size</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-xs">Dimensions</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-xs">Path</TableHead>
                  <TableHead className="w-20 text-center font-semibold text-foreground/90 text-xs">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImages.map((image, index) => (
                  <TableRow 
                    key={`${image.fileName}-${index}`}
                    className="hover:bg-primary/5 transition-all duration-200 animate-slide-up border-b border-border/20 h-11"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <TableCell className="font-medium text-muted-foreground text-xs">{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/90">{image.fileName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatFileSize(image.fileSize)}</TableCell>
                    <TableCell className="text-muted-foreground font-medium text-xs">{image.actualWidth}x{image.actualHeight}</TableCell>
                    <TableCell>
                      {image.imgCorrupted === false ? (
                        <Badge variant="destructive" className="gap-1 shadow-sm text-xs h-5">
                          <AlertTriangle className="w-3 h-3" />
                          Corrupted
                        </Badge>
                      ) : (
                        <Badge className="bg-success text-success-foreground hover:bg-success/80 shadow-sm text-xs h-5">Valid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-xs text-muted-foreground truncate block font-mono bg-muted/20 px-2 py-0.5 rounded" title={image.imgPath}>
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
                              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl animate-scale-in">
                            <DialogHeader>
                              <DialogTitle className="text-foreground font-semibold">{image.fileName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] gap-4 border border-primary/20">
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
                                  <p className="text-muted-foreground text-xs">{formatFileSize(image.fileSize)}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Dimensions:</span>
                                  <p className="text-muted-foreground font-medium text-xs">{image.actualWidth}x{image.actualHeight}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Type:</span>
                                  <p className="text-muted-foreground text-xs">{image.mimeType}</p>
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
                          className="h-7 w-7 p-0 opacity-40 cursor-not-allowed"
                          title={isVideoFile(image.fileName) ? "Video preview not available" : "Image preview not available"}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  // Sort PHTs
  const sortedPHTs = Object.entries(imagesByPHT).sort(([a], [b]) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return parseInt(a) - parseInt(b);
  });

  if (allImages.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">No images available in the database.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/30 shadow-lg overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            Images Database
            <Badge variant="secondary" className="ml-2">{allImages.length} Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="multiple" className="space-y-4">
            {sortedPHTs.map(([pht, imageList]) => (
              <AccordionItem 
                key={pht} 
                value={pht}
                className="border border-border/40 rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5 transition-colors group">
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className={`w-1.5 h-8 rounded-full ${pht === 'unknown' ? 'bg-warning' : 'bg-primary'} group-hover:h-10 transition-all`} />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground text-base">
                        {pht === 'unknown' ? 'Unknown PHT Images' : `PHT ${pht} Images`}
                      </span>
                      <Badge 
                        variant={pht === 'unknown' ? 'secondary' : 'default'}
                        className="ml-3 shadow-sm"
                      >
                        {imageList.length} {imageList.length === 1 ? 'image' : 'images'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  {renderImageTable(imageList, pht)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

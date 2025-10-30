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
    <Card key={title || 'all'} className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title ? `PHT ${title} Images` : 'All Images'}
            <Badge variant="secondary" className="ml-2">{imageList.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Image Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Path</TableHead>
                <TableHead className="w-24 text-center">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imageList.map((image, index) => (
                <TableRow key={`${image.fileName}-${index}`}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{image.fileName}</TableCell>
                  <TableCell>{formatFileSize(image.fileSize)}</TableCell>
                  <TableCell>{image.actualWidth}x{image.actualHeight}</TableCell>
                  <TableCell>
                    {image.imgCorrupted === false ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Corrupted
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">Valid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-xs text-muted-foreground truncate block" title={image.imgPath}>
                      {image.imgPath || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {image.imgPath && image.imgCorrupted !== false ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{image.fileName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                              <img 
                                src={`file://${image.imgPath}`} 
                                alt={image.fileName}
                                className="max-w-full max-h-[500px] object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                  e.currentTarget.alt = 'Image preview not available';
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold">File Name:</span> {image.fileName}
                              </div>
                              <div>
                                <span className="font-semibold">Size:</span> {formatFileSize(image.fileSize)}
                              </div>
                              <div>
                                <span className="font-semibold">Dimensions:</span> {image.actualWidth}x{image.actualHeight}
                              </div>
                              <div>
                                <span className="font-semibold">Type:</span> {image.mimeType}
                              </div>
                              <div className="col-span-2">
                                <span className="font-semibold">Path:</span>
                                <p className="text-muted-foreground break-all mt-1">{image.imgPath}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
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
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search images by name or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Tables */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No images found matching your search.</p>
          </CardContent>
        </Card>
      ) : selectedPHT && selectedPHT !== 'all' ? (
        // Show only selected PHT
        imagesByPHT[selectedPHT] ? (
          renderImageTable(imagesByPHT[selectedPHT], selectedPHT)
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No images found for PHT {selectedPHT}.</p>
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

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      }).replace(/\s/g, '') + ' ' + 
      now.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">EPG XML Validator</h1>
              <p className="text-xs text-muted-foreground">Professional Validation Tool</p>
            </div>
          </div>

          {/* Current Time */}
          <div className="text-right">
            <div className="text-sm font-mono text-foreground bg-muted/50 px-3 py-1 rounded">
              {currentTime}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Live Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
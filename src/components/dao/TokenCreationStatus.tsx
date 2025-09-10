import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface TokenCreationStatusProps {
  transactionHash: string;
  network: string;
  onSuccess?: (tokenAddress: string) => void;
}

export function TokenCreationStatus({ transactionHash, network, onSuccess }: TokenCreationStatusProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
  const [tokenAddress, setTokenAddress] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkTransactionStatus = async () => {
      try {
        // Simulate transaction status checking
        const timer = setTimeout(() => {
          setProgress(100);
          setStatus('confirmed');
          // Mock token address - in real implementation, get from transaction receipt
          const mockTokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
          setTokenAddress(mockTokenAddress);
          onSuccess?.(mockTokenAddress);
        }, 3000);

        // Update progress during waiting
        let currentProgress = 0;
        interval = setInterval(() => {
          currentProgress += 10;
          if (currentProgress <= 90) {
            setProgress(currentProgress);
          }
        }, 300);

        return () => {
          clearTimeout(timer);
          clearInterval(interval);
        };
      } catch (error) {
        setStatus('failed');
        clearInterval(interval);
      }
    };

    checkTransactionStatus();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transactionHash, onSuccess]);

  const getExplorerUrl = () => {
    const baseUrls: { [key: string]: string } = {
      'Sepolia Testnet': 'https://sepolia.etherscan.io',
      'Polygon': 'https://polygonscan.com',
      'BSC': 'https://bscscan.com',
      'Arbitrum': 'https://arbiscan.io',
      'Optimism': 'https://optimistic.etherscan.io',
      'Avalanche': 'https://snowtrace.io'
    };
    
    return `${baseUrls[network] || baseUrls['Sepolia Testnet']}/tx/${transactionHash}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Token oluşturuluyor...';
      case 'confirmed':
        return 'Token başarıyla oluşturuldu!';
      case 'failed':
        return 'Token oluşturma başarısız';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Token Oluşturma Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Durum:</span>
          <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>İlerleme</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="text-sm space-y-1">
          <p><strong>Transaction Hash:</strong></p>
          <p className="font-mono text-xs break-all">{transactionHash}</p>
        </div>

        {tokenAddress && (
          <div className="text-sm space-y-1">
            <p><strong>Token Adresi:</strong></p>
            <p className="font-mono text-xs break-all">{tokenAddress}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getExplorerUrl(), '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Explorer'da Görüntüle
          </Button>
          
          {status === 'confirmed' && tokenAddress && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${getExplorerUrl().replace('/tx/', '/token/')}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Token Kontratı
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
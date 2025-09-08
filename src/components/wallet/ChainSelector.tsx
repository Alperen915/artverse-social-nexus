import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '@/hooks/useNetwork';
import { SUPPORTED_NETWORKS } from '@/config/networks';
import { useToast } from '@/hooks/use-toast';

export const ChainSelector = () => {
  const { chainId, chainName, isSupported, switchNetwork } = useNetwork();
  const { toast } = useToast();

  const handleNetworkChange = async (newChainId: string) => {
    try {
      await switchNetwork(newChainId);
      toast({
        title: "Network değiştirildi",
        description: `${SUPPORTED_NETWORKS[newChainId as keyof typeof SUPPORTED_NETWORKS]?.chainName || 'Network'} aktif`,
      });
    } catch (error: any) {
      toast({
        title: "Network değiştirilemedi",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={chainId || ''} onValueChange={handleNetworkChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Network seçin">
            <div className="flex items-center gap-2">
              <Badge variant={isSupported ? "default" : "destructive"}>
                {chainName}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
            <SelectItem key={key} value={network.chainId}>
              <div className="flex items-center gap-2">
                <span>{network.chainName}</span>
                {network.chainId === chainId && (
                  <Badge variant="outline" className="text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!isSupported && chainId && (
        <Badge variant="destructive" className="text-xs">
          Desteklenmiyor
        </Badge>
      )}
    </div>
  );
};
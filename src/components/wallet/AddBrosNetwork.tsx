import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Network, CheckCircle2, AlertCircle } from "lucide-react";
import { SUPPORTED_NETWORKS } from "@/config/networks";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const AddBrosNetwork = () => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const brosTestnet = SUPPORTED_NETWORKS.BROS_CHAIN_TESTNET;

  const addBrosNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Bulunamadı",
        description: "Lütfen MetaMask uzantısını yükleyin.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: brosTestnet.chainId,
            chainName: brosTestnet.chainName,
            nativeCurrency: brosTestnet.nativeCurrency,
            rpcUrls: brosTestnet.rpcUrls,
            blockExplorerUrls: brosTestnet.blockExplorerUrls,
          },
        ],
      });

      setIsAdded(true);
      toast({
        title: "Ağ Eklendi! 🎉",
        description: "Bros Chain Testnet MetaMask'a başarıyla eklendi.",
      });
    } catch (error: any) {
      console.error('Network ekleme hatası:', error);
      
      if (error.code === 4902) {
        toast({
          title: "Ağ Eklenemedi",
          description: "Lütfen manuel olarak eklemeyi deneyin.",
          variant: "destructive",
        });
      } else if (error.code === 4001) {
        toast({
          title: "İptal Edildi",
          description: "Kullanıcı ağ eklemeyi reddetti.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: error.message || "Ağ eklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Bros Chain Testnet Ekle
        </CardTitle>
        <CardDescription>
          Bros Chain Testnet'i MetaMask cüzdanınıza tek tıkla ekleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdded && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Bros Chain Testnet başarıyla eklendi! MetaMask'ta ağ seçiciden görüntüleyebilirsiniz.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Ağ Adı:</span>
            <span className="font-medium">{brosTestnet.chainName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Chain ID:</span>
            <span className="font-medium">{parseInt(brosTestnet.chainId, 16)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Chain ID (Hex):</span>
            <span className="font-medium">{brosTestnet.chainId}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">RPC URL:</span>
            <span className="font-mono text-xs break-all">{brosTestnet.rpcUrls[0]}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Para Birimi:</span>
            <span className="font-medium">{brosTestnet.nativeCurrency.symbol}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Explorer:</span>
            <span className="font-mono text-xs break-all">{brosTestnet.blockExplorerUrls[0]}</span>
          </div>
        </div>

        <Button 
          onClick={addBrosNetwork} 
          disabled={isAdding || isAdded}
          className="w-full"
          size="lg"
        >
          {isAdding ? "Ekleniyor..." : isAdded ? "Eklendi ✓" : "MetaMask'a Ekle"}
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Manuel Ekleme İçin:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>MetaMask'ı açın</li>
              <li>Ağ seçici &gt; Ağ Ekle &gt; Ağı Manuel Olarak Ekle</li>
              <li>Yukarıdaki bilgileri girin</li>
              <li>Kaydet'e tıklayın</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

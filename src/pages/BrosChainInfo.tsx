import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrosChainFaucet } from '@/components/wallet/BrosChainFaucet';
import { NetworkSwitcher } from '@/components/wallet/NetworkSwitcher';
import { Zap, Shield, Coins, Network, TrendingUp, Lock } from 'lucide-react';

export default function BrosChainInfo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Bros Chain Network
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Kurumsal varlık tokenizasyonu ve DAO yönetimi için özel olarak tasarlanmış blockchain ağı
        </p>
        <div className="flex gap-2 justify-center">
          <NetworkSwitcher />
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              TPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,000+</div>
            <p className="text-xs text-muted-foreground">İşlem/saniye</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              Block Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2s</div>
            <p className="text-xs text-muted-foreground">Ortalama süre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Gas Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~$0.001</div>
            <p className="text-xs text-muted-foreground">Ortalama ücret</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Consensus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PoS</div>
            <p className="text-xs text-muted-foreground">Proof of Stake</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="faucet">Testnet Faucet</TabsTrigger>
          <TabsTrigger value="technical">Teknik Detaylar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bros Chain Nedir?</CardTitle>
              <CardDescription>
                Kurumsal ihtiyaçlar için özel olarak tasarlanmış blockchain platformu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Bros Chain, kurumsal varlıkların tokenizasyonu ve merkezi olmayan otonom organizasyonların (DAO) 
                yönetimi için geliştirilmiş, yüksek performanslı bir blockchain ağıdır.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Kurumsal Varlık Tokenizasyonu
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Finansal varlıklar (Hisse, tahvil)</li>
                    <li>• Fiziksel varlıklar (Gayrimenkul, sanat)</li>
                    <li>• Fikri mülkiyet hakları</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    DAO Yönetim Sistemi
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kolay DAO oluşturma</li>
                    <li>• Ağırlıklı oylama sistemi</li>
                    <li>• Otomatik hazine yönetimi</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Yüksek Performans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• 10,000+ TPS işlem kapasitesi</p>
                <p>• 2 saniye block time</p>
                <p>• Düşük gas ücretleri (~$0.001)</p>
                <p>• Anında finality</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔒 Güvenlik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Proof of Stake consensus</p>
                <p>• Multi-signature wallets</p>
                <p>• Otomatik güvenlik denetimleri</p>
                <p>• Time-lock mekanizması</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ EVM Uyumluluğu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Solidity smart contracts</p>
                <p>• Ethereum araçları ile uyumlu</p>
                <p>• Cross-chain bridge desteği</p>
                <p>• MetaMask entegrasyonu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• KYC/AML entegrasyonu</p>
                <p>• Vergi raporlama</p>
                <p>• Regulatory tracking</p>
                <p>• Audit trail</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faucet" className="flex justify-center">
          <BrosChainFaucet />
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Testnet</Badge>
                  Bros Chain Testnet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Chain ID:</span>{' '}
                    <code className="ml-2">0x42524F53</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">RPC URL:</span>{' '}
                    <code className="ml-2 text-xs">https://testnet-rpc.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Explorer:</span>{' '}
                    <code className="ml-2 text-xs">https://testnet-explorer.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Symbol:</span>{' '}
                    <code className="ml-2">BROS</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge>Mainnet</Badge>
                  Bros Chain Mainnet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Chain ID:</span>{' '}
                    <code className="ml-2">0x42524F534D</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">RPC URL:</span>{' '}
                    <code className="ml-2 text-xs">https://rpc.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Explorer:</span>{' '}
                    <code className="ml-2 text-xs">https://explorer.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Symbol:</span>{' '}
                    <code className="ml-2">BROS</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

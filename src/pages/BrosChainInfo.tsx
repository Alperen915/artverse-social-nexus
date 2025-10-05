import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrosChainFaucet } from '@/components/wallet/BrosChainFaucet';
import { NetworkSwitcher } from '@/components/wallet/NetworkSwitcher';
import { Zap, Shield, Coins, Network, TrendingUp, Lock, Rocket, Code, Globe, AlertCircle } from 'lucide-react';

export default function BrosChainInfo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="https://cryptologos.cc/logos/polygon-matic-logo.png" 
            alt="Polygon" 
            className="h-8 w-8"
          />
          <span className="text-sm font-semibold text-muted-foreground">Powered by Polygon Supernet</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Bros Chain Network
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Kurumsal varlık tokenizasyonu için Polygon Supernet tabanlı özel blockchain
        </p>
        <div className="flex gap-2 justify-center">
          <NetworkSwitcher />
        </div>
      </div>

      {/* Important Notice */}
      <Alert className="border-primary">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bros Chain, Polygon Supernet teknolojisi kullanılarak geliştirilmiştir. 
          Polygon'un güvenilirliği ve ölçeklenebilirliği ile kendi özelleştirilebilir blockchain network'ünüz.
        </AlertDescription>
      </Alert>

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
            <p className="text-xs text-muted-foreground">İşlem/saniye (Polygon güvencesi)</p>
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
              Gas Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BROS</div>
            <p className="text-xs text-muted-foreground">Native token (özelleştirilebilir)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Polygon</div>
            <p className="text-xs text-muted-foreground">Enterprise-grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="supernet">Polygon Supernet</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="faucet">Faucet</TabsTrigger>
          <TabsTrigger value="technical">Teknik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bros Chain - Polygon Supernet</CardTitle>
              <CardDescription>
                Kurumsal ihtiyaçlar için özel olarak yapılandırılmış Polygon Supernet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Neden Polygon Supernet?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✅ Polygon'un güvenlik altyapısından yararlanma</li>
                  <li>✅ Özelleştirilebilir gas token (BROS)</li>
                  <li>✅ Kendi validator network'ünüz</li>
                  <li>✅ Polygon PoS ile bridge edilebilir</li>
                  <li>✅ EVM uyumlu - Ethereum araçları ile çalışır</li>
                  <li>✅ Enterprise destek ve güvenlik</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tokenizasyon Özellikleri
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kurumsal hisse senedi tokenizasyonu</li>
                    <li>• Gayrimenkul ve fiziksel varlıklar</li>
                    <li>• Fikri mülkiyet hakları</li>
                    <li>• KYC/AML uyumlu akıllı kontratlar</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    DAO Yönetimi
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• On-chain governance</li>
                    <li>• Ağırlıklı oylama sistemi</li>
                    <li>• Otomatik treasury management</li>
                    <li>• Multi-sig güvenlik</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supernet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Polygon Supernet Nedir?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Polygon Supernet, işletmelerin ve projelerin kendi özel blockchain ağlarını 
                oluşturmalarına olanak tanıyan bir çözümdür. Polygon'un güvenliği ve altyapısı 
                üzerine kurulu, tamamen özelleştirilebilir bir network sağlar.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-2">Kendi Network'ünüz</h3>
                  <p className="text-sm text-muted-foreground">
                    Özel validator set, özelleştirilmiş konsensus parametreleri
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <Coins className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-2">Custom Gas Token</h3>
                  <p className="text-sm text-muted-foreground">
                    BROS tokeninizi gas fee olarak kullanın
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-2">Polygon Güvenliği</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade güvenlik ve altyapı
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Not:</strong> Polygon Supernet deployment için Polygon ekibi ile iletişime geçmeniz gerekmektedir. 
                  Deployment süreci yaklaşık 2-4 hafta sürer ve teknik destek sağlanır.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bros Chain Supernet Özellikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Custom</Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold">BROS Native Token</h4>
                    <p className="text-sm text-muted-foreground">
                      Tüm gas fee'ler BROS token ile ödenir. Token ekonomisi tamamen kontrolünüz altında.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Bridge</Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold">Polygon PoS Bridge</h4>
                    <p className="text-sm text-muted-foreground">
                      Polygon mainnet ile iki yönlü asset transfer. MATIC ve diğer tokenler bridge edilebilir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Validators</Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold">Özel Validator Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Kendi validator'larınızı seçin veya Polygon'un validator network'ünden yararlanın.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Bros Chain Deployment Rehberi
              </CardTitle>
              <CardDescription>
                Polygon Supernet üzerinde Bros Chain'i deploy etme adımları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Polygon ile İletişime Geçin</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Polygon Supernet başvuru formunu doldurun ve ekip ile görüşme ayarlayın.
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      https://polygon.technology/supernets
                    </code>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Network Konfigürasyonu</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bros Chain için özel parametreleri belirleyin:
                    </p>
                    <div className="text-xs bg-muted p-3 rounded space-y-1 font-mono">
                      <div>• Chain ID: 0x42524F53 (özelleştirilebilir)</div>
                      <div>• Gas Token: BROS (18 decimals)</div>
                      <div>• Block Time: 2 seconds</div>
                      <div>• Gas Limit: 20,000,000</div>
                      <div>• Validator Count: 10-100 (önerilir)</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Smart Contract Deployment</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Core smart contract'ları deploy edin:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• BROS Token Contract (ERC-20)</li>
                      <li>• DAO Factory Contract</li>
                      <li>• Governance Contract</li>
                      <li>• NFT Marketplace Contract</li>
                      <li>• Token Marketplace Contract</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Block Explorer Setup</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Blockscout veya custom explorer kurulumu
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      https://explorer.broschain.io
                    </code>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">RPC Endpoint Configuration</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Public RPC endpoint'leri yapılandırın
                    </p>
                    <div className="text-xs bg-muted p-3 rounded space-y-1 font-mono">
                      <div>• Primary RPC: https://rpc.broschain.io</div>
                      <div>• Backup RPC: https://rpc-backup.broschain.io</div>
                      <div>• WebSocket: wss://ws.broschain.io</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Bridge Setup (Opsiyonel)</h3>
                    <p className="text-sm text-muted-foreground">
                      Polygon PoS ile bridge kurulumu için Polygon ekibi ile çalışın
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Deployment Süresi:</strong> 2-4 hafta<br />
                  <strong>Maliyet:</strong> $10,000 - $50,000 (setup + validator maliyetleri)<br />
                  <strong>Teknik Destek:</strong> Polygon ekibi tarafından sağlanır
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faucet" className="flex justify-center">
          <BrosChainFaucet />
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Detayları</CardTitle>
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
                    <code className="ml-2 text-xs">https://rpc-testnet.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Explorer:</span>{' '}
                    <code className="ml-2 text-xs">https://explorer-testnet.broschain.io</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Symbol:</span>{' '}
                    <code className="ml-2">BROS</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Decimals:</span>{' '}
                    <code className="ml-2">18</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Consensus:</span>{' '}
                    <code className="ml-2">Polygon PoS</code>
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
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Decimals:</span>{' '}
                    <code className="ml-2">18</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Consensus:</span>{' '}
                    <code className="ml-2">Polygon PoS</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Smart Contract Addresses</h3>
                <p className="text-sm text-muted-foreground">
                  Deployment sonrası bu adresler güncellenecektir
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">BROS Token:</span>{' '}
                    <code className="ml-2 text-xs">0x... (deployment sonrası)</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">DAO Factory:</span>{' '}
                    <code className="ml-2 text-xs">0x... (deployment sonrası)</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Token Marketplace:</span>{' '}
                    <code className="ml-2 text-xs">0x... (deployment sonrası)</code>
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

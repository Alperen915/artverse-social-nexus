import { AddBrosNetwork } from "@/components/wallet/AddBrosNetwork";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, Wallet, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BrosNetwork = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Bros Chain Testnet Kurulumu
          </h1>
          <p className="text-lg text-muted-foreground">
            Bros Token ekosisteminin test ağını cüzdanınıza ekleyin
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Bros Chain Testnet Nedir?</AlertTitle>
          <AlertDescription>
            Bros Chain, Polygon Supernet teknolojisi kullanılarak oluşturulmuş, Bros Token (BROS) 
            ekosisteminin özel blockchain ağıdır. Testnet, ana ağa geçmeden önce özellikleri test 
            etmenizi sağlar.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto">
              <Wallet className="h-4 w-4 mr-2" />
              Otomatik
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Code className="h-4 w-4 mr-2" />
              Manuel
            </TabsTrigger>
            <TabsTrigger value="contract">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-4">
            <AddBrosNetwork />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manuel Ekleme Adımları</CardTitle>
                <CardDescription>MetaMask'a manuel olarak Bros Chain Testnet ekleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">MetaMask'ı Açın</h3>
                      <p className="text-sm text-muted-foreground">
                        Tarayıcınızda MetaMask uzantısını tıklayın
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Ağ Ekle</h3>
                      <p className="text-sm text-muted-foreground">
                        Üstteki ağ seçici → "Ağ Ekle" → "Ağı Manuel Olarak Ekle"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="font-semibold mb-1">Ağ Bilgilerini Girin</h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3 font-mono text-sm">
                        <div>
                          <span className="text-muted-foreground">Network Name:</span>
                          <div className="font-semibold">Bros Chain Testnet</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">New RPC URL:</span>
                          <div className="font-semibold break-all">https://testnet-rpc.bros-chain.com</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Chain ID:</span>
                          <div className="font-semibold">888888</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Currency Symbol:</span>
                          <div className="font-semibold">BROS</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Block Explorer URL:</span>
                          <div className="font-semibold break-all">https://testnet-explorer.bros-chain.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Kaydet</h3>
                      <p className="text-sm text-muted-foreground">
                        "Save" butonuna tıklayın ve ağ otomatik olarak seçilecektir
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Testnet Contract Adresleri</CardTitle>
                <CardDescription>
                  Bros Chain Testnet'te deploy edilmiş kontratlar (deploy sonrası güncellenecek)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Kontratlar henüz deploy edilmemiş. Deploy işleminden sonra bu adresler güncellenecektir.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 font-mono text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">BROS Token:</div>
                    <div className="text-xs break-all">Henüz deploy edilmedi</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">Token Factory:</div>
                    <div className="text-xs break-all">Henüz deploy edilmedi</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">Staking:</div>
                    <div className="text-xs break-all">Henüz deploy edilmedi</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">Governance:</div>
                    <div className="text-xs break-all">Henüz deploy edilmedi</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="https://testnet-explorer.bros-chain.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Testnet Explorer'da Görüntüle
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deploy Adımları</CardTitle>
                <CardDescription>Kontratları Bros Chain Testnet'e deploy etme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="text-muted-foreground"># 1. Contracts klasörüne gidin</div>
                  <div>cd contracts</div>
                  
                  <div className="text-muted-foreground mt-4"># 2. Dependencies yükleyin</div>
                  <div>npm install</div>
                  
                  <div className="text-muted-foreground mt-4"># 3. .env dosyası oluşturun</div>
                  <div>cp .env.example .env</div>
                  
                  <div className="text-muted-foreground mt-4"># 4. Bros Testnet'e deploy edin</div>
                  <div>npx hardhat run scripts/deploy.js --network brosTestnet</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Test BROS Token Alın</CardTitle>
            <CardDescription>Testnet'te işlem yapmak için BROS token'a ihtiyacınız var</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Bros Chain Testnet faucet henüz aktif değil. Faucet hazır olduğunda buradan test BROS 
                token alabileceksiniz.
              </AlertDescription>
            </Alert>
            
            <Button variant="outline" className="w-full" disabled>
              Faucet (Yakında)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrosNetwork;

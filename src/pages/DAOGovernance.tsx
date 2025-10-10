import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreasuryDashboard } from '@/components/dao/TreasuryDashboard';
import { MultisigWallet } from '@/components/dao/MultisigWallet';
import { VoteDelegation } from '@/components/dao/VoteDelegation';
import { ProposalTemplateSelector } from '@/components/dao/ProposalTemplateSelector';
import { VotingSection } from '@/components/voting/VotingSection';
import { Shield, Wallet, Vote, FileText, BarChart3 } from 'lucide-react';

export default function DAOGovernance() {
  const { id } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">Topluluk ID bulunamadı</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">DAO Yönetimi</h1>
          <p className="text-muted-foreground">
            Hazine, oylama, delegasyon ve öneriler
          </p>
        </div>

        <Tabs defaultValue="treasury" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="treasury" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Hazine
            </TabsTrigger>
            <TabsTrigger value="multisig" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Multi-sig
            </TabsTrigger>
            <TabsTrigger value="delegation" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Delegasyon
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Şablonlar
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Öneriler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="treasury">
            <TreasuryDashboard communityId={id} />
          </TabsContent>

          <TabsContent value="multisig">
            <MultisigWallet communityId={id} />
          </TabsContent>

          <TabsContent value="delegation">
            <VoteDelegation communityId={id} />
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Öneri Şablonları</h2>
                <p className="text-muted-foreground">
                  Hazır şablonlar kullanarak hızlıca öneri oluşturun
                </p>
              </div>
              <ProposalTemplateSelector onSelectTemplate={setSelectedTemplate} />
            </div>
          </TabsContent>

          <TabsContent value="proposals">
            <VotingSection communityId={id} />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

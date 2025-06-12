
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vote, Users, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposal_type: string;
  status: string;
  yes_votes: number;
  no_votes: number;
  voting_end: string;
  created_at: string;
  communities: {
    name: string;
    id: string;
  };
}

const Governance = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          communities (name, id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching proposals:', error);
      } else {
        setProposals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'passed':
        return 'Kabul Edildi';
      case 'failed':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getProposalTypeText = (type: string) => {
    switch (type) {
      case 'general':
        return 'Genel';
      case 'treasury':
        return 'Hazine';
      case 'governance':
        return 'Yönetim';
      case 'membership':
        return 'Üyelik';
      case 'gallery':
        return 'NFT Galeri';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Öneriler yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Topluluk Yönetimi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Topluluk kararlarına katılın ve platform genelindeki oylamaları takip edin
          </p>
        </div>

        {proposals.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Henüz öneri bulunmuyor.
              </p>
              <p className="text-sm text-gray-500">
                Topluluklar çeşitli konularda öneriler oluşturabilir ve üyeler oylayabilir.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {getProposalTypeText(proposal.proposal_type)}
                        </Badge>
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusText(proposal.status)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{proposal.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {proposal.communities?.name || 'Topluluk'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Bitiş: {new Date(proposal.voting_end).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        ✓ {proposal.yes_votes} Evet
                      </span>
                      <span className="text-red-600">
                        ✗ {proposal.no_votes} Hayır
                      </span>
                    </div>
                    
                    <Link to={`/community/${proposal.communities?.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Detaylar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Governance;

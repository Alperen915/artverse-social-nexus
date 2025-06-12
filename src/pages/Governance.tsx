
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote } from 'lucide-react';

const Governance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Global Governance
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participate in cross-community governance and platform-wide decisions
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-6 h-6" />
              Governance Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              The global governance feature is under development.
            </p>
            <p className="text-sm text-gray-500">
              This will enable platform-wide voting on important decisions affecting all communities.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Governance;

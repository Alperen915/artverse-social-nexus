import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Users, 
  ArrowUpRight, 
  Shield, 
  Wallet,
  ExternalLink 
} from 'lucide-react';

interface DAOCardProps {
  dao: {
    id: string;
    name: string;
    description: string;
    is_dao: boolean;
    bros_chain_address: string;
    membership_token_requirement: number;
    membership_is_free: boolean;
    dao_treasury_balance: number;
    artverse_status: 'local' | 'transferring' | 'transferred';
    member_count?: number;
  };
  userTokenBalance?: number;
  onJoin: (daoId: string) => void;
  onView: (daoId: string) => void;
  onTransferToBrosverse?: (daoId: string) => void;
}

export const DAOCard = ({ 
  dao, 
  userTokenBalance = 0, 
  onJoin, 
  onView, 
  onTransferToBrosverse
}: DAOCardProps) => {
  const canJoin = dao.membership_is_free || userTokenBalance >= dao.membership_token_requirement;
  
  const getBrosverseStatusColor = (status: string) => {
    switch (status) {
      case 'local': return 'bg-blue-500';
      case 'transferring': return 'bg-yellow-500';
      case 'transferred': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getBrosverseStatusText = (status: string) => {
    switch (status) {
      case 'local': return 'Yerel DAO';
      case 'transferring': return 'Transfer Ediliyor';
      case 'transferred': return 'Brosverse\'de';
      default: return 'Bilinmeyen';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{dao.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            {dao.is_dao && (
              <Badge variant="secondary" className="text-xs">
                DAO
              </Badge>
            )}
            <Badge 
              className={`text-xs text-white ${getBrosverseStatusColor(dao.artverse_status)}`}
            >
              {getBrosverseStatusText(dao.artverse_status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {dao.description}
        </p>

        {/* Bros Chain Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-orange-500" />
            <span className="font-medium">Bros Chain Address:</span>
          </div>
          <code className="text-xs bg-muted p-2 rounded block truncate">
            {dao.bros_chain_address}
          </code>
        </div>

        {/* Membership Requirements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">Üyelik Gereksinimi:</span>
          </div>
          
          {dao.membership_is_free ? (
            <Badge variant="outline" className="text-green-600">
              Ücretsiz Üyelik
            </Badge>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Gerekli: {dao.membership_token_requirement} BROS</span>
                <span className={canJoin ? 'text-green-600' : 'text-red-600'}>
                  Sahip: {userTokenBalance} BROS
                </span>
              </div>
              <Progress 
                value={Math.min((userTokenBalance / dao.membership_token_requirement) * 100, 100)}
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Treasury & Members */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Hazine</span>
            </div>
            <div className="text-muted-foreground">
              {dao.dao_treasury_balance?.toLocaleString()} BROS
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Üyeler</span>
            </div>
            <div className="text-muted-foreground">
              {dao.member_count || 0}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onView(dao.id)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Görüntüle
          </Button>
          
          {canJoin ? (
            <Button
              onClick={() => onJoin(dao.id)}
              size="sm"
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-1" />
              Katıl
            </Button>
          ) : (
            <Button
              disabled
              size="sm"
              className="flex-1"
              title="Yetersiz BROS token"
            >
              <Shield className="w-4 h-4 mr-1" />
              Yetersiz Token
            </Button>
          )}
        </div>

        {/* Brosverse Transfer Button */}
        {dao.artverse_status === 'local' && onTransferToBrosverse && (
          <Button
            onClick={() => onTransferToBrosverse(dao.id)}
            variant="outline"
            size="sm"
            className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Brosverse'e Aktar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
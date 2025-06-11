
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const { connectWallet, address, isConnecting } = useWallet();

  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (error) {
        console.error('Auth error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('rate limit')) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else if (error.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.');
        } else if (isSignUp && error.message.includes('User already registered')) {
          setError('Account already exists with this email. Try signing in instead.');
        } else if (isSignUp) {
          setSuccess('Account created! Please check your email to confirm your account.');
          setEmail('');
          setPassword('');
        } else {
          setError(error.message || 'Authentication failed. Please try again.');
        }
      } else {
        if (isSignUp) {
          setSuccess('Account created successfully! Please check your email to confirm.');
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setError(null);
    try {
      await connectWallet();
      if (address) {
        onClose();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError('Failed to connect wallet. Please make sure MetaMask is installed and try again.');
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        clearForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Join Artverse
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Sign in to create communities and participate in governance
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => handleEmailAuth(false)}
                disabled={loading || !email || !password || password.length < 6}
                className="w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button 
                onClick={() => handleEmailAuth(true)}
                variant="outline"
                disabled={loading || !email || !password || password.length < 6}
                className="w-full"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4 mt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Connect your Web3 wallet to access token-gated communities
              </p>
              <Button 
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
              {address && (
                <p className="text-xs text-green-600">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

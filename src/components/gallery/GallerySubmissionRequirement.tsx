import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface GallerySubmissionRequirementProps {
  galleryId: string;
  communityId: string;
}

interface SubmissionRequirement {
  required_submissions: number;
  current_submissions: number;
  is_compliant: boolean;
}

export const GallerySubmissionRequirement = ({ 
  galleryId, 
  communityId 
}: GallerySubmissionRequirementProps) => {
  const [requirement, setRequirement] = useState<SubmissionRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSubmissionRequirement = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gallery_submission_requirements')
        .select('required_submissions, current_submissions, is_compliant')
        .eq('gallery_id', galleryId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching submission requirement:', error);
      } else {
        setRequirement(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionRequirement();
  }, [galleryId, user]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4 animate-spin" />
        Zorunluluk kontrol ediliyor...
      </div>
    );
  }

  if (!requirement) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bu galeride submission gerekliliği bulunamadı. Lütfen galeri yöneticisine başvurun.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = () => {
    if (requirement.is_compliant) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-orange-600" />;
  };

  const getStatusText = () => {
    if (requirement.is_compliant) {
      return "Tamamlandı";
    }
    return "Eksik";
  };

  const getStatusColor = () => {
    if (requirement.is_compliant) {
      return "bg-green-100 text-green-800";
    }
    return "bg-orange-100 text-orange-800";
  };

  return (
    <Card className="mb-4 border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-sm">
                NFT Submission Zorunluluğu
              </h4>
              <p className="text-xs text-gray-600">
                {requirement.current_submissions} / {requirement.required_submissions} NFT gönderildi
              </p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {!requirement.is_compliant && (
          <Alert className="mt-3 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>DİKKAT:</strong> Bu galeriye en az {requirement.required_submissions} NFT göndermeniz zorunludur. 
              Şu ana kadar {requirement.current_submissions} NFT gönderdiniz. 
              Eksik kalan: {requirement.required_submissions - requirement.current_submissions} NFT.
            </AlertDescription>
          </Alert>
        )}

        {requirement.is_compliant && (
          <Alert className="mt-3 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Tebrikler! Submission zorunluluğunu tamamladınız. 
              Gelir dağıtımından pay alabilirsiniz.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
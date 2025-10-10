import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Wallet, Users, Calendar, Settings } from 'lucide-react';

interface ProposalTemplate {
  id: string;
  template_name: string;
  template_type: string;
  description: string;
  default_fields: any;
  is_system: boolean;
}

interface ProposalTemplateSelectorProps {
  onSelectTemplate: (template: ProposalTemplate) => void;
}

export function ProposalTemplateSelector({ onSelectTemplate }: ProposalTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('is_system', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Şablonlar yüklenemedi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'treasury':
        return <Wallet className="h-6 w-6" />;
      case 'membership':
        return <Users className="h-6 w-6" />;
      case 'event':
        return <Calendar className="h-6 w-6" />;
      case 'gallery':
        return <FileText className="h-6 w-6" />;
      case 'parameter':
        return <Settings className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectTemplate(template)}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getTemplateIcon(template.template_type)}
              </div>
              {template.is_system && (
                <span className="text-xs bg-primary/20 px-2 py-1 rounded">
                  Sistem
                </span>
              )}
            </div>
            <CardTitle className="text-lg">{template.template_name}</CardTitle>
            <CardDescription className="text-sm">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="sm">
              Bu Şablonu Kullan
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed border-2 cursor-pointer hover:border-primary transition-colors">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
            <FileText className="h-8 w-8" />
          </div>
          <CardTitle>Özel Şablon</CardTitle>
          <CardDescription>
            Sıfırdan öneri oluştur
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

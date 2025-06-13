
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditForm {
  username: string;
  display_name: string;
  bio: string;
}

interface ProfileEditFormProps {
  editForm: EditForm;
  onFormChange: (field: keyof EditForm, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEditForm = ({ editForm, onFormChange, onSave, onCancel }: ProfileEditFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profili Düzenle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            value={editForm.username}
            onChange={(e) => onFormChange('username', e.target.value)}
            placeholder="kullanici_adi"
          />
        </div>
        <div>
          <Label htmlFor="display_name">Görünen Ad</Label>
          <Input
            id="display_name"
            value={editForm.display_name}
            onChange={(e) => onFormChange('display_name', e.target.value)}
            placeholder="Tam Adınız"
          />
        </div>
        <div>
          <Label htmlFor="bio">Biyografi</Label>
          <Input
            id="bio"
            value={editForm.bio}
            onChange={(e) => onFormChange('bio', e.target.value)}
            placeholder="Kendiniz hakkında kısa bilgi..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave}>
            Kaydet
          </Button>
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

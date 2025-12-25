import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, Trophy, Award, X, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Achievement {
  id: string;
  type: "competition" | "certification" | "other";
  title: string;
  titleCs: string;
  subtitle: string;
  subtitleCs: string;
  description: string;
  descriptionCs: string;
  // Competition specific
  competitionName?: string;
  competitionNameCs?: string;
  year?: string;
  level?: string;
  levelCs?: string;
  award?: string;
  awardCs?: string;
  category?: string;
  categoryCs?: string;
  projectId?: string;
  contestUrl?: string;
  image?: string;
  presentationImage?: string;
  placement?: string; // "1st", "2nd", "3rd", or custom text
  placementType?: "1st" | "2nd" | "3rd" | "other"; // For dropdown selection
  // Certification specific
  issuer?: string;
  issuerCs?: string;
  skills?: string[];
  skillsCs?: string[];
  certificateImage?: string;
  certificatePdf?: string;
  // Other specific
  otherImages?: string[]; // Array of image URLs
  published?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

interface AchievementsManagerProps {
  token: string;
}

export function AchievementsManager({ token }: AchievementsManagerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const emptyAchievement: Achievement = {
    id: '',
    type: 'competition',
    title: '',
    titleCs: '',
    subtitle: '',
    subtitleCs: '',
    description: '',
    descriptionCs: '',
  };

  useEffect(() => {
    loadAchievements();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingAchievement) return;

    try {
      const url = editingAchievement.id && achievements.find(a => a.id === editingAchievement.id)
        ? `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements/${editingAchievement.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements`;

      const method = editingAchievement.id && achievements.find(a => a.id === editingAchievement.id) ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token,
        },
        body: JSON.stringify(editingAchievement),
      });

      if (response.ok) {
        toast.success('Achievement saved successfully');
        setIsDialogOpen(false);
        setEditingAchievement(null);
        loadAchievements();
      } else {
        toast.error('Failed to save achievement');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast.error('Failed to save achievement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        toast.success('Achievement deleted successfully');
        loadAchievements();
      } else {
        toast.error('Failed to delete achievement');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  const handleImportDefault = async () => {
    if (!confirm('This will import default achievements. Continue?')) return;

    try {
      const defaultAchievements = await import('../data/defaultAchievements');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ achievements: defaultAchievements.default }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully imported ${data.imported} achievements`);
        loadAchievements();
      } else {
        toast.error('Failed to import achievements');
      }
    } catch (error) {
      console.error('Error importing achievements:', error);
      toast.error('Failed to import achievements');
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'presentationImage' | 'certificateImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.url && editingAchievement) {
        setEditingAchievement({
          ...editingAchievement,
          [field]: data.url,
        });
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadOtherImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.url && editingAchievement) {
        const currentImages = editingAchievement.otherImages || [];
        setEditingAchievement({
          ...editingAchievement,
          otherImages: [...currentImages, data.url],
        });
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveOtherImage = (index: number) => {
    if (!editingAchievement) return;
    const newImages = [...(editingAchievement.otherImages || [])];
    newImages.splice(index, 1);
    setEditingAchievement({
      ...editingAchievement,
      otherImages: newImages,
    });
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/achievements/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ published: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(newStatus ? 'Achievement published' : 'Achievement unpublished');
        loadAchievements();
      } else {
        toast.error('Failed to update achievement status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update achievement status');
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h2>Achievements ({achievements.length})</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingAchievement({ ...emptyAchievement, id: crypto.randomUUID() });
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
          <Button onClick={handleImportDefault} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Import Default
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={achievement.published === false ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    {achievement.published === false && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(achievement.id, achievement.published)}
                    title={achievement.published === false ? 'Publish' : 'Unpublish'}
                  >
                    {achievement.published === false ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingAchievement(achievement);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="mb-2">
                {achievement.type === 'competition' ? <Trophy className="h-3 w-3 mr-1" /> : <Award className="h-3 w-3 mr-1" />}
                {achievement.type}
              </Badge>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
              {achievement.year && (
                <p className="text-xs text-muted-foreground mt-2">Year: {achievement.year}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No achievements yet. Click "Import Default" to get started.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement?.id && achievements.find(a => a.id === editingAchievement.id)
                ? 'Edit Achievement'
                : 'Create New Achievement'}
            </DialogTitle>
          </DialogHeader>

          {editingAchievement && (
            <div className="space-y-6">
              {/* Type */}
              <div>
                <Label>Type</Label>
                <Select
                  value={editingAchievement.type}
                  onValueChange={(value: "competition" | "certification" | "other") =>
                    setEditingAchievement({ ...editingAchievement, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={editingAchievement.title}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                    placeholder="Title in English"
                  />
                </div>
                <div>
                  <Label>Title (Czech)</Label>
                  <Input
                    value={editingAchievement.titleCs}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, titleCs: e.target.value })}
                    placeholder="Název v češtině"
                  />
                </div>
              </div>

              {/* Subtitle - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subtitle (English)</Label>
                  <Input
                    value={editingAchievement.subtitle}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, subtitle: e.target.value })}
                    placeholder="Subtitle in English"
                  />
                </div>
                <div>
                  <Label>Subtitle (Czech)</Label>
                  <Input
                    value={editingAchievement.subtitleCs}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, subtitleCs: e.target.value })}
                    placeholder="Podtitulek v češtině"
                  />
                </div>
              </div>

              {/* Description - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={editingAchievement.description}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                    placeholder="Description in English"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Description (Czech)</Label>
                  <Textarea
                    value={editingAchievement.descriptionCs}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, descriptionCs: e.target.value })}
                    placeholder="Popis v češtině"
                    rows={4}
                  />
                </div>
              </div>

              {/* Competition-specific fields */}
              {editingAchievement.type === 'competition' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Competition Name (English)</Label>
                      <Input
                        value={editingAchievement.competitionName || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, competitionName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Competition Name (Czech)</Label>
                      <Input
                        value={editingAchievement.competitionNameCs || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, competitionNameCs: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={editingAchievement.year || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Level (English)</Label>
                      <Input
                        value={editingAchievement.level || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, level: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Level (Czech)</Label>
                      <Input
                        value={editingAchievement.levelCs || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, levelCs: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Award (English)</Label>
                      <Input
                        value={editingAchievement.award || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, award: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Award (Czech)</Label>
                      <Input
                        value={editingAchievement.awardCs || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, awardCs: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category (English)</Label>
                      <Input
                        value={editingAchievement.category || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, category: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Category (Czech)</Label>
                      <Input
                        value={editingAchievement.categoryCs || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, categoryCs: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project ID</Label>
                      <Select
                        value={editingAchievement.projectId || ''}
                        onValueChange={(value) => setEditingAchievement({ ...editingAchievement, projectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contest URL</Label>
                      <Input
                        value={editingAchievement.contestUrl || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, contestUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Placement Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Placement / Umístění</Label>
                      <Select
                        value={editingAchievement.placementType || ''}
                        onValueChange={(value: "1st" | "2nd" | "3rd" | "other") => {
                          if (value === 'other') {
                            setEditingAchievement({ 
                              ...editingAchievement, 
                              placementType: value,
                              placement: editingAchievement.placement || ''
                            });
                          } else {
                            setEditingAchievement({ 
                              ...editingAchievement, 
                              placementType: value,
                              placement: value
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte umístění..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">🥇 1st Place / 1. místo</SelectItem>
                          <SelectItem value="2nd">🥈 2nd Place / 2. místo</SelectItem>
                          <SelectItem value="3rd">🥉 3rd Place / 3. místo</SelectItem>
                          <SelectItem value="other">✏️ Other / Jiné</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editingAchievement.placementType === 'other' && (
                      <div>
                        <Label>Custom Placement</Label>
                        <Input
                          value={editingAchievement.placement || ''}
                          onChange={(e) => setEditingAchievement({ ...editingAchievement, placement: e.target.value })}
                          placeholder="e.g. Honorable Mention, Finalist..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Competition Images */}
                  <div className="space-y-4">
                    <div>
                      <Label>Main Image</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImage(e, 'image')}
                          disabled={uploadingImage}
                          className="hidden"
                          id="image-upload-main"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload-main')?.click()}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        {editingAchievement.image && (
                          <img src={editingAchievement.image} alt="Main" className="h-16 w-16 object-cover rounded" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Presentation Image</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImage(e, 'presentationImage')}
                          disabled={uploadingImage}
                          className="hidden"
                          id="image-upload-presentation"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload-presentation')?.click()}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        {editingAchievement.presentationImage && (
                          <img src={editingAchievement.presentationImage} alt="Presentation" className="h-16 w-16 object-cover rounded" />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Certification-specific fields */}
              {editingAchievement.type === 'certification' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Issuer (English)</Label>
                      <Input
                        value={editingAchievement.issuer || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, issuer: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Issuer (Czech)</Label>
                      <Input
                        value={editingAchievement.issuerCs || ''}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, issuerCs: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Skills (English, one per line)</Label>
                      <Textarea
                        value={editingAchievement.skills?.join('\n') || ''}
                        onChange={(e) => setEditingAchievement({
                          ...editingAchievement,
                          skills: e.target.value.split('\n').filter(Boolean)
                        })}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label>Skills (Czech, one per line)</Label>
                      <Textarea
                        value={editingAchievement.skillsCs?.join('\n') || ''}
                        onChange={(e) => setEditingAchievement({
                          ...editingAchievement,
                          skillsCs: e.target.value.split('\n').filter(Boolean)
                        })}
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Certificate Image */}
                  <div>
                    <Label>Certificate Image</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(e, 'certificateImage')}
                        disabled={uploadingImage}
                        className="hidden"
                        id="image-upload-certificate"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload-certificate')?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {editingAchievement.certificateImage && (
                        <img src={editingAchievement.certificateImage} alt="Certificate" className="h-16 w-16 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Certificate PDF URL</Label>
                    <Input
                      value={editingAchievement.certificatePdf || ''}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, certificatePdf: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Other-specific fields */}
              {editingAchievement.type === 'other' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>Other Images</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadOtherImage(e)}
                          disabled={uploadingImage}
                          className="hidden"
                          id="image-upload-other"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload-other')?.click()}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        {editingAchievement.otherImages?.map((image, index) => (
                          <div key={index} className="relative inline-block">
                            <img src={image} alt={`Other ${index + 1}`} className="h-16 w-16 object-cover rounded" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveOtherImage(index)}
                              className="absolute top-0 right-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Achievement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
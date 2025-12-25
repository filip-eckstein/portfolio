import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  contentCs: string;
  rating: number;
  initials: string;
  projectId?: string;
  published?: boolean;
  featured?: boolean; // Featured on homepage
  createdAt?: number;
  updatedAt?: number;
}

interface TestimonialsManagerProps {
  token: string;
}

export function TestimonialsManager({ token }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const emptyTestimonial: Testimonial = {
    id: '',
    name: '',
    role: '',
    company: '',
    content: '',
    contentCs: '',
    rating: 5,
    initials: '',
  };

  useEffect(() => {
    loadTestimonials();
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

  const loadTestimonials = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load testimonials');
      }

      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTestimonial) return;

    try {
      const url = editingTestimonial.id && testimonials.find(t => t.id === editingTestimonial.id)
        ? `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials/${editingTestimonial.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials`;

      const method = editingTestimonial.id && testimonials.find(t => t.id === editingTestimonial.id) ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token,
        },
        body: JSON.stringify(editingTestimonial),
      });

      if (response.ok) {
        toast.success('Testimonial saved successfully');
        setIsDialogOpen(false);
        setEditingTestimonial(null);
        loadTestimonials();
      } else {
        toast.error('Failed to save testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        toast.success('Testimonial deleted successfully');
        loadTestimonials();
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleImportDefault = async () => {
    if (!confirm('This will import default testimonials. Continue?')) return;

    try {
      const defaultTestimonials = await import('../data/defaultTestimonials');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ testimonials: defaultTestimonials.default }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully imported ${data.imported} testimonials`);
        loadTestimonials();
      } else {
        toast.error('Failed to import testimonials');
      }
    } catch (error) {
      console.error('Error importing testimonials:', error);
      toast.error('Failed to import testimonials');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials/${id}`,
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
        toast.success(newStatus ? 'Testimonial published' : 'Testimonial unpublished');
        loadTestimonials();
      } else {
        toast.error('Failed to update testimonial status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update testimonial status');
    }
  };

  const handleToggleFeatured = async (testimonialId: string) => {
    try {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      if (!testimonial) return;

      const newFeaturedStatus = !testimonial.featured;

      // Check if we're trying to feature a 4th testimonial
      if (newFeaturedStatus) {
        const featuredCount = testimonials.filter(t => t.featured).length;
        if (featuredCount >= 3) {
          toast.error('You can only feature up to 3 testimonials on the homepage. Unfeature another testimonial first.');
          return;
        }
      }

      // Update testimonial
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/testimonials/${testimonialId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ ...testimonial, featured: newFeaturedStatus }),
        }
      );

      if (response.ok) {
        toast.success(newFeaturedStatus ? '⭐ Testimonial featured on homepage!' : 'Testimonial unfeatured');
        loadTestimonials();
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h2>Testimonials ({testimonials.length})</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingTestimonial({ ...emptyTestimonial, id: crypto.randomUUID() });
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
          <Button onClick={handleImportDefault} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Import Default
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className={testimonial.published === false ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      {testimonial.featured && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                      {testimonial.published === false && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleFeatured(testimonial.id)}
                    title={testimonial.featured ? 'Remove from featured' : 'Feature on homepage (max 3)'}
                    className={testimonial.featured ? 'text-yellow-500 hover:text-yellow-600' : ''}
                  >
                    <Star className={`h-4 w-4 ${testimonial.featured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(testimonial.id, testimonial.published)}
                    title={testimonial.published === false ? 'Publish' : 'Unpublish'}
                  >
                    {testimonial.published === false ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTestimonial(testimonial);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {testimonial.content}
              </p>
              {testimonial.company && (
                <p className="text-xs text-muted-foreground mt-2">{testimonial.company}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No testimonials yet. Click "Import Default" to get started.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id && testimonials.find(t => t.id === editingTestimonial.id)
                ? 'Edit Testimonial'
                : 'Create New Testimonial'}
            </DialogTitle>
          </DialogHeader>

          {editingTestimonial && (
            <div className="space-y-6">
              {/* Name, Role, Company */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    placeholder="e.g., Client, Electrician"
                  />
                </div>
                <div>
                  <Label>Company/Location</Label>
                  <Input
                    value={editingTestimonial.company}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    placeholder="e.g., Prague, CZ"
                  />
                </div>
              </div>

              {/* Initials & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Initials (for avatar)</Label>
                  <Input
                    value={editingTestimonial.initials}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, initials: e.target.value })}
                    placeholder="e.g., ZW"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label>Rating (1-5)</Label>
                  <Select
                    value={editingTestimonial.rating.toString()}
                    onValueChange={(value) =>
                      setEditingTestimonial({ ...editingTestimonial, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content - EN & CS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content (English)</Label>
                  <Textarea
                    value={editingTestimonial.content}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                    placeholder="Testimonial text in English"
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Content (Czech)</Label>
                  <Textarea
                    value={editingTestimonial.contentCs}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, contentCs: e.target.value })}
                    placeholder="Text reference v češtině"
                    rows={6}
                  />
                </div>
              </div>

              {/* Project ID (optional) */}
              <div>
                <Label>Related Project (optional)</Label>
                <Select
                  value={editingTestimonial.projectId || 'none'}
                  onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, projectId: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
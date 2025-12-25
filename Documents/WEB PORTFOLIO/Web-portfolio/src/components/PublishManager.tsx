import { useState, useEffect } from "react";
import { Upload, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw, MessageSquare, Trophy, Folder } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface PublishStatus {
  projects: {
    total: number;
    published: number;
    drafts: number;
    draftItems: {
      id: string;
      title: string;
      titleCs?: string;
      updatedAt: number;
    }[];
  };
  testimonials: {
    total: number;
    published: number;
    drafts: number;
    draftItems: {
      id: string;
      name: string;
      company: string;
      updatedAt?: number;
    }[];
  };
  achievements: {
    total: number;
    published: number;
    drafts: number;
    draftItems: {
      id: string;
      title: string;
      type: string;
      updatedAt?: number;
    }[];
  };
}

interface PublishManagerProps {
  token: string;
}

export function PublishManager({ token }: PublishManagerProps) {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'projects' | 'testimonials' | 'achievements' | null>(null);

  useEffect(() => {
    loadPublishStatus();
  }, []);

  const loadPublishStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/publish-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load publish status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error loading publish status:', error);
      toast.error('Failed to load publish status');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAll = async (type: 'projects' | 'testimonials' | 'achievements') => {
    if (!status || status[type].drafts === 0) {
      toast.info(`No ${type} drafts to publish`);
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/${type}/publish-all-drafts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to publish ${type} drafts`);
      }

      const data = await response.json();
      toast.success(`Successfully published ${data.updatedCount} ${type}`);
      setShowConfirmDialog(null);
      await loadPublishStatus();
    } catch (error) {
      console.error(`Error publishing ${type} drafts:`, error);
      toast.error(`Failed to publish ${type} drafts`);
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Publish Manager</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Publish Manager</CardTitle>
          <CardDescription>Failed to load status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalDrafts = status.projects.drafts + status.testimonials.drafts + status.achievements.drafts;

  return (
    <>
      <div className="space-y-6">
        {/* Overall Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Publish Manager</CardTitle>
                <CardDescription>Manage published and draft content across all sections</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadPublishStatus} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Items</span>
                </div>
                <p className="text-2xl">
                  {status.projects.total + status.testimonials.total + status.achievements.total}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Published</span>
                </div>
                <p className="text-2xl text-green-700 dark:text-green-400">
                  {status.projects.published + status.testimonials.published + status.achievements.published}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Drafts</span>
                </div>
                <p className="text-2xl text-orange-700 dark:text-orange-400">
                  {totalDrafts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different content types */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Projects
              {status.projects.drafts > 0 && (
                <Badge variant="destructive" className="ml-auto">{status.projects.drafts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Testimonials
              {status.testimonials.drafts > 0 && (
                <Badge variant="destructive" className="ml-auto">{status.testimonials.drafts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
              {status.achievements.drafts > 0 && (
                <Badge variant="destructive" className="ml-auto">{status.achievements.drafts}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 border rounded">
                    <p className="text-2xl">{status.projects.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl text-green-600">{status.projects.published}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-2xl text-orange-600">{status.projects.drafts}</p>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                  </div>
                </div>

                {status.projects.drafts > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Draft Projects</h4>
                      <Button onClick={() => setShowConfirmDialog('projects')} disabled={publishing} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Publish All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {status.projects.draftItems.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{project.title}</h4>
                              {project.titleCs && (
                                <span className="text-sm text-muted-foreground">/ {project.titleCs}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {formatDate(project.updatedAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h4 className="font-medium mb-1">All Projects Published</h4>
                    <p className="text-sm text-muted-foreground">No draft projects</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Testimonials Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 border rounded">
                    <p className="text-2xl">{status.testimonials.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl text-green-600">{status.testimonials.published}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-2xl text-orange-600">{status.testimonials.drafts}</p>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                  </div>
                </div>

                {status.testimonials.drafts > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Draft Testimonials</h4>
                      <Button onClick={() => setShowConfirmDialog('testimonials')} disabled={publishing} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Publish All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {status.testimonials.draftItems.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                            {testimonial.updatedAt && (
                              <p className="text-sm text-muted-foreground">
                                Last updated: {formatDate(testimonial.updatedAt)}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h4 className="font-medium mb-1">All Testimonials Published</h4>
                    <p className="text-sm text-muted-foreground">No draft testimonials</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Achievements Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 border rounded">
                    <p className="text-2xl">{status.achievements.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl text-green-600">{status.achievements.published}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-2xl text-orange-600">{status.achievements.drafts}</p>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                  </div>
                </div>

                {status.achievements.drafts > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Draft Achievements</h4>
                      <Button onClick={() => setShowConfirmDialog('achievements')} disabled={publishing} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Publish All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {status.achievements.draftItems.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <Badge variant="outline" className="text-xs">{achievement.type}</Badge>
                            </div>
                            {achievement.updatedAt && (
                              <p className="text-sm text-muted-foreground">
                                Last updated: {formatDate(achievement.updatedAt)}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h4 className="font-medium mb-1">All Achievements Published</h4>
                    <p className="text-sm text-muted-foreground">No draft achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <CardTitle className="text-base">How Publishing Works</CardTitle>
                <CardDescription className="mt-2 space-y-1 text-sm">
                  <p>• <strong>Draft content</strong> is only visible in the admin panel</p>
                  <p>• <strong>Published content</strong> appears on your public website</p>
                  <p>• Use the Eye/EyeOff button in each manager to control publish status</p>
                  <p>• Click "Publish All" to make all drafts in a section live at once</p>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Dialog open={true} onOpenChange={() => setShowConfirmDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish All {showConfirmDialog}?</DialogTitle>
              <DialogDescription>
                This will publish {status[showConfirmDialog].drafts} draft {showConfirmDialog} and make them visible on your public website.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {showConfirmDialog === 'projects' && status.projects.draftItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item.title}</span>
                  </div>
                ))}
                {showConfirmDialog === 'testimonials' && status.testimonials.draftItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item.name} - {item.company}</span>
                  </div>
                ))}
                {showConfirmDialog === 'achievements' && status.achievements.draftItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item.title} ({item.type})</span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(null)} disabled={publishing}>
                Cancel
              </Button>
              <Button onClick={() => handlePublishAll(showConfirmDialog)} disabled={publishing}>
                {publishing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Publish {status[showConfirmDialog].drafts} {showConfirmDialog}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface FilterOption {
  value: string;
  label: string;
  labelCs: string;
}

interface FilterCategory {
  id: string;
  name: string;
  nameCs: string;
  options: FilterOption[];
}

interface FiltersManagerProps {
  token: string;
  onFiltersUpdated?: () => void;
}

export function FiltersManager({ token, onFiltersUpdated }: FiltersManagerProps) {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newOption, setNewOption] = useState({ value: '', label: '', labelCs: '' });
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', nameCs: '' });

  // Default categories
  const defaultCategories: FilterCategory[] = [
    {
      id: 'materials',
      name: 'Materials',
      nameCs: 'Materiály',
      options: [
        { value: 'PLA', label: 'PLA', labelCs: 'PLA' },
        { value: 'PETG', label: 'PETG', labelCs: 'PETG' },
        { value: 'ASA', label: 'ASA', labelCs: 'ASA' },
        { value: 'ABS', label: 'ABS', labelCs: 'ABS' },
        { value: 'TPU', label: 'TPU', labelCs: 'TPU' },
        { value: 'Other', label: 'Other', labelCs: 'Jiné' },
      ]
    },
    {
      id: 'printingTech',
      name: 'Printing Technologies',
      nameCs: 'Tiskové technologie',
      options: [
        { value: 'FDM', label: 'FDM (Fused Deposition Modeling)', labelCs: 'FDM (Tisk tavením)' },
        { value: 'SLA', label: 'SLA (Stereolithography)', labelCs: 'SLA (Stereolitografie)' },
        { value: 'SLS', label: 'SLS (Selective Laser Sintering)', labelCs: 'SLS (Selektivní laserové sintrování)' },
      ]
    },
    {
      id: 'projectCategories',
      name: 'Project Categories',
      nameCs: 'Kategorie projektů',
      options: [
        { value: 'Education', label: 'Education', labelCs: 'Vzdělávání' },
        { value: 'Functional Part', label: 'Functional Part', labelCs: 'Funkční díl' },
        { value: 'Product Design', label: 'Product Design', labelCs: 'Produktový design' },
        { value: 'Electronics', label: 'Electronics', labelCs: 'Elektronika' },
        { value: 'Art & Decoration', label: 'Art & Decoration', labelCs: 'Umění & Dekorace' },
        { value: 'Other', label: 'Other', labelCs: 'Jiné' },
      ]
    },
    {
      id: 'designSources',
      name: 'Design Sources',
      nameCs: 'Zdroje designu',
      options: [
        { value: 'My Design', label: 'My Design', labelCs: 'Můj návrh' },
        { value: 'Downloaded Model', label: 'Downloaded Model', labelCs: 'Stažený model' },
        { value: 'Modified Design', label: 'Modified Design', labelCs: 'Upravený design' },
      ]
    },
    {
      id: 'software',
      name: 'Software',
      nameCs: 'Software',
      options: [
        { value: 'Fusion 360', label: 'Fusion 360', labelCs: 'Fusion 360' },
        { value: 'SolidWorks', label: 'SolidWorks', labelCs: 'SolidWorks' },
        { value: 'Blender', label: 'Blender', labelCs: 'Blender' },
        { value: 'Tinkercad', label: 'Tinkercad', labelCs: 'Tinkercad' },
        { value: 'FreeCAD', label: 'FreeCAD', labelCs: 'FreeCAD' },
        { value: 'SketchUp', label: 'SketchUp', labelCs: 'SketchUp' },
        { value: 'Onshape', label: 'Onshape', labelCs: 'Onshape' },
      ]
    }
  ];

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/filters`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.filters && data.filters.length > 0) {
          setCategories(data.filters);
        } else {
          // If no filters exist, use defaults
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error loading filters:', error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const saveFilters = async (updatedCategories: FilterCategory[]) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/filters`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ filters: updatedCategories }),
        }
      );

      if (response.ok) {
        toast.success('Filters saved successfully');
        setCategories(updatedCategories);
        if (onFiltersUpdated) {
          onFiltersUpdated();
        }
      } else {
        toast.error('Failed to save filters');
      }
    } catch (error) {
      console.error('Error saving filters:', error);
      toast.error('Failed to save filters');
    }
  };

  const handleAddOption = (categoryId: string) => {
    if (!newOption.value || !newOption.label || !newOption.labelCs) {
      toast.error('Please fill all fields');
      return;
    }

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        // Check for duplicates
        if (cat.options.some(opt => opt.value === newOption.value)) {
          toast.error('Option already exists');
          return cat;
        }
        return {
          ...cat,
          options: [...cat.options, { ...newOption }]
        };
      }
      return cat;
    });

    saveFilters(updatedCategories);
    setNewOption({ value: '', label: '', labelCs: '' });
    setEditingCategory(null);
  };

  const handleDeleteOption = (categoryId: string, optionValue: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          options: cat.options.filter(opt => opt.value !== optionValue)
        };
      }
      return cat;
    });

    saveFilters(updatedCategories);
  };

  const handleResetToDefaults = () => {
    if (!confirm('Reset all filters to default values? This will remove any custom options.')) return;
    saveFilters(defaultCategories);
  };

  const handleAddNewCategory = () => {
    if (!newCategory.id || !newCategory.name || !newCategory.nameCs) {
      toast.error('Please fill all fields');
      return;
    }

    // Check for duplicate category IDs
    if (categories.some(cat => cat.id === newCategory.id)) {
      toast.error('Category ID already exists');
      return;
    }

    const updatedCategories = [...categories, {
      ...newCategory,
      options: []
    }];

    saveFilters(updatedCategories);
    setAddingNewCategory(false);
    setNewCategory({ id: '', name: '', nameCs: '' });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this entire category? This cannot be undone.')) return;

    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    saveFilters(updatedCategories);
  };

  if (loading) {
    return <div className="py-12 text-center">Loading filters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Filter Options Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage filter options for projects. These will be used in dropdowns when creating/editing projects.
          </p>
        </div>
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {category.name} / {category.nameCs}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Options List */}
              <div className="space-y-2">
                {category.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{option.value}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        EN: {option.label} / CS: {option.labelCs}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteOption(category.id, option.value)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Option */}
              {editingCategory === category.id ? (
                <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                  <div>
                    <Label className="text-xs">Value (ID)</Label>
                    <Input
                      value={newOption.value}
                      onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                      placeholder="e.g., PLA, FDM"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Label (English)</Label>
                    <Input
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                      placeholder="English label"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Label (Czech)</Label>
                    <Input
                      value={newOption.labelCs}
                      onChange={(e) => setNewOption({ ...newOption, labelCs: e.target.value })}
                      placeholder="České označení"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAddOption(category.id)}>
                      Save Option
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewOption({ value: '', label: '', labelCs: '' });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditingCategory(category.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add New Category */}
        {addingNewCategory ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">ID</Label>
                <Input
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                  placeholder="Unique ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Name (English)</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="English name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Name (Czech)</Label>
                <Input
                  value={newCategory.nameCs}
                  onChange={(e) => setNewCategory({ ...newCategory, nameCs: e.target.value })}
                  placeholder="Český název"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddNewCategory}>
                  Save Category
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddingNewCategory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setAddingNewCategory(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
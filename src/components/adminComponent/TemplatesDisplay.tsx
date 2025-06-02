
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";;
import { format } from "date-fns";
import {
  Search,
  // MoreVertical,
  Eye,
  FileText,
  Calendar,
  Users,
  Filter,
  Download,
  Settings,
  BookOpen,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface TemplateField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'textarea' | 'select' | 'date' | 'file' | 'number';
  isRequired: boolean;
  options?: string[];
}

interface TemplateGroup {
  groupName: string;
  fields: TemplateField[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  templateType: 'general' | 'subject';
  dynamicSchema: {
    groups: TemplateGroup[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  usageCount?: number;
}

const AdminTemplatesDashboard: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'general' | 'subject'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/log-book-template');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setFilteredTemplates(data);
          
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = templates;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(template => template.templateType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, filterType]);

  // const handleDeleteTemplate = async (templateId: string) => {
  //   try {
  //     const response = await fetch(`/api/admin/templates/${templateId}`, {
  //       method: 'DELETE',
  //     });
      
  //     if (response.ok) {
  //       setTemplates(prev => prev.filter(t => t.id !== templateId));
  //     }
  //   } catch (error) {
  //     console.error('Failed to delete template:', error);
  //   }
  // };

  // const handleToggleActive = async (templateId: string, isActive: boolean) => {
  //   try {
  //     const response = await fetch(`/api/admin/templates/${templateId}`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ isActive: !isActive }),
  //     });
      
  //     if (response.ok) {
  //       setTemplates(prev => 
  //         prev.map(t => 
  //           t.id === templateId ? { ...t, isActive: !isActive } : t
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Failed to toggle template status:', error);
  //   }
  // };

  // const handleDuplicateTemplate = async (template: Template) => {
  //   try {
  //     const response = await fetch('/api/log-book-template', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: `${template.name} (Copy)`,
  //         description: `${template.description} (Duplicated)`,
  //         templateType: template.templateType,
  //         dynamicSchema: template.dynamicSchema,
  //       }),
  //     });
      
  //     if (response.ok) {
  //       const newTemplate = await response.json();
  //       setTemplates(prev => [newTemplate, ...prev]);
  //     }
  //   } catch (error) {
  //     console.error('Failed to duplicate template:', error);
  //   }
  // };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return <FileText className="h-3 w-3" />;
      case 'textarea':
        return <BookOpen className="h-3 w-3" />;
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'file':
        return <Download className="h-3 w-3" />;
      case 'select':
        return <Filter className="h-3 w-3" />;
      case 'number':
        return <Settings className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTotalFields = (template: Template) => {
    return template.dynamicSchema.groups.reduce((total, group) => total + group.fields.length, 0);
  };

  const getRequiredFields = (template: Template) => {
    return template.dynamicSchema.groups.reduce((total, group) => 
      total + group.fields.filter(field => field.isRequired).length, 0
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground">
            Manage and organize logbook templates for your institution
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">General Templates</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.templateType === 'general').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject Templates</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.templateType === 'subject').length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates, descriptions, or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterType === 'general' ? 'default' : 'outline'}
                onClick={() => setFilterType('general')}
                size="sm"
              >
                General
              </Button>
              <Button
                variant={filterType === 'subject' ? 'default' : 'outline'}
                onClick={() => setFilterType('subject')}
                size="sm"
              >
                Subject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new template.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fields</TableHead>
                    {/* <TableHead>Creator</TableHead> */}
                    <TableHead>Created</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    {/* <TableHead>Usage</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {template.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.templateType === 'general' ? 'default' : 'secondary'}>
                          {template.templateType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{getTotalFields(template)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({getRequiredFields(template)} required)
                          </span>
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <div>
                          <div className="text-sm font-medium">{template.createdBy.name}</div>
                          <div className="text-xs text-muted-foreground">{template.createdBy.email}</div>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(template.createdAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Details Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="mt-1">
                    <Badge variant={selectedTemplate.templateType === 'general' ? 'default' : 'secondary'}>
                      {selectedTemplate.templateType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <div className="mt-1 text-sm">
                    {format(new Date(selectedTemplate.createdAt), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {/* Fields Structure */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Template Structure</h3>
                <div className="space-y-4">
                  {selectedTemplate.dynamicSchema.groups.map((group, groupIndex) => (
                    <Card key={groupIndex}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{group.groupName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                {getFieldTypeIcon(field.fieldType)}
                                <div>
                                  <div className="font-medium text-sm">{field.fieldLabel}</div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {field.fieldType}
                                  </div>
                                </div>
                              </div>
                              {field.isRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemplatesDashboard;
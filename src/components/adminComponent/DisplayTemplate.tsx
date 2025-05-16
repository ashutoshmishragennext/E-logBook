"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit, Ellipsis, FileEdit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define template types
interface Template {
  id: string;
  name: string;
  description?: string;
  templateType: "general" | "subject";
  createdAt: string;
  updatedAt: string;
}

interface SubjectTemplate extends Template {
  templateType: "subject";
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
}

interface GeneralTemplate extends Template {
  templateType: "general";
}

export default function TemplatesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [generalTemplates, setGeneralTemplates] = useState<GeneralTemplate[]>([]);
  const [subjectTemplates, setSubjectTemplates] = useState<SubjectTemplate[]>([]);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        
        // Fetch general templates
        const generalRes = await fetch(`/api/log-book-template?type=general`);
        
        // Fetch subject templates with subject details
        const subjectRes = await fetch(`/api/log-book-template?type=subject&includeSubjects=true`);
        
        if (!generalRes.ok || !subjectRes.ok) {
          throw new Error("Failed to fetch templates");
        }
        
        const generalData = await generalRes.json();
        const subjectData = await subjectRes.json();
        
        setGeneralTemplates(generalData);
        setSubjectTemplates(subjectData);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle template deletion
  const handleDeleteTemplate = async (id: string) => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/log-book-template/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Update state by removing the deleted template
      setGeneralTemplates(prev => prev.filter(template => template.id !== id));
      setSubjectTemplates(prev => prev.filter(template => template.id !== id));
      
      toast.success("Template deleted successfully");
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  // Create New Template button handlers
  const handleCreateGeneralTemplate = () => {
    router.push("/templates/general/create");
  };

  const handleCreateSubjectTemplate = () => {
    router.push("/templates/subject/create");
  };

  // Edit Template handler
  const handleEditTemplate = (template: Template) => {
    if (template.templateType === "general") {
      router.push(`/templates/general/edit/${template.id}`);
    } else {
      router.push(`/templates/subject/edit/${template.id}`);
    }
  };

  // Generate skeleton loading UI
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={`skeleton-${i}`} className="bg-muted/30">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
        <CardFooter>
          <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
        </CardFooter>
      </Card>
    ));
  };

  // Render template cards
  const renderTemplateCards = (templates: Template[]) => {
    if (templates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-muted-foreground mb-4">No templates found</div>
          <Button 
            onClick={() => 
              activeTab === "general" 
                ? handleCreateGeneralTemplate() 
                : handleCreateSubjectTemplate()
            }
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create {activeTab === "general" ? "General" : "Subject"} Template
          </Button>
        </div>
      );
    }

    return templates.map((template) => (
      <Card key={template.id} className="transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setTemplateToDelete(template.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="line-clamp-2">
            {template.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.templateType === "subject" && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Subject:</span>{" "}
              {(template as SubjectTemplate).subjectName} ({(template as SubjectTemplate).subjectCode})
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(template.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2"
            onClick={() => handleEditTemplate(template)}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setTemplateToDelete(template.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <div className="flex space-x-2">
          <Button onClick={handleCreateGeneralTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New General Template
          </Button>
          <Button onClick={handleCreateSubjectTemplate} variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            New Subject Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="general">General Templates</TabsTrigger>
          <TabsTrigger value="subject">Subject Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? renderSkeletons() : renderTemplateCards(generalTemplates)}
          </div>
        </TabsContent>
        
        <TabsContent value="subject">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? renderSkeletons() : renderTemplateCards(subjectTemplates)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTemplateToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
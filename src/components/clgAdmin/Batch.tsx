"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/auth";
import { useCollegeStore } from "@/store/college";
import { useBatchStore } from "@/store/batch";
import { useAcademicYearStore } from "@/store/academicYear";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface Batch {
  id: string;
  name: string;
}
const Batch = () => {
  const user = useCurrentUser();
  const userId = user?.id;

  const { college, fetchCollegeDetail } = useCollegeStore();
  const { batches, loading, error, fetchBatches, createBatch, updateBatch, deleteBatch } = useBatchStore();
  const { years: academicYears, fetchYears } = useAcademicYearStore();

  const [collegeId, setCollegeId] = useState<string>();
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [newBatchName, setNewBatchName] = useState("");
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchCollegeDetail(userId);
  }, [userId, fetchCollegeDetail]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  useEffect(() => {
    if (college?.id) {
      setCollegeId(college.id);
    }
  }, [college]);

  useEffect(() => {
    if (collegeId && academicYearId) {
      fetchBatches(collegeId, academicYearId);
    }
  }, [collegeId, academicYearId, fetchBatches]);

  const handleAdd = async () => {
    if (!newBatchName.trim() || !collegeId || !academicYearId) return;
    await createBatch({ name: newBatchName, collegeId, academicYearId });
    setNewBatchName("");
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async () => {
    if (!editBatchId || !editName.trim()) return;
    await updateBatch(editBatchId, { name: editName });
    setEditBatchId(null);
    setEditName("");
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (batchToDelete) {
      await deleteBatch(batchToDelete);
      setBatchToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  const openEditDialog = (batch: Batch) => {
    setEditBatchId(batch.id);
    setEditName(batch.name);
    setIsEditDialogOpen(true);
  };
  const openDeleteDialog = (batchId: React.SetStateAction<string | null>) => {
    setBatchToDelete(batchId);
    setIsDeleteDialogOpen(true);
  };

  const selectedYear = academicYears.find(year => year.id === academicYearId)?.name;

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl">Batch Manager</CardTitle>
          <CardDescription>
            Manage your batches for different academic years
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="w-1/3">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select 
                value={academicYearId} 
                onValueChange={setAcademicYearId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              disabled={!academicYearId}
              className="flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add New Batch
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : academicYearId && batches.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4/5">Batch Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(batch)}
                            className="h-8 px-2 text-blue-600"
                          >
                            <Pencil size={16} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(batch.id)}
                            className="h-8 px-2 text-red-600"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : academicYearId ? (
            <div className="text-center py-8 text-gray-500">
              No batches found for {selectedYear}. Add your first batch!
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Please select an academic year to manage batches
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Batch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
            <DialogDescription>
              Create a new batch for {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="batchName">Batch Name</Label>
            <Input
              id="batchName"
              placeholder="Enter batch name"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update the batch name
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editBatchName">Batch Name</Label>
            <Input
              id="editBatchName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Batch;
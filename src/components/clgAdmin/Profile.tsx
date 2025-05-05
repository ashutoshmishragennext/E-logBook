import { useCurrentUser } from '@/hooks/auth'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface College {
  id: string;
  userId: string;
  name: string;
  code: string;
  address: string;
  country: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logo: string;
}

const Profile = () => {
  const user = useCurrentUser()
  const userId = user?.id
  const [college, setCollege] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCollegeDetail = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/college?collegeAdminId=${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCollege(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching college details:", error);
      setError("Failed to fetch college details. Please try again later.");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollegeDetail()
  }, [userId])

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {college.map((clg) => (
        <Card key={clg.id} className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-4">
              <img src={clg.logo} alt={clg.name} className="w-12 h-12 rounded-full object-cover" />
              {clg.name} ({clg.code})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Address:</strong> {clg.address}, {clg.city}, {clg.state}, {clg.country}</p>
            <p><strong>Phone:</strong> {clg.phone}</p>
            <p><strong>Email:</strong> {clg.email}</p>
            <p><strong>Website:</strong> <a href={clg.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{clg.website}</a></p>
            <p><strong>Description:</strong> {clg.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default Profile

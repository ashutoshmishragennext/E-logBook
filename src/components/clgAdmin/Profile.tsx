/* eslint-disable react-hooks/exhaustive-deps*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/auth";
import { useCollegeStore } from "@/store/college";
import Image from "next/image";
import { useEffect } from "react";



const Profile = () => {
  const user = useCurrentUser();
  const userId = user?.id;

  const { college, fetchCollegeDetail } = useCollegeStore();

  useEffect(() => {
    fetchCollegeDetail(userId!);
  }, [userId]);

  // if (loading) {
  //   return (
  //     <div className="p-6">
  //       <Skeleton className="h-8 w-1/2 mb-4" />
  //       <Skeleton className="h-6 w-full mb-2" />
  //       <Skeleton className="h-6 w-full mb-2" />
  //       <Skeleton className="h-6 w-full mb-2" />
  //     </div>
  //   )
  // }

  // if (error) {
  //   return <div className="text-red-500 p-4">{error}</div>
  // }

  return (
    <div className="p-6 space-y-6">
      {college && (
        <Card className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-4">
              <Image
                width={48}
                height={48}
                src={college.logo}
                alt={college.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {college.name} ({college.code})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Address:</strong> {college.address}, {college.city},{" "}
              {college.state}, {college.country}
            </p>
            <p>
              <strong>Phone:</strong> {college.phone}
            </p>
            <p>
              <strong>Email:</strong> {college.email}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {college.website}
              </a>
            </p>
            <p>
              <strong>Description:</strong> {college.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;

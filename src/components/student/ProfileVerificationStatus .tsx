import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ProfileVerificationStatusProps {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export default function ProfileVerificationStatus({ status }: ProfileVerificationStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: "Profile Approved",
          message: "Your profile has been verified and approved. You can now access the log book entries.",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: "Profile Rejected",
          message: "Your profile verification was rejected. Please update your profile with the correct information and submit again for review.",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case 'PENDING':
      default:
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: "Verification Pending",
          message: "Your profile is currently under review. This process usually takes 1-2 business days. You'll be able to access log book entries once your profile is approved.",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className={`shadow-sm ${statusInfo.bgColor} border-l-4 ${status === 'APPROVED' ? 'border-l-green-500' : status === 'REJECTED' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
        <CardHeader>
          <CardTitle className={`text-xl font-bold ${statusInfo.color} flex items-center gap-2`}>
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div>
              <p className="text-gray-700">{statusInfo.message}</p>
              
              {status === 'PENDING' && (
                <div className="mt-6 bg-white p-4 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Your profile will be reviewed by an administrator</li>
                    <li>You will receive notification when your profile status changes</li>
                    <li>Once approved, you will gain access to log book entry features</li>
                  </ul>
                </div>
              )}
              
              {status === 'REJECTED' && (
                <div className="mt-6 bg-white p-4 rounded-lg border border-red-200">
                  <h3 className="font-medium text-gray-800 mb-2">Common reasons for rejection:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Missing or incomplete information</li>
                    <li>Invalid college ID proof</li>
                    <li>Mismatch between provided information and records</li>
                    <li>Please check your email for specific feedback</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
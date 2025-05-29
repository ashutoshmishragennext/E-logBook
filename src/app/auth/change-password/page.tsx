'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PasswordChangeScreen from '@/components/auth/ChangePassword';

function PasswordChangeContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const isFirstTime = searchParams.get('firstTime') === 'true';

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600">User ID is required.</p>
        </div>
      </div>
    );
  }

  return (
    <PasswordChangeScreen 
      userId={userId} 
      isFirstTime={isFirstTime}
    />
  );
}

export default function PasswordChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PasswordChangeContent />
    </Suspense>
  );
}
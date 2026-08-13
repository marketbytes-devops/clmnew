'use client';

import React, { Suspense } from 'react';
import RequestWizard from '../../../components/ui/requestor/RequestWizard';

function CreateRequestContent() {
  return <RequestWizard />;
}

export default function CreateRequestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Request Wizard...</div>}>
      <CreateRequestContent />
    </Suspense>
  );
}

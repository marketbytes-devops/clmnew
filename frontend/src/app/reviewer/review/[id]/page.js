"use client";
import React, { use } from 'react';
import ReviewStudio from '../../../../components/ui/reviewer/ReviewStudio';

export default function ReviewStudioPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return <ReviewStudio id={id} />;
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import ClientPortalView from "@/components/ui/client/ClientPortalView";
import PasscodeModal from "@/components/ui/client/PasscodeModal";
import InvalidTokenView from "@/components/ui/client/InvalidTokenView";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ClientPortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "clm_invite_token_demo_2026_acme_corp";

  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [passcodeError, setPasscodeError] = useState(null);

  const [isSubmittingRedlines, setIsSubmittingRedlines] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const fetchContractData = async (passcodeVal = null) => {
    setIsLoading(true);
    setErrorDetail(null);
    try {
      let url = `${API_BASE_URL}/api/client/contract?token=${encodeURIComponent(token)}`;
      if (passcodeVal) {
        url += `&passcode=${encodeURIComponent(passcodeVal)}`;
      }

      const res = await axios.get(url);
      setContractData(res.data);
      setPasscodeError(null);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to load client proposal link.";
      if (passcodeVal) {
        setPasscodeError("Incorrect passcode. Please try again.");
      } else {
        setErrorDetail(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContractData();
    } else {
      setErrorDetail("Missing required portal invite token parameter.");
      setIsLoading(false);
    }
  }, [token]);

  const handlePasscodeSubmit = (passcodeVal) => {
    fetchContractData(passcodeVal);
  };

  const handleRedlinesSubmit = async (data) => {
    setIsSubmittingRedlines(true);
    try {
      await axios.post(`${API_BASE_URL}/api/client/redline`, {
        token,
        submission_note: data.submission_note,
        redlines: data.redlines
      });
      // Refresh contract data after submitting redlines
      await fetchContractData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit redlines.");
    } finally {
      setIsSubmittingRedlines(false);
    }
  };

  const handleSignSubmit = async (sigData) => {
    setIsSigning(true);
    try {
      await axios.post(`${API_BASE_URL}/api/client/sign`, {
        token,
        signer_name: sigData.signer_name,
        signer_title: sigData.signer_title,
        signature_data: sigData.signature_data
      });
      // Refresh contract data after signing
      await fetchContractData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to sign contract.");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Validating Cryptographic Portal Link...</p>
      </div>
    );
  }

  if (errorDetail) {
    return <InvalidTokenView errorDetail={errorDetail} onRetry={() => fetchContractData()} />;
  }

  if (contractData?.has_passcode && !contractData?.is_passcode_verified) {
    return (
      <PasscodeModal
        clientName={contractData.client_name}
        onSubmit={handlePasscodeSubmit}
        isLoading={isLoading}
        error={passcodeError}
      />
    );
  }

  return (
    <ClientPortalView
      contract={contractData}
      token={token}
      onRedlinesSubmit={handleRedlinesSubmit}
      onSignSubmit={handleSignSubmit}
      isSubmitting={isSubmittingRedlines}
      isSigning={isSigning}
    />
  );
}

export default function ClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading Client Portal...
        </div>
      }
    >
      <ClientPortalContent />
    </Suspense>
  );
}

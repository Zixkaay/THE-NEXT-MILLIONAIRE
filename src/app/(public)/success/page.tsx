'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Award, Sparkles, Phone, Mail, User, Bookmark, Download } from 'lucide-react';
import Image from 'next/image';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || '';

  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'pending' | 'failed'>('pending');
  const [participant, setParticipant] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setVerificationStatus('failed');
      setErrorMessage('No transaction reference was provided in the URL redirect.');
      return;
    }

    let pollCount = 0;
    const maxPolls = 6;
    let timeoutId: NodeJS.Timeout;

    const verifyTransaction = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${encodeURIComponent(reference)}`);
        const data = await response.json();

        if (response.ok && data.success) {
          if (data.status === 'success') {
            setVerificationStatus('success');
            setParticipant(data.participant);
            setPayment(data.payment);
            setProfilePhoto(data.profilePhoto);
            setLoading(false);
            return;
          } else if (data.status === 'failed') {
            setVerificationStatus('failed');
            setErrorMessage('Your payment transaction was declined or failed.');
            setLoading(false);
            return;
          }
        }

        // Poll if still pending
        pollCount++;
        if (pollCount < maxPolls) {
          timeoutId = setTimeout(verifyTransaction, 2500);
        } else {
          setVerificationStatus('pending');
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to verify payment client-side:', err);
        setVerificationStatus('failed');
        setErrorMessage('Failed to connect to our secure validation servers.');
        setLoading(false);
      }
    };

    verifyTransaction();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="verifying-loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 p-10 rounded-3xl border border-white/5 text-center space-y-6 shadow-2xl"
              id="success-loading-container"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Verifying Transaction</h2>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Validating your secure payment with Paystack servers... please hold.
                </p>
              </div>
            </motion.div>
          ) : verificationStatus === 'success' ? (
            <motion.div
              key="verification-success"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              id="success-verification-card"
            >
              {/* Premium Card Display container */}
              <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header */}
                <div className="text-center space-y-3 pb-6 border-b border-white/5">
                  <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-full mb-1">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                    Payment Verified Successfully <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </h1>
                  <p className="text-sm text-gray-400">
                    Welcome to the Next Billionaire Path tournament!
                  </p>
                </div>

                {/* Profile Photo and Participant ID Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-zinc-900/60 rounded-2xl border border-white/5">
                  {profilePhoto ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-500 bg-zinc-850 flex-shrink-0">
                      <Image
                        src={profilePhoto}
                        alt="Profile Photo"
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-500/20 to-zinc-900 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Award className="w-10 h-10 text-amber-500" />
                    </div>
                  )}

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <div className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold flex items-center justify-center sm:justify-start gap-1">
                      <Bookmark className="w-3.5 h-3.5" /> CERTIFIED CONTESTANT ID
                    </div>
                    <div className="text-3xl font-black text-white tracking-widest font-mono">
                      {participant?.id || 'NBP-PENDING'}
                    </div>
                    <p className="text-sm font-semibold text-gray-300">
                      {participant?.full_name || 'Anonymous Contestant'}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500/80" /> Whitelisted Email
                    </span>
                    <span className="text-white font-medium truncate max-w-[250px]">{payment?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500/80" /> Onboarding Status
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 uppercase text-xs tracking-wider bg-emerald-400/10 px-2.5 py-0.5 rounded-full">
                      Paid & Accredited
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500/80" /> Ticket Signature Ref
                    </span>
                    <span className="text-xs text-gray-400 font-mono select-all truncate max-w-[200px]">{reference}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500/80" /> Registration Fee
                    </span>
                    <span className="text-amber-500 font-extrabold font-mono">GHS {parseFloat(payment?.amount || '150').toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 text-xs text-gray-400/90 leading-relaxed text-center">
                  Your registration record is successfully processed and saved. Log in details are not required as contestants do not access dashboards. All contest updates will be delivered to your contact channels.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    if (reference) {
                      window.location.href = `/api/pdf/registration?reference=${encodeURIComponent(reference)}`;
                    } else if (participant?.id) {
                      window.location.href = `/api/pdf/registration?participantId=${encodeURIComponent(participant.id)}`;
                    }
                  }}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" /> Download Entry Pass PDF
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  Return to Home <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verification-failed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 p-8 rounded-3xl border border-red-500/20 text-center space-y-6 shadow-2xl"
              id="success-verification-failed"
            >
              <div className="inline-flex p-3 bg-red-500/10 text-red-500 rounded-full">
                <XCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Verification Holding or Failed</h1>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {errorMessage || 'We were unable to complete the transaction audit cycle with Paystack.'}
                </p>
              </div>

              <div className="text-xs text-gray-500 font-mono bg-zinc-900/60 py-2.5 p-4 rounded-xl border border-white/5 inline-block select-all">
                Ref: {reference || 'UNKNOWN-REF'}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full h-11 bg-white hover:bg-white/90 text-black font-semibold text-sm rounded-xl transition-all duration-200"
                >
                  Retry Verification
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-white text-sm rounded-xl transition-all"
                >
                  Back to Registration
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm font-mono animate-pulse">
        Loading success workflow...
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

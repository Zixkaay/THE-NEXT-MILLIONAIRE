'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

function SimulateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref = searchParams.get('ref') || searchParams.get('reference') || 'NBP-SIM-' + Math.floor(1000 + Math.random() * 9000);
  const email = searchParams.get('email') || 'test@example.com';
  const amountGHC = searchParams.get('amountGHC') || '150.00';
  const metadataStr = searchParams.get('metadata') || '';

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Give a realistic banking delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!success) {
      setStatus('failed');
      setIsProcessing(false);
      return;
    }

    try {
      // Decode or reconstruct metadata
      let parsedMetadata = {};
      if (metadataStr) {
        try {
          parsedMetadata = JSON.parse(decodeURIComponent(metadataStr));
        } catch (e) {
          console.error('Failed to parse simulation metadata parameter', e);
        }
      } else {
        parsedMetadata = {
          type: 'registration',
          fullName: 'Test Participant',
          email,
          answers: {
            full_name: 'Test Participant',
            email,
          }
        };
      }

      // Replicate the official Paystack charge.success webhook payload
      const webhookPayload = {
        event: 'charge.success',
        data: {
          reference: ref,
          amount: Math.round(parseFloat(amountGHC) * 100),
          status: 'success',
          customer: { email },
          metadata: parsedMetadata,
        },
      };

      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Webhook failed to process transaction');
      }

      setStatus('success');
      // Redirect to the success page with reference
      setTimeout(() => {
        router.push(`/success?reference=${decodeURIComponent(ref)}`);
      }, 1000);
    } catch (err: any) {
      console.error('[Simulator Exception]:', err);
      setErrorMsg(err?.message || 'Failed to sync payment with secure webhook.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" id="paystack-simulation-container">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold flex items-center gap-1.5 mb-1 bg-amber-500/10 w-max px-2.5 py-0.5 rounded-full">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> SIMULATION ENVIRONMENT
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Paystack Simulator</h1>
          </div>
          <CreditCard className="w-10 h-10 text-white/20" />
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Total Charged Amount</span>
              <span className="text-lg font-extrabold text-amber-500 font-mono">GHS {parseFloat(amountGHC).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Registered Email</span>
              <span className="text-white truncate max-w-[200px]">{email}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Bill Signature Ref</span>
              <span className="text-xs text-gray-400 font-mono select-all truncate max-w-[180px]">{ref}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Channel Security</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs py-0.5 px-2 bg-emerald-400/10 rounded-full">Secure SSL Bypass</span>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-yellow-500/10 text-xs text-amber-400/80 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <p>
              This is a sandbox billing simulator that bypasses live Paystack API processing. 
              Clicking approve authorizes a simulated webhook request, mimicking a real server callback.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center space-y-1"
            >
              <CheckCircle2 className="w-8 h-8 mx-auto mb-1 animate-bounce" />
              <p className="font-bold text-sm">Transaction Authorized</p>
              <p className="text-xs opacity-80">Finalizing registration certificate...</p>
            </motion.div>
          ) : (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="approve-payment-simulator-btn"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(true)}
                className="w-full h-11 bg-white hover:bg-white/90 disabled:bg-white/40 text-black font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Approve Simulation Payment <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                id="decline-payment-simulator-btn"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(false)}
                className="w-full h-10 bg-transparent hover:bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-medium rounded-xl transition-all duration-200"
              >
                Simulate Declined Card
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function SimulatePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm font-mono">
        <div className="animate-pulse">Loading simulation environment...</div>
      </div>
    }>
      <SimulateContent />
    </Suspense>
  );
}

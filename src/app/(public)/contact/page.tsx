'use client';

import React from 'react';
import ContactForm from '../../../../features/contact/components/ContactForm';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-bg min-h-screen pt-40 md:pt-48 pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#d4af37] font-bold text-sm tracking-[0.4em] uppercase mb-4">Official Channels</p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
            Get in <span className="text-[#d4af37]">Touch</span>
          </h1>
          <p className="text-[#A3A3A3] text-lg max-w-2xl mx-auto font-light leading-relaxed">
            For inquiries, partnerships, or assistance regarding auditions and voting, reach out through our official channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Channels Section */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
                    <MapPin className="text-[#A3A3A3] group-hover:text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">Location</p>
                    <p className="text-white text-lg font-medium">Accra, Ghana & New York, USA</p>
                  </div>
                </div>
                <a href="https://wa.me/233549834747" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#22c55e] transition-colors">
                    <MessageCircle className="text-[#A3A3A3] group-hover:text-[#22c55e]" />
                  </div>
                  <div>
                    <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">WhatsApp Support</p>
                    <p className="text-white text-lg font-medium">+233 54 983 4747</p>
                  </div>
                </a>
                <a href="mailto:contact@nextbillionairepath.com" className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
                    <Mail className="text-[#A3A3A3] group-hover:text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-[0.2em]">Email</p>
                    <p className="text-white text-lg font-medium">contact@nextbillionairepath.com</p>
                  </div>
                </a>
            </div>
          </div>

          {/* Form Section */}
          <ContactForm />

        </div>
      </div>
    </div>
  );
}

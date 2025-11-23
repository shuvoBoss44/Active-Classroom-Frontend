// src/components/home/Contact.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Youtube, Send, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ContactDetail = ({ Icon, title, value, href, isLink = true }) => (
  <div className="flex items-start gap-4 group">
    <div className="p-3 bg-white/10 rounded-xl shadow-sm backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-emerald-100 tracking-wide uppercase mb-1">
        {title}
      </h3>
      {isLink ? (
        <a
          href={href}
          className="text-lg font-bold text-white hover:text-emerald-200 transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-lg font-bold text-white">{value}</p>
      )}
    </div>
  </div>
);

export default function Contact({ email, phone, address, social }) {
  const defaultSocial = social || { facebook: "#", youtube: "#" };
  const defaultAddress = address || "Dhaka, Bangladesh";
  const defaultEmail = email || "chakmashuvo2016@gmail.com";
  const defaultPhone = phone || "+880 1625490792";

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', message: data.message || 'Message sent! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send message.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-gray-200/50">
          
          {/* Left Panel: Info */}
          <div className="lg:col-span-2 bg-gray-900 relative p-6 md:p-10 lg:p-12 text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-black mb-4">Get in Touch</h2>
                <p className="text-gray-400 mb-12 leading-relaxed">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>

                <div className="space-y-8">
                  <ContactDetail
                    Icon={Mail}
                    title="Email Us"
                    value={defaultEmail}
                    href={`mailto:${defaultEmail}`}
                  />
                  <ContactDetail
                    Icon={Phone}
                    title="Call Us"
                    value={defaultPhone}
                    href={`tel:${defaultPhone.replace(/\s/g, "")}`}
                  />
                  <ContactDetail
                    Icon={MapPin}
                    title="Visit Us"
                    value={defaultAddress}
                    isLink={false}
                  />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Follow Us
                </p>
                <div className="flex gap-4">
                  {defaultSocial.facebook && (
                    <Link
                      href={defaultSocial.facebook}
                      target="_blank"
                      className="p-3 bg-white/5 rounded-full hover:bg-emerald-600 hover:text-white transition-all duration-300"
                    >
                      <Facebook className="h-5 w-5" />
                    </Link>
                  )}
                  {defaultSocial.youtube && (
                    <Link
                      href={defaultSocial.youtube}
                      target="_blank"
                      className="p-3 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      <Youtube className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:col-span-3 p-6 md:p-10 lg:p-16 bg-white">
            <div className="max-w-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h3>
              <p className="text-gray-500 mb-8">
                We usually respond within 24 hours.
              </p>

              {/* Status Message */}
              {status && (
                <div className={`mb-6 p-4 rounded-xl ${
                  status.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us more about your inquiry..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

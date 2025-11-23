"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, Trash2, Tag, Calendar, Percent, ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function CouponsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: 10,
    validUntil: "",
    maxUses: 100
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.isAdmin) {
        router.push("/admin");
        return;
      }
      fetchCoupons();
    }
  }, [user, authLoading]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data.coupons);
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCoupons([data.data.coupon, ...coupons]);
        setShowCreateModal(false);
        setFormData({ code: "", discountPercentage: 10, validUntil: "", maxUses: 100 });
      } else {
        setError(data.message || "Failed to create coupon");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${couponId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (res.ok) {
        setCoupons(coupons.filter(c => c._id !== couponId));
      }
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Coupon Management</h1>
              <p className="text-gray-500 mt-1">Create and manage discount codes.</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Coupon
          </Button>
        </div>

        {/* Coupon List */}
        {coupons.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Coupons Found</h3>
            <p className="text-gray-500 mb-6">Create your first discount code to boost sales.</p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
              Create Coupon
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{coupon.code}</h3>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Percent className="w-4 h-4" /> Discount
                    </span>
                    <span className="font-bold text-gray-900">{coupon.discountPercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Expires
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Uses Left</span>
                    <span className="font-medium text-gray-900">{coupon.maxUses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Create New Coupon</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none font-mono font-bold"
                    placeholder="e.g. SUMMER2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Discount (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({...formData, discountPercentage: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Max Uses</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Coupon"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// src/components/home/AboutUs.jsx
"use client";
import { Users, Lightbulb, TrendingUp, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const ValueBox = ({ Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", color.bg)}>
      <Icon className={cn("h-6 w-6", color.text)} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function AboutUs({ content }) {
  const htmlContent = content?.replace(/\n/g, "<br/>") || "Loading...";

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">
                About Us
              </span>
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Building the <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                  Future of Education
                </span>
              </h2>
              
              <div
                className="prose prose-lg text-gray-600 mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              <div className="space-y-2">
                <ValueBox
                  Icon={Lightbulb}
                  title="Innovation First"
                  description="Continuously evolving our curriculum with cutting-edge technology."
                  color={{ bg: "bg-amber-100", text: "text-amber-600" }}
                  delay={0.1}
                />
                <ValueBox
                  Icon={Users}
                  title="Global Accessibility"
                  description="Making top-tier education affordable for every student."
                  color={{ bg: "bg-blue-100", text: "text-blue-600" }}
                  delay={0.2}
                />
                <ValueBox
                  Icon={Heart}
                  title="Unwavering Integrity"
                  description="Upholding the highest standards in teaching and ethics."
                  color={{ bg: "bg-rose-100", text: "text-rose-600" }}
                  delay={0.3}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visuals */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative z-10"
            >
              <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-2xl">
                {/* Abstract Pattern Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                
                {/* Central Graphic */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                      <TrendingUp className="w-full h-full text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 bg-white/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-white/50 shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-gray-900">90% Success Rate</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Our graduates secure top positions within 6 months.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Decorative Blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

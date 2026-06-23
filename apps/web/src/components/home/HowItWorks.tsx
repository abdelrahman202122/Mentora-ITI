"use client";

import { motion } from "framer-motion";
import { Search, MessageSquare, Calendar } from "lucide-react";

const steps = [
  {
    title: "1. Search",
    description: "Browse through thousands of verified teachers by subject, price, and availability.",
    icon: Search,
  },
  {
    title: "2. Chat",
    description: "Send a message to your preferred teacher to discuss your specific learning needs.",
    icon: MessageSquare,
  },
  {
    title: "3. Book",
    description: "Schedule your session at a time that works for you and pay securely on the platform.",
    icon: Calendar,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">How it Works</h2>
        <p className="text-slate-600 mb-16">Start your learning journey in three simple steps.</p>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* خط وهمي يصل بين الأيقونات في الشاشات الكبيرة */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                <step.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
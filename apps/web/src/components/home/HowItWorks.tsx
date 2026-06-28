"use client";

import { motion } from "framer-motion";
import { Search, MessageSquare, Calendar } from "lucide-react";

const steps = [
  {
    title: "1. Find a tutor",
    description: "Search verified tutors by subject, level, price, language, and availability.",
    icon: Search,
  },
  {
    title: "2. Message your match",
    description: "Ask questions, share your learning goals, and confirm the tutor is the right fit.",
    icon: MessageSquare,
  },
  {
    title: "3. Book a session",
    description: "Choose a time, confirm your lesson, and pay securely through Mentora.",
    icon: Calendar,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">How Mentora works</h2>
        <p className="text-slate-600 mb-16">Go from tutor search to booked lesson in three clear steps.</p>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* خط وهمي يصل بين الأيقونات في الشاشات الكبيرة */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 border border-indigo-100">
                <step.icon className="w-7 h-7 text-indigo-600" />
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

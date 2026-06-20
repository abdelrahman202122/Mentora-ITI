"use client";

import { motion } from "framer-motion";
import { Baby, BookOpenText, School, GraduationCap, Building2 } from "lucide-react";

const grades = [
  { name: "Pre-School", icon: Baby },
  { name: "Primary School", icon: BookOpenText },
  { name: "Middle School", icon: School },
  { name: "High School", icon: Building2 },
  { name: "University", icon: GraduationCap },
];

export default function GradeLevels() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">In all grades</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {grades.map((grade, index) => (
            <motion.div 
              key={grade.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4 group"
            >
              {/* أيقونة تفاعلية */}
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group-hover:border-indigo-200 group-hover:shadow-indigo-100 group-hover:shadow-lg transition-all duration-300">
                <grade.icon className="w-10 h-10 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-700 text-center">{grade.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
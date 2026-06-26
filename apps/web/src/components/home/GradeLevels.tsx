"use client";

import { motion } from "framer-motion";
import { Baby, BookOpenText, School, GraduationCap, Building2 } from "lucide-react";

const grades = [
  { name: "Preschool", icon: Baby },
  { name: "Primary School", icon: BookOpenText },
  { name: "Middle School", icon: School },
  { name: "Secondary School", icon: Building2 },
  { name: "University", icon: GraduationCap },
];

export default function GradeLevels() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Find support for every level</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {grades.map((grade, index) => (
            <motion.div 
              key={grade.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="flex flex-col items-center gap-4 group"
            >
              {/* أيقونة تفاعلية */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors duration-200">
                <grade.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-700 text-center">{grade.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

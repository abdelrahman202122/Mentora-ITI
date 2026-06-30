"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, MessageSquare, Calendar } from "lucide-react";

const steps = [
  { titleKey: "step1Title", descKey: "step1Description", icon: Search },
  { titleKey: "step2Title", descKey: "step2Description", icon: MessageSquare },
  { titleKey: "step3Title", descKey: "step3Description", icon: Calendar },
] as const;

export default function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("title")}</h2>
        <p className="text-slate-600 mb-16">{t("subtitle")}</p>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* خط وهمي يصل بين الأيقونات في الشاشات الكبيرة */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 border border-indigo-100">
                <step.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t(step.titleKey)}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

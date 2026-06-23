"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; // 1. استيراد الإضافة
import { Users, BookOpen, Triangle, Atom, FlaskConical, Pill } from "lucide-react";

// التنسيقات الحركية لـ Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function ProfessionalSubjectsSection() {
  // 2. إعداد موديول الـ Autoplay للعمل فوراً وبشكل مستمر
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const subjects = [
    { name: "Sociology", icon: Users },
    { name: "English", icon: BookOpen },
    { name: "History", icon: Triangle },
    { name: "Maths", icon: Atom },
    { name: "Chemistry", icon: FlaskConical },
    { name: "Biology", icon: Pill },
  ];

  return (
    <motion.section 
      id="subjects"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="py-20 px-6 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-center mb-16 text-slate-900 tracking-tight">
          Get tutor support in <span className="text-indigo-600">all school subjects</span>
        </motion.h2>
        
        {/* Carousel بدون الأسهم ومع تفعيل الـ Autoplay */}
        <motion.div variants={itemVariants} className="relative px-4 mb-20">
          <Carousel 
            opts={{ 
              align: "start", 
              loop: true // يضمن التفاف العناصر بشكل لانهائي
            }} 
            plugins={[plugin.current]} // 3. تمرير الإضافة للـ Carousel
            className="w-full"
          >
            <CarouselContent>
              {subjects.map((sub, i) => (
                <CarouselItem key={i} className="basis-1/2 md:basis-1/4 lg:basis-1/6">
                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="flex flex-col items-center gap-4 cursor-pointer"
                  >
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300">
                      <sub.icon className="w-10 h-10 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-700">{sub.name}</span>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* تم حذف مكونات <CarouselPrevious /> و <CarouselNext /> لإلغاء الأسهم تماماً */}
          </Carousel>
        </motion.div>

        {/* زر الاستكشاف */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.div whileTap={{ scale: 0.95 }}>
            {/* يمكنك إضافة زر هنا لاحقاً لو رغبت */}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
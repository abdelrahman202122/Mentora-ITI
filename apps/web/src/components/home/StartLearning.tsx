"use client";
import { Button } from "../ui/button";

export default function StartLearning() {
  return (
    <div className="w-full px-4 py-8 md:py-16 sm:px-6 lg:px-8">
      {/* الـ Card الأساسي الكبير */}
      <div className="relative mx-auto max-w-5xl overflow-hidden shadow-2xl rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-indigo-900/90 to-indigo-950/90 backdrop-blur-md text-center border border-indigo-500/10">
        
        {/* تأثير إضاءة خلفي ناعم للموبايل والشاشات الكبيرة */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* الحاوية الداخلية: تم ضبط الـ padding ليتناسب مع الموبايل تصاعدياً */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-12 sm:px-12 md:py-20 space-y-6">
          
          {/* عنوان مرن يتصغير تلقائياً على الموبايل عشان ميعملش خطوط كتير */}
          <h2 className="text-2xl font-bold tracking-tight text-white xs:text-3xl sm:text-4xl md:text-5xl leading-tight sm:leading-none">
            Ready to start your <br className="xs:hidden" /> learning journey?
          </h2>
          
          {/* نص مريح للعين ومتناسق الحجم */}
          <p className="text-xs font-light leading-relaxed text-slate-200 sm:text-base md:text-lg max-w-md sm:max-w-none">
            Join thousands of students who are already achieving their goals with Mentora.
          </p>

          {/* زرار مرن: يأخذ عرض كامل على الموبايلات الصغيرة جداً وشكل طبيعي على الشاشات الأكبر */}
          <div className="pt-4 w-full sm:w-auto">
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-base font-medium px-8 py-6 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 rounded-xl"
            >
              Get Started Today
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
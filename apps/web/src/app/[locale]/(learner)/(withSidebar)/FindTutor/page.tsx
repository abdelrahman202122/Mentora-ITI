import Stepper from "@/components/findTutor/Stepper";


const FindTutorPage = () => {
  return (
    <div className="space-y-6 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Find Your Mentor</h1>
        <p className="text-slate-500 text-sm mt-1">
          Follow the simple steps to discover, match, and book a session with the perfect academic tutor.
        </p>
      </div>
      <Stepper />
    </div>
  );
};

export default FindTutorPage;
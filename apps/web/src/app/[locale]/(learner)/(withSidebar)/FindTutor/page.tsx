import Stepper from "@/components/findTutor/Stepper";


const FindTutorPage = () => {
  return (
    <div className=" py-6 px-4 md:px-4 ">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Find Your Mentor</h1>
        <p className="text-slate-500 sm:text-sm mt-1 md:text-lg">
          Follow the simple steps to discover, match, and book a session with the perfect academic tutor.
        </p>
      </div>
      <Stepper />
    </div>
  );
};

export default FindTutorPage;
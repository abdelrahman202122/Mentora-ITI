import Header from '../../components/home/Header/Header';
import Hero from '../../components/home/Hero/Hero';
import SubjectSection from '../../components/home/SubjectsSection/SubjectsSection';
import GradeLevels from '../../components/home/GradeLevels/GradeLevels';
import HowItWorks from '../../components/home/HowItWorks/HowItWorks';
import Reviews from '../../components/home/Reviews/Reviews';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <SubjectSection />
      <GradeLevels />
      <HowItWorks />
      <Reviews />
    </>
  );
}

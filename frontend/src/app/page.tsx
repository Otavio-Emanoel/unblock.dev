import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { RoomPreviewMockup } from "@/components/landing/RoomPreviewMockup";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { CostCalculator } from "@/components/landing/CostCalculator";
import { CtaSection } from "@/components/landing/CtaSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* Header Fixo / Glassmorphism */}
      <Header />

      {/* Main Landing Sections */}
      <main className="flex-1 space-y-12">
        <Hero />

        {/* Live Interactive Workspace Preview */}
        <section className="px-6 -mt-8 relative z-10">
          <RoomPreviewMockup />
        </section>

        <FeaturesGrid />
        <HowItWorks />
        <PricingPlans />
        <CostCalculator />
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

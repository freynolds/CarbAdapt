import { OnboardingScreen } from "@/components/screens/onboarding-screen";

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  return <OnboardingScreen step={step} />;
}

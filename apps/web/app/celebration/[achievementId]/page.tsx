import { CelebrationScreen } from "@/components/screens/workout-screen";

export default async function Page({ params }: { params: Promise<{ achievementId: string }> }) {
  const { achievementId } = await params;
  return <CelebrationScreen id={achievementId} />;
}

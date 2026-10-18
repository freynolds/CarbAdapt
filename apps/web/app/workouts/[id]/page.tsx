import { WorkoutScreen } from "@/components/screens/workout-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkoutScreen id={id} />;
}

import { RecoveryScreen } from "@/components/screens/race-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; stageId: string }>;
}) {
  const { id, stageId } = await params;
  return <RecoveryScreen raceId={id} stageId={stageId} />;
}

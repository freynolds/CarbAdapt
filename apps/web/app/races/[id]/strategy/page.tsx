import { StrategyScreen } from "@/components/screens/race-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StrategyScreen id={id} />;
}

import { LoadingScreen } from "@/components/screens/race-screen";

export default async function Page({ params }: { params: Promise<{ id: string; day: string }> }) {
  const { id, day } = await params;
  return <LoadingScreen id={id} day={day} />;
}

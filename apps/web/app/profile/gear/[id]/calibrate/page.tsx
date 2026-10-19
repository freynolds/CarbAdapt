import { CalibrateScreen } from "@/components/screens/gear-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CalibrateScreen id={id} />;
}

import { CallbackScreen } from "@/components/screens/auth-screen";

export default async function Page({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return <CallbackScreen provider={provider} />;
}

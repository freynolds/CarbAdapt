import { Suspense } from "react";
import { MagicScreen } from "@/components/screens/auth-screen";

export default function Page() {
  return (
    <Suspense>
      <MagicScreen />
    </Suspense>
  );
}

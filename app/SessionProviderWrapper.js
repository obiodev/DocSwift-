"use client";
import { useEffect }      from "react";
import { useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Suspense }        from "react";

function RefCapture() {
  const params = useSearchParams();
  useEffect(() => {
    const ref = params.get("ref");
    if (ref) localStorage.setItem("docswift_ref", ref.toUpperCase().trim());
  }, [params]);
  return null;
}

export default function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <RefCapture />
      </Suspense>
      {children}
    </SessionProvider>
  );
}

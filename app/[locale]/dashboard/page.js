"use client";
import { useRouter } from "next/navigation";
import { useLocale }  from "next-intl";
import { useEffect }  from "react";

export default function DashboardHome() {
  const router = useRouter();
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => { router.replace(`${prefix}/dashboard/hr`); }, []);

  return (
    <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7A99",fontSize:14 }}>
      Redirection…
    </div>
  );
}

"use client";

import WrapperAdmin from "@/common/WrapperAdmin";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SWRConfig } from "swr";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const axiosAuth = useAxiosAuth();
  const swrConfig = {
    fetcher: (url: any) => axiosAuth?.get(url).then((res) => res.data),
  };
  const isAdmin = useAuthStore(
    (state) => state.user?.role_id === "43dba1a3-e595-4f0b-aaa8-9f33b28caf51"
  );
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, router]);

  return (
    <SWRConfig value={swrConfig}>
      <WrapperAdmin>{children}</WrapperAdmin>
    </SWRConfig>
  );
}

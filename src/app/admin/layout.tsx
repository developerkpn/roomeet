"use client";

import WrapperAdmin from "@/common/WrapperAdmin";
import axios from "@/lib/axios";
import { Container } from "@mui/material";
import { SWRConfig } from "swr";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const swrConfig = {
    fetcher: (url: any) => axios.get(url).then((res) => res.data),
  };

  return (
    <SWRConfig value={swrConfig}>
      <Container component="section" maxWidth="lg">
        <WrapperAdmin>{children}</WrapperAdmin>
      </Container>
    </SWRConfig>
  );
}

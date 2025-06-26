"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useCallback, useEffect, useState } from "react";

const useFetch = <T,>(
  url: string
): { data: T | null; error: any; loading: boolean; refetch: any } => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const axiosAuth = useAxiosAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosAuth.get(url);
      console;
      setData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (url) fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;

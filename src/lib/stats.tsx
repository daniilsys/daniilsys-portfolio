"use client";

import { useEffect, useState } from "react";

export interface GitHubStats {
  stars: number;
  forks: number;
}

export interface CrateStats {
  downloads: number;
  version: string;
}

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedFetch<T>(key: string, url: string): Promise<T | null> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data as T;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(key, { data, ts: Date.now() });
    return data as T;
  } catch {
    return null;
  }
}

export function useGitHubStats(repo: string | undefined) {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    if (!repo) return;
    cachedFetch<{ stargazers_count: number; forks_count: number }>(
      `gh:${repo}`,
      `https://api.github.com/repos/${repo}`,
    ).then((data) => {
      if (data) {
        setStats({ stars: data.stargazers_count, forks: data.forks_count });
      }
    });
  }, [repo]);

  return stats;
}

export function useCrateStats(crate: string | undefined) {
  const [stats, setStats] = useState<CrateStats | null>(null);

  useEffect(() => {
    if (!crate) return;
    cachedFetch<{ crate: { downloads: number; max_stable_version: string; max_version: string } }>(
      `crate:${crate}`,
      `https://crates.io/api/v1/crates/${crate}`,
    ).then((data) => {
      if (data) {
        setStats({
          downloads: data.crate.downloads,
          version: data.crate.max_stable_version || data.crate.max_version,
        });
      }
    });
  }, [crate]);

  return stats;
}

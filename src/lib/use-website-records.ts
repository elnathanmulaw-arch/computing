"use client";

import { useCallback, useEffect, useState } from "react";

import { seedWebsites } from "@/lib/seed-data";
import { WebsiteRecord, WebsiteRecordInput } from "@/lib/types";

const STORAGE_KEY = "linkvault-website-records";
const UPDATE_EVENT = "linkvault-website-records-updated";

function sortRecords(records: WebsiteRecord[]) {
  return [...records].sort((left, right) =>
    right.lastUpdated.localeCompare(left.lastUpdated),
  );
}

function createWebsiteRecord(input: WebsiteRecordInput): WebsiteRecord {
  return {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? `site-${Date.now()}`,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

function saveRecords(records: WebsiteRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function loadRecords() {
  const savedRecords = localStorage.getItem(STORAGE_KEY);

  if (!savedRecords) {
    const seeded = sortRecords(seedWebsites);
    saveRecords(seeded);
    return seeded;
  }

  try {
    const parsedRecords = JSON.parse(savedRecords) as WebsiteRecord[];
    return sortRecords(parsedRecords);
  } catch {
    const seeded = sortRecords(seedWebsites);
    saveRecords(seeded);
    return seeded;
  }
}

export function useWebsiteRecords() {
  const [records, setRecords] = useState<WebsiteRecord[]>(seedWebsites);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const syncRecords = () => {
      setRecords(loadRecords());
      setHydrated(true);
    };

    syncRecords();
    window.addEventListener("storage", syncRecords);
    window.addEventListener(UPDATE_EVENT, syncRecords);

    return () => {
      window.removeEventListener("storage", syncRecords);
      window.removeEventListener(UPDATE_EVENT, syncRecords);
    };
  }, []);

  const addRecord = useCallback((input: WebsiteRecordInput) => {
    const nextRecords = sortRecords([createWebsiteRecord(input), ...loadRecords()]);
    saveRecords(nextRecords);
    setRecords(nextRecords);
  }, []);

  const updateRecord = useCallback((id: string, input: WebsiteRecordInput) => {
    const nextRecords = sortRecords(
      loadRecords().map((record) =>
        record.id === id
          ? {
              ...record,
              ...input,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : record,
      ),
    );

    saveRecords(nextRecords);
    setRecords(nextRecords);
  }, []);

  const deleteRecord = useCallback((id: string) => {
    const nextRecords = loadRecords().filter((record) => record.id !== id);
    saveRecords(nextRecords);
    setRecords(nextRecords);
  }, []);

  return {
    records,
    hydrated,
    addRecord,
    updateRecord,
    deleteRecord,
  };
}

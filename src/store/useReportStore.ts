import { create } from 'zustand';
import type { ReportData, TestRecord } from '../types';

interface ReportStore {
  records: TestRecord[];
  report: ReportData | null;
  error: string | null;
  isLoading: boolean;
  setRecords: (records: TestRecord[]) => void;
  setReport: (report: ReportData) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  records: [],
  report: null,
  error: null,
  isLoading: false,
  setRecords: (records) => set({ records }),
  setReport: (report) => set({ report }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ records: [], report: null, error: null, isLoading: false }),
}));

/**
 * Hook personalizado para gestionar datos VPD
 * 
 * Proporciona una interfaz React-friendly para acceder al servicio de datos
 * con gestión de estado, loading y errores.
 */

import { useState, useEffect, useCallback } from 'react';
import { VPDData, VPDRecord, TimeBlock } from '../types/vpd-types';
import { vpdDataService } from '../services/dataService';

interface UseVPDDataResult {
  data: VPDData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useVPDData = (): UseVPDDataResult => {
  const [data, setData] = useState<VPDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const vpdData = await vpdDataService.getData();
      setData(vpdData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching VPD data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook para obtener datos filtrados por período
 */
export const useVPDDataByPeriod = (period: 'day' | 'night' | 'full') => {
  const [data, setData] = useState<VPDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const records = await vpdDataService.getDataByPeriod(period);
        setData(records);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};

/**
 * Hook para obtener datos filtrados por bloque temporal
 */
export const useVPDDataByTimeBlock = (block: TimeBlock) => {
  const [data, setData] = useState<VPDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const records = await vpdDataService.getDataByTimeBlock(block);
        setData(records);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [block]);

  return { data, loading, error };
};

/**
 * Hook para obtener datos de análisis térmico
 */
export const useThermalAnalysisData = (islandId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const thermalData = await vpdDataService.getThermalAnalysisData(islandId);
        setData(thermalData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (islandId) {
      fetchData();
    }
  }, [islandId]);

  return { data, loading, error };
};

/**
 * Hook para calcular estadísticas
 */
export const useVPDStatistics = (records: VPDRecord[], islandIds: string[]) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (records.length > 0 && islandIds.length > 0) {
      const statistics = vpdDataService.calculateStatistics(records, islandIds);
      setStats(statistics);
    }
  }, [records, islandIds]);

  return stats;
};
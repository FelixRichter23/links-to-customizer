// app/editor/hooks/useConfigManager.ts
import { useCallback, useRef } from 'react';
import { PageConfig } from '../types';

interface ConfigManagerActions {
  updateConfig: (newConfig: PageConfig | ((prevConfig: PageConfig) => PageConfig), actionType?: string) => void;
  batchUpdates: (updates: (() => void)[]) => void;
}

export function useConfigManager(
  config: PageConfig,
  pushToHistory: (config: PageConfig) => void
): ConfigManagerActions {
  const lastActionTime = useRef<number>(0);
  const lastActionType = useRef<string>('');
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const BATCH_DELAY = 500; // 500ms zwischen ähnlichen Aktionen
  
  const updateConfig = useCallback((
    newConfig: PageConfig | ((prevConfig: PageConfig) => PageConfig), 
    actionType: string = 'general'
  ) => {
    const now = Date.now();
    const shouldBatch = (
      now - lastActionTime.current < BATCH_DELAY && 
      lastActionType.current === actionType
    );
    
    // Berechne die neue Config
    const updatedConfig = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    
    // Wenn wir batchen sollen, verzögere das Hinzufügen zur History
    if (shouldBatch && batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }
    
    if (!shouldBatch) {
      // Sofortiges Hinzufügen zur History
      pushToHistory(updatedConfig);
    } else {
      // Verzögertes Hinzufügen zur History
      batchTimeout.current = setTimeout(() => {
        pushToHistory(updatedConfig);
      }, BATCH_DELAY);
    }
    
    lastActionTime.current = now;
    lastActionType.current = actionType;
  }, [config, pushToHistory]);
  
  const batchUpdates = useCallback((updates: (() => void)[]) => {
    // Führe alle Updates aus, aber füge nur am Ende zur History hinzu
    updates.forEach(update => update());
    pushToHistory(config);
  }, [config, pushToHistory]);
  
  return {
    updateConfig,
    batchUpdates,
  };
}

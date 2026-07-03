'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getSettingsAction } from '@/features/settings/actions';

export function SettingsInitializer() {
  const updateSettings = useAppStore((state) => state.updateSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSettingsAction();
        // Merge settings from DB with UI-specific settings (countdown, etc)
        updateSettings(settings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    loadSettings();
  }, [updateSettings]);

  return null;
}

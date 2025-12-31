import React, { createContext, useContext, useEffect, useState } from 'react';
import { Idea, Link, UserSettings, Tab } from './types';
import * as DB from './services/db';

interface AppState {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  ideas: Idea[];
  links: Link[];
  settings: UserSettings;
  refreshData: () => void;
  updateSettings: (s: UserSettings) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('think');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DB.getSettings());

  const refreshData = () => {
    setIdeas(DB.getIdeas());
    setLinks(DB.getLinks());
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    DB.saveSettings(newSettings);
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]); // Refresh when switching tabs

  return (
    <AppContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      ideas, 
      links, 
      settings,
      refreshData,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

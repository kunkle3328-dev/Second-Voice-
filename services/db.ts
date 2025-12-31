import { Idea, Link, UserSettings, VoicePresetName } from '../types';

// Mock DB keys
const STORAGE_KEYS = {
  IDEAS: 'second_voice_ideas',
  LINKS: 'second_voice_links',
  SETTINGS: 'second_voice_settings',
};

// --- IDEAS ---

export const getIdeas = (): Idea[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
  return raw ? JSON.parse(raw) : [];
};

export const saveIdea = (idea: Idea): void => {
  const ideas = getIdeas();
  const existingIndex = ideas.findIndex((i) => i.id === idea.id);
  if (existingIndex >= 0) {
    ideas[existingIndex] = idea;
  } else {
    ideas.unshift(idea);
  }
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
};

export const deleteIdea = (id: string): void => {
  const ideas = getIdeas().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  // Clean links
  const links = getLinks().filter(l => l.source_idea_id !== id && l.target_idea_id !== id);
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
};

// --- LINKS ---

export const getLinks = (): Link[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.LINKS);
  return raw ? JSON.parse(raw) : [];
};

export const saveLink = (link: Link): void => {
  const links = getLinks();
  if (!links.find(l => l.id === link.id)) {
    links.push(link);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  }
};

// --- SETTINGS ---

const DEFAULT_SETTINGS: UserSettings = {
  voicePreset: 'Notebook-Clean',
  handsFree: false,
  vadSensitivity: 0.5,
  autoEndTurn: true,
};

export const getSettings = (): UserSettings => {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// --- UTILS ---
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.IDEAS);
  localStorage.removeItem(STORAGE_KEYS.LINKS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};

export interface Idea {
  id: string;
  title: string;
  summary: string;
  raw_transcript: string;
  confidence: number;
  created_at: string; // ISO Date
  last_referenced_at: string; // ISO Date
  tags: string[];
}

export interface Link {
  id: string;
  source_idea_id: string;
  target_idea_id: string;
  strength: number; // 0-1
  rationale: string;
}

export interface UserSettings {
  voicePreset: VoicePresetName;
  handsFree: boolean;
  vadSensitivity: number; // 0-1
  autoEndTurn: boolean;
}

export type VoicePresetName = 'Notebook-Clean' | 'Reflective' | 'Creative' | 'Analytical' | 'Gentle';

export interface VoiceConfigProfile {
  name: VoicePresetName;
  voiceName: string;
  systemPromptModifier: string;
}

export type Tab = 'think' | 'ideas' | 'links' | 'timeline' | 'you';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

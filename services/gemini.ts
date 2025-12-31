import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Tool } from '@google/genai';
import { UserSettings, Idea } from '../types';
import { VOICE_PRESETS, SYSTEM_INSTRUCTION } from '../constants';
import * as AudioUtils from './audioUtils';
import * as DB from './db';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Tools for the Live Model
const createIdeaTool: FunctionDeclaration = {
  name: 'createIdea',
  description: 'Save a structured idea, memory, or thought to the second brain database.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'A short, punchy 3-5 word title for the idea.' },
      summary: { type: Type.STRING, description: 'A 1-2 sentence summary of the core concept.' },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Keywords or tags.' }
    },
    required: ['title', 'summary']
  }
};

const recallIdeasTool: FunctionDeclaration = {
  name: 'recallIdeas',
  description: 'Search for past ideas based on a query string.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The topic to search for.' }
    },
    required: ['query']
  }
};

// --- Live Client Management ---

let session: any = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let inputSource: MediaStreamAudioSourceNode | null = null;
let processor: ScriptProcessorNode | null = null;
let currentSettings: UserSettings | null = null;
let nextStartTime = 0;

export interface LiveCallbacks {
  onStateChange: (state: 'idle' | 'listening' | 'speaking' | 'processing') => void;
  onTranscript: (text: string, isUser: boolean) => void;
  onAudioLevel: (level: number) => void;
}

export const connectLive = async (
  settings: UserSettings, 
  callbacks: LiveCallbacks
) => {
  if (session) {
    await disconnectLive();
  }

  currentSettings = settings;
  const voiceProfile = VOICE_PRESETS[settings.voicePreset] || VOICE_PRESETS['Notebook-Clean'];

  // Initialize Audio Contexts
  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);

  // Get Mic Stream
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 16000
    } 
  });

  callbacks.onStateChange('listening');

  // Connect to Gemini Live
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: SYSTEM_INSTRUCTION + "\n\nTone Instruction: " + voiceProfile.systemPromptModifier,
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceProfile.voiceName } }
      },
      tools: [{ functionDeclarations: [createIdeaTool, recallIdeasTool] }]
    },
    callbacks: {
      onopen: () => {
        console.log('Gemini Live Connected');
        
        // Setup Audio Pipeline
        inputSource = inputAudioContext!.createMediaStreamSource(stream);
        processor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // VAD / Level Visualization
          const rms = AudioUtils.calculateRMS(inputData);
          callbacks.onAudioLevel(rms);

          // Downsample and Send
          // NOTE: ScriptProcessor usually runs at context rate (16k requested).
          // We convert Float32 to Int16
          const pcmData = AudioUtils.resample(inputData, 16000, inputAudioContext!.sampleRate);
          const int16Data = AudioUtils.float32ToInt16(pcmData);
          const base64Data = AudioUtils.arrayBufferToBase64(int16Data.buffer);

          sessionPromise.then(s => {
             s.sendRealtimeInput({
               media: {
                 mimeType: 'audio/pcm;rate=16000',
                 data: base64Data
               }
             });
          });
        };

        inputSource.connect(processor);
        processor.connect(inputAudioContext!.destination); // Helper to keep processor alive
      },
      onmessage: async (msg: LiveServerMessage) => {
        // Handle Audio Output
        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData && outputAudioContext) {
          callbacks.onStateChange('speaking');
          const buffer = AudioUtils.base64ToUint8Array(audioData);
          
          // Decode PCM
          // Live API returns PCM 24kHz usually.
          const audioBuffer = outputAudioContext.createBuffer(1, buffer.length / 2, 24000);
          const channelData = audioBuffer.getChannelData(0);
          const int16 = new Int16Array(buffer.buffer);
          for (let i = 0; i < int16.length; i++) {
             channelData[i] = int16[i] / 32768.0;
          }

          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputNode);
          
          const now = outputAudioContext.currentTime;
          nextStartTime = Math.max(nextStartTime, now);
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          
          source.onended = () => {
             if (outputAudioContext && outputAudioContext.currentTime >= nextStartTime) {
                 callbacks.onStateChange('listening');
             }
          };
        }

        // Handle Tool Calls
        if (msg.toolCall) {
          callbacks.onStateChange('processing');
          for (const fc of msg.toolCall.functionCalls) {
            console.log('Tool Call:', fc.name, fc.args);
            let result: any = { status: 'ok' };

            if (fc.name === 'createIdea') {
               const newIdea: Idea = {
                 id: crypto.randomUUID(),
                 title: fc.args.title as string,
                 summary: fc.args.summary as string,
                 raw_transcript: 'Captured via voice',
                 confidence: 1.0,
                 created_at: new Date().toISOString(),
                 last_referenced_at: new Date().toISOString(),
                 tags: (fc.args.tags as string[]) || []
               };
               DB.saveIdea(newIdea);
               
               // Auto-link logic (simplified)
               const allIdeas = DB.getIdeas();
               const related = allIdeas.filter(i => 
                  i.id !== newIdea.id && 
                  i.tags.some(t => newIdea.tags.includes(t))
               );
               if(related.length > 0) {
                 DB.saveLink({
                   id: crypto.randomUUID(),
                   source_idea_id: newIdea.id,
                   target_idea_id: related[0].id,
                   strength: 0.8,
                   rationale: 'Shared themes'
                 });
               }

               result = { result: "Idea saved successfully." };
            } else if (fc.name === 'recallIdeas') {
               const query = (fc.args.query as string).toLowerCase();
               const hits = DB.getIdeas().filter(i => 
                 i.title.toLowerCase().includes(query) || 
                 i.summary.toLowerCase().includes(query)
               ).slice(0, 3);
               result = { found: hits.map(h => ({ title: h.title, summary: h.summary })) };
            }

            sessionPromise.then(s => {
              s.sendToolResponse({
                functionResponses: {
                  id: fc.id,
                  name: fc.name,
                  response: result
                }
              });
            });
          }
        }
      },
      onclose: () => {
        console.log('Gemini Live Disconnected');
        callbacks.onStateChange('idle');
      },
      onerror: (e) => {
        console.error('Gemini Live Error', e);
        callbacks.onStateChange('idle');
      }
    }
  });

  session = await sessionPromise;
  return session;
};

export const disconnectLive = async () => {
  if (inputSource) inputSource.disconnect();
  if (processor) processor.disconnect();
  if (inputAudioContext) await inputAudioContext.close();
  if (outputAudioContext) await outputAudioContext.close();
  // Live API session closing isn't explicitly exposed in the same way as WebSocket close usually, 
  // but releasing the context stops the stream.
  // Ideally, session.close() if available in SDK.
  inputAudioContext = null;
  outputAudioContext = null;
  session = null;
};

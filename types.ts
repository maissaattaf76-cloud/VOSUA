
export type AIMode = 'chat' | 'vision' | 'voice' | 'builder';
export type AIPersona = 'expert' | 'creative' | 'ghost';

export interface SystemSnapshot {
  id: string;
  name: string;
  timestamp: number;
  activeMode: AIMode;
  isHyperDrive: boolean;
  activeTheme?: string;
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'video' | 'code';
  parts?: MessagePart[];
  metadata?: {
    urls?: { title: string; uri: string }[];
    mediaUrl?: string;
    language?: string;
    isArtifact?: boolean;
  };
}

export interface VoiceTranscription {
  text: string;
  role: 'user' | 'assistant';
}

export interface ScriptHook {
  title: string;
  lines: string[];
}

export interface ScriptBridge {
  title: string;
  content: string;
}

export interface ScriptGoldenNugget {
  title: string;
  content: string;
}

export interface ScriptWTA {
  title: string;
  actionType: string;
  lines: string[];
}

// Legacy interfaces for backward compatibility
export interface ScriptFactset {
  category: string;
  content: string;
}

export interface ScriptTake {
  perspective: string;
  content: string;
}

export interface ScriptOutro {
  title: string;
  lines: string[];
}

export interface ScriptComponents {
  hooks: ScriptHook[];
  bridges: ScriptBridge[];
  goldenNuggets: ScriptGoldenNugget[];
  wtas: ScriptWTA[];
}

export interface UserSelectedScriptComponents {
  hook: ScriptHook | null;
  bridge: ScriptBridge | null;
  goldenNugget: ScriptGoldenNugget | null;
  wta: ScriptWTA | null;
} 
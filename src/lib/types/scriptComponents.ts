export interface ScriptHook {
  title: string;
  lines: string[];
}

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
  factsets: ScriptFactset[];
  takes: ScriptTake[];
  outros: ScriptOutro[];
}

export interface UserSelectedScriptComponents {
  hook: ScriptHook | null;
  factsets: ScriptFactset[];
  take: ScriptTake | null;
  outro: ScriptOutro | null;
} 
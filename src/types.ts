export type QuestionType = "QTYPE_MCQ4" | "QTYPE_INT" | "CUSTOM";

export interface PreProcessor {
  name: string;
  options: Record<string, any>;
}

export interface FieldBlock {
  id: string; // Internal ID
  name: string; // The key in fieldBlocks
  fieldType: QuestionType;
  origin: [number, number];
  bubblesGap: number;
  labelsGap: number;
  fieldLabels: string[];
  direction?: "vertical" | "horizontal";
  bubbleValues?: string[];
}

export interface OMRConfig {
  pageDimensions: [number, number];
  bubbleDimensions: [number, number];
  preProcessors: PreProcessor[];
  customLabels: Record<string, string[]>;
  fieldBlocks: Record<string, FieldBlock>;
  outputColumns: string[];
  emptyValue: string;
}

export type CalibrationStep = 
  | "IDLE"
  | "SELECT_ORIGIN"
  | "SELECT_LAST_BUBBLE"
  | "SELECT_LAST_LABEL"
  | "COMPLETED";

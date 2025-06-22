
// Style types and interfaces
export interface StyleChanges {
  layer: string;
  target: string;
  changes: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    boxShadow?: string;
    gradient?: string;
  };
  reasoning: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export type Format<D = void> = (D extends void
  ? (document: unknown, source: string | null) => boolean
  : (document: unknown, source: string | null) => document is D) & {
  displayName?: string;
};

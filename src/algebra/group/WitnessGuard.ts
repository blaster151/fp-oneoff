import type { GroupHom, HomWitnesses } from "./Hom";

export type WithWitnesses<F> =
  F extends GroupHom<infer G, infer H, infer A, infer B> ? GroupHom<G,H,A,B> & { witnesses: HomWitnesses<A,B> } : never;

// usage example in files where you require analysis has been called:
// const fAnalyzed: WithWitnesses<typeof f> = analyzeHom(f);
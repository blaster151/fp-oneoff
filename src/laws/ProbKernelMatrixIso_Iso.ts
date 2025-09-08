import { Iso, isoLaws, runLaws } from "./Witness";
import { Kernel } from "../prob/Kleisli";
import { kernelToMatrix, matrixToKernel, approxEqMatrix, kernelsEq, Samples } from "../prob/MarkovKernelIso";
import type { Stoch } from "../prob/Markov";

const eqNum = (a:number,b:number)=>a===b;

export function lawfulKernelMatrixIso_Iso() {
  const tag = "Prob/KernelMatrixIso/Iso";

  // Finite enumerations for this pack
  const A = [0,1,2];
  const B = [10,20];

  // Equality on the A-side (kernels): pointwise distribution equality over A, with eqNum on outputs
  const eqKernel = (k1: Kernel<number,number>, k2: Kernel<number,number>) =>
    kernelsEq(A, eqNum, k1, k2);

  // Equality on the B-side (matrices): approximate matrix equality
  const eqMatrix = (P: Stoch, Q: Stoch) => approxEqMatrix(P, Q, 1e-7);

  const iso: Iso<Kernel<number,number>, Stoch> = {
    to:   (k) => kernelToMatrix(A, B, eqNum, k),
    from: (P) => matrixToKernel(A, B, P)
  };

  // Sample families for both sides
  const samplesA = [
    Samples.pointFirst<number,number>(B),
    Samples.uniform<number,number>(B),
    Samples.addOneMod<number,number>(B),
  ];
  const samplesB: Stoch[] = [
    [[1,0],[0.2,0.8],[0.5,0.5]],
    [[0.3,0.7],[1,0],[0.0,1.0]]
  ];

  const laws = isoLaws(eqKernel, eqMatrix, iso);

  return {
    tag,
    eq: (_:any, __:any)=> true,          // not used by iso laws in our runner pattern
    struct: iso,
    laws,
    run: () => runLaws(laws as any, { samplesA, samplesB } as any)
  };
}
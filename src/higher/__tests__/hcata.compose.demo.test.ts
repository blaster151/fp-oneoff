import { describe, it, expect } from "vitest";
import { HFix, Hin, withHMap, hcata } from "../HFix";
import { HComp } from "../../category/HComp";
import { lanHFunctor } from "../../category/HFunctor.Lan";
import type { Lan1 } from "../../category/Lan";
import { refl } from "../../category/Eq";

/** --- Simple higher-order functor: Wrap --- */
type Wrap<G, A> = { wrap: Array<G> };
const WrapH = {
  hfmap<G, H>(nt: <X>(gx: G) => H) {
    return <A>(wa: Wrap<G, A>): Wrap<H, A> => ({ wrap: wa.wrap.map(nt) });
  },
};

/** h = Id (so Lan h g c = ∀b. Eq(b,c) -> g b) */
type Id<A> = A;

/** --- Our composed node family: WLanF<G,A> stores Wrap<Lan<Id, G, A>> plus a weight --- */
type WLanF<G, A> = { _t: "node"; w: number; val: Wrap<Lan1<Id, G, A>, A> };

/** algebra for hcata: sum weights + folded-child results */
const sumAlg = (fr: any): number => {
  const children: Array<any> = fr.val.wrap.map((lan: any) => lan(refl<any>()));
  const subtotal = children.reduce((acc, n) => acc + n, 0);
  return fr.w + subtotal;
};

/** Helper: build Lan that returns a captured child */
const lanOf = <G>(child: G): Lan1<Id, G, any> => <B>(_eq: any) => child;

/** Node constructor whose mapper uses COMPOSED lifting: HComp(Wrap, Lan).hfmap */
function nodeComposed<G, A>(w: number, kids: Array<G>): WLanF<G, A> {
  const val: Wrap<Lan1<Id, G, A>, A> = { wrap: kids.map(k => lanOf<G>(k)) };
  const LanH = lanHFunctor<Id>();
  const Comp = HComp(WrapH as any, LanH as any);

  return withHMap<WLanF<G, A>>(
    { _t: "node", w, val } as any,
    (nt: (gx: G) => any) => {
      const lifted = Comp.hfmap<G, any>(nt);
      const newVal = lifted<A>(val as any);
      return { _t: "node", w, val: newVal } as any;
    }
  );
}

/** Node constructor whose mapper uses SEQUENTIAL lifting: Wrap.hfmap(Lan.hfmap) */
function nodeSequential<G, A>(w: number, kids: Array<G>): WLanF<G, A> {
  const val: Wrap<Lan1<Id, G, A>, A> = { wrap: kids.map(k => lanOf<G>(k)) };
  const LanH = lanHFunctor<Id>();
  const step1 = LanH.hfmap<G, any>((gx: G) => (gx as any)); // placeholder; actual 'nt' supplied at runtime
  // BUT we cannot bake a concrete 'nt' here; the node-local mapper receives nt.
  return withHMap<WLanF<G, A>>(
    { _t: "node", w, val } as any,
    (nt: (gx: G) => any) => {
      const liftLan  = LanH.hfmap<G, any>(nt);
      const liftWrap = (WrapH as any).hfmap(liftLan);
      const newVal   = liftWrap<A>(val as any);
      return { _t: "node", w, val: newVal } as any;
    }
  );
}

/** Build a tiny 2-level tree: parent with two leaf kids (weights included). */
function buildComposedTree(): HFix<WLanF<any, any>, any> {
  const leaf1 = Hin<WLanF<any, any>, any>(nodeComposed(1, []));
  const leaf2 = Hin<WLanF<any, any>, any>(nodeComposed(2, []));
  const parent = Hin<WLanF<any, any>, any>(nodeComposed(10, [leaf1, leaf2]));
  return parent;
}
function buildSequentialTree(): HFix<WLanF<any, any>, any> {
  const leaf1 = Hin<WLanF<any, any>, any>(nodeSequential(1, []));
  const leaf2 = Hin<WLanF<any, any>, any>(nodeSequential(2, []));
  const parent = Hin<WLanF<any, any>, any>(nodeSequential(10, [leaf1, leaf2]));
  return parent;
}

describe("hcata over composed (Wrap∘Lan) matches sequential lifting", () => {
  it("fold results are identical", () => {
    const fold = hcata<WLanF<number, any>, number>(sumAlg);
    const tComp = buildComposedTree();   // weight 10 + leaves (1 + 2) = 13
    const tSeq  = buildSequentialTree(); // same shape and mapping
    expect(fold(tComp)).toBe(13);
    expect(fold(tSeq)).toBe(13);
  });
});
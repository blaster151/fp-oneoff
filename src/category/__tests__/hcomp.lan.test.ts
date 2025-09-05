import { describe, it, expect } from "vitest";
import type { Nat1 } from "../Nat";
import type { HFunctor } from "../HFunctor";
import { HComp } from "../HComp";
import { lanHFunctor } from "../HFunctor.Lan";
import { refl } from "../Eq";
import type { Lan1 } from "../Lan";

/** A tiny higher-order functor:
 * Wrap<G,A> = { wrap: Array<G<A>> }
 */
type Wrap<G, A = unknown> = { wrap: Array<G> };

const WrapH: HFunctor<Wrap> = {
  hfmap<G, H>(nt: Nat1<G, H>) {
    return <A>(wa: Wrap<G, A>): Wrap<H, A> => ({ wrap: wa.wrap.map(nt) });
  },
};

/** Base functors for the test */
type Id<A = unknown> = A;
type Box<A = unknown> = { box: A };
const toBox: Nat1<Id, Box> = <A>(x: A) => ({ box: x });

/** A simple Lan value when h = Id: Lan Id g c = ∀b. Eq(b, c) -> g b
 * We'll choose c = number, b = number via refl and return g b from 7.
 */
function mkLanId<G, C>(): Lan1<(<X>(x: X) => X), G, C> {
  // In this test we only evaluate with Eq refl<number>, so we can ignore 'c'
  return <B>(_eq: any) => (7 as unknown) as G;
}

describe("HComp with Lan(h) behaves like sequential lifting", () => {
  it("lanHFunctor ∘ WrapH obeys composition on a concrete value", () => {
    // Fix h = Id, so Lan h g c = ∀b. Eq(b,c) -> g b
    const LanH = lanHFunctor<<X>(x: X) => X>(); // h = Id

    // Compose HFunctors:
    const LanWrap = HComp(WrapH, LanH); // (Wrap ∘ Lan h)

    // Value in (Wrap ∘ Lan h) Id at c = number:
    type FId<A>    = Id<A>;
    type FLan<A>   = Lan1<<X>(x:X)=>X, Id<A>, A>;
    type FWrap<A>  = Wrap<Id<A>, A>;
    type Composed<A> = Wrap<FLan<A>, A>;

    const lanVal: FLan<number> = mkLanId<Id<number>, number>();
    const value: Composed<number> = { wrap: [lanVal, lanVal] };

    // Left: lift to Box through the COMPOSED HFunctor in one go
    const leftLift = LanWrap.hfmap<Id<number>, Box<number>>(toBox);
    const left = leftLift<number>(value); // Wrap< Lan h Box, number >

    // Right: lift through Lan, then lift through Wrap (sequential)
    const step1 = LanH.hfmap<Id<number>, Box<number>>(toBox);         // Nat (Lan h Id) (Lan h Box)
    const step2 = WrapH.hfmap(step1);                 // Nat (Wrap (Lan h Id)) (Wrap (Lan h Box))
    const right = step2<number>(value);

    // To compare, we *evaluate* both Lan values at Eq refl<number>
    const eqN = refl<number>();
    const ev = (w: any) => w.wrap.map((lan: any) => lan(eqN));

    expect(ev(left)).toEqual(ev(right));
  });
});
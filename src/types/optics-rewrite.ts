// optics-rewrite.ts
// Optics-driven program rewriting for a tiny Free DSL in TypeScript.
// - minimal self-prism / traversal machinery (profunctor-flavored API)
// - Free<ExprF, A> term representation
// - rewrite(optic, f): Free -> Free
// - tiny rule registry: constant folding, peephole, inlining
//
// Run: ts-node optics-rewrite.ts

/********************** Tiny "profunctor-ish" optics **************************/
export interface Prism<S, A> {
  readonly preview: (s: S) => A | undefined; // match
  readonly review: (a: A) => S;              // build (often identity for self-prisms)
  modify: (s: S, f: (a: A) => A) => S;       // default via preview/review
}

export interface Traversal<S, A> {
  modify: (s: S, f: (a: A) => A) => S;
}

// Compose prisms
export function composePrism<S, A, B>(p1: Prism<S, A>, p2: Prism<A, B>): Prism<S, B> {
  return {
    preview: (s) => {
      const a = p1.preview(s);
      return a === undefined ? undefined : p2.preview(a);
    },
    review: (b) => p1.review(p2.review(b)),
    modify: (s, f) => {
      const a = p1.preview(s);
      if (a === undefined) return s;
      const b = p2.modify(a, f);
      return p1.review(b);
    }
  };
}

// Turn a prism into a single-target traversal
export function traversalFromPrism<S>(p: Prism<S, S>): Traversal<S, S> {
  return { modify: (s, f) => p.modify(s, f) };
}

/********************** Free DSL **********************************************/
// ExprF functor (base signature)
export type ExprF<A> =
  | { tag: "Lit"; n: number }
  | { tag: "Var"; name: string }
  | { tag: "Add"; left: A; right: A }
  | { tag: "Mul"; left: A; right: A }
  | { tag: "Let"; name: string; bound: A; body: A };

// Free monad over ExprF (Impure wraps functor with recursion positions Free)
export type Free<A> =
  | { _tag: "Pure"; value: A }
  | { _tag: "Impure"; node: ExprF<Free<A>> };

export const Pure = <A>(value: A): Free<A> => ({ _tag: "Pure", value });
export const Impure = <A>(node: ExprF<Free<A>>): Free<A> => ({ _tag: "Impure", node });

// Smart constructors (for A=never, i.e., closed terms)
export type Term = Free<never>;
export const lit  = (n:number): Term => Impure({ tag:"Lit", n });
export const v    = (name:string): Term => Impure({ tag:"Var", name });
export const add  = (l:Term, r:Term): Term => Impure({ tag:"Add", left:l, right:r });
export const mul  = (l:Term, r:Term): Term => Impure({ tag:"Mul", left:l, right:r });
export const let_ = (name:string, bound:Term, body:Term): Term => Impure({ tag:"Let", name, bound, body });

/********************** Tree utilities ***************************************/
export function mapChildren<A>(t: Free<A>, f: (x: Free<A>) => Free<A>): Free<A> {
  if (t._tag==="Pure") return t;
  const n = t.node;
  switch(n.tag){
    case "Lit": case "Var": return t;
    case "Add": return Impure({ tag:"Add", left:f(n.left), right:f(n.right) });
    case "Mul": return Impure({ tag:"Mul", left:f(n.left), right:f(n.right) });
    case "Let": return Impure({ tag:"Let", name:n.name, bound:f(n.bound), body:f(n.body) });
  }
}

export function everywhereBottomUp<A>(t: Free<A>, f: (x: Free<A>) => Free<A>): Free<A> {
  const go = (x: Free<A>): Free<A> => {
    const d = mapChildren(x, go);
    return f(d);
  };
  return go(t);
}

export function eqTerm(a:Term, b:Term): boolean {
  if (a._tag!==b._tag) return false;
  if (a._tag==="Pure") return b._tag==="Pure"; // only used with never
  if (a._tag!=="Impure" || b._tag!=="Impure") return false;
  const na=a.node, nb=b.node;
  if (na.tag!==nb.tag) return false;
  switch(na.tag){
    case "Lit": return (nb as any).n===na.n;
    case "Var": return (nb as any).name===na.name;
    case "Add": return eqTerm((na as any).left, (nb as any).left) && eqTerm((na as any).right, (nb as any).right);
    case "Mul": return eqTerm((na as any).left, (nb as any).left) && eqTerm((na as any).right, (nb as any).right);
    case "Let": return (na as any).name===(nb as any).name && eqTerm((na as any).bound, (nb as any).bound) && eqTerm((na as any).body, (nb as any).body);
  }
  return false;
}

// Pretty printer
export function show(t:Term): string {
  if (t._tag==="Pure") return "pure";
  if (t._tag!=="Impure") return "unknown";
  const n=t.node;
  switch(n.tag){
    case "Lit": return String(n.n);
    case "Var": return n.name;
    case "Add": return `(${show(n.left)} + ${show(n.right)})`;
    case "Mul": return `(${show(n.left)} * ${show(n.right)})`;
    case "Let": return `(let ${n.name} = ${show(n.bound)} in ${show(n.body)})`;
  }
  return "unknown";
}

/********************** Optics for Term (self-prisms) *************************/
// Self-prisms: focus whole node if it matches a shape
export function selfPrism(pred: (t:Term)=>boolean): Prism<Term, Term> {
  return {
    preview: (s) => pred(s) ? s : undefined,
    review: (a) => a,
    modify: (s, f) => pred(s) ? f(s) : s
  };
}

export const _Add = selfPrism(t => t._tag==="Impure" && t.node.tag==="Add");
export const _Mul = selfPrism(t => t._tag==="Impure" && t.node.tag==="Mul");
export const _Lit = selfPrism(t => t._tag==="Impure" && t.node.tag==="Lit");
export const _Var = selfPrism(t => t._tag==="Impure" && t.node.tag==="Var");
export const _Let = selfPrism(t => t._tag==="Impure" && t.node.tag==="Let");

// Traversal over immediate children
export const children: Traversal<Term, Term> = {
  modify: (s, f) => mapChildren(s, f)
};

// Deep traversal (all descendants, bottom-up)
export const descendants: Traversal<Term, Term> = {
  modify: (s, f) => everywhereBottomUp(s, f)
};

/********************** rewrite core ******************************************/
// Accept any optic with a `modify` method
export type ModLike<S,A> = { modify: (s:S, f:(a:A)=>A)=>S };

export function rewrite<F, A>(optic: ModLike<Free<A>, Free<A>>, f: (a: Free<A>) => Free<A>) {
  return (prog: Free<A>): Free<A> => optic.modify(prog, f);
}

// Helper: one-pass bottom-up application of a list of local rules
export type Rule = { name: string; optic: ModLike<Term, Term>; step: (t:Term)=>Term };

export function applyRulesOnce(t:Term, rules: Rule[]): Term {
  const local = (x:Term): Term => {
    for (const r of rules){
      const next = r.optic.modify(x, r.step);
      if (!eqTerm(next, x)) return next; // first-hit wins
    }
    return x;
  };
  return everywhereBottomUp(t, local);
}

// Fixpoint apply (stops when no rule changes the term)
export function applyRulesFix(t:Term, rules: Rule[], maxIters=100): Term {
  let cur = t;
  for (let i=0;i<maxIters;i++){
    const next = applyRulesOnce(cur, rules);
    if (eqTerm(next, cur)) return cur;
    cur = next;
  }
  return cur;
}

/********************** Rule registry *****************************************/
// Constant folding
export const foldAdd: Rule = {
  name: "fold/add",
  optic: _Add,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag==="Add" && n.left._tag==="Impure" && n.left.node.tag==="Lit" && n.right._tag==="Impure" && n.right.node.tag==="Lit"){
      return lit(n.left.node.n + n.right.node.n);
    }
    return t;
  }
};

export const foldMul: Rule = {
  name: "fold/mul",
  optic: _Mul,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag==="Mul" && n.left._tag==="Impure" && n.left.node.tag==="Lit" && n.right._tag==="Impure" && n.right.node.tag==="Lit"){
      return lit(n.left.node.n * n.right.node.n);
    }
    return t;
  }
};

// Peephole identities
export const mulOne: Rule = {
  name: "mul/one",
  optic: _Mul,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag!=="Mul") return t;
    if (n.left._tag==="Impure" && n.left.node.tag==="Lit" && n.left.node.n===1) return n.right;
    if (n.right._tag==="Impure" && n.right.node.tag==="Lit" && n.right.node.n===1) return n.left;
    if (n.left._tag==="Impure" && n.left.node.tag==="Lit" && n.left.node.n===0) return lit(0);
    if (n.right._tag==="Impure" && n.right.node.tag==="Lit" && n.right.node.n===0) return lit(0);
    return t;
  }
};

export const addZero: Rule = {
  name: "add/zero",
  optic: _Add,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag!=="Add") return t;
    if (n.left._tag==="Impure" && n.left.node.tag==="Lit" && n.left.node.n===0) return n.right;
    if (n.right._tag==="Impure" && n.right.node.tag==="Lit" && n.right.node.n===0) return n.left;
    return t;
  }
};

// Tiny inliner: let x = e in x  ==> e   (beta for trivial body)
export const inlineLetVar: Rule = {
  name: "inline/let-var",
  optic: _Let,
  step: (t) => {
    if (t._tag !== "Impure") return t;
    const n = t.node;
    if (n.tag!=="Let") return t;
    if (n.body._tag==="Impure" && n.body.node.tag==="Var" && n.body.node.name===n.name){
      return n.bound;
    }
    return t;
  }
};

export const defaultRules: Rule[] = [foldAdd, foldMul, mulOne, addZero, inlineLetVar];

/********************** Advanced rewrite operations *************************/

/** Apply a single rule with tracing */
export function applyRuleWithTrace(t: Term, rule: Rule): { result: Term; applied: boolean; trace?: string } {
  const result = rule.optic.modify(t, rule.step);
  const applied = !eqTerm(result, t);
  const traceResult: { result: Term; applied: boolean; trace?: string } = {
    result,
    applied
  };
  if (applied) {
    traceResult.trace = `Applied ${rule.name}: ${show(t)} → ${show(result)}`;
  }
  return traceResult;
}

/** Apply rules with full trace information */
export function applyRulesWithTrace(t: Term, rules: Rule[]): { 
  result: Term; 
  steps: Array<{rule: string; before: string; after: string}>; 
  iterations: number;
} {
  const steps: Array<{rule: string; before: string; after: string}> = [];
  let cur = t;
  let iterations = 0;
  
  while (iterations < 100) {
    let changed = false;
    const curStr = show(cur);
    
    for (const rule of rules) {
      const trace = applyRuleWithTrace(cur, rule);
      if (trace.applied) {
        steps.push({
          rule: rule.name,
          before: curStr,
          after: show(trace.result)
        });
        cur = trace.result;
        changed = true;
        break; // Apply one rule per iteration
      }
    }
    
    if (!changed) break;
    iterations++;
  }
  
  return { result: cur, steps, iterations };
}

/** Rule registry management */
export class RuleRegistry {
  private rules: Map<string, Rule> = new Map();
  
  register(rule: Rule): void {
    this.rules.set(rule.name, rule);
  }
  
  unregister(name: string): void {
    this.rules.delete(name);
  }
  
  get(name: string): Rule | undefined {
    return this.rules.get(name);
  }
  
  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }
  
  getEnabledRules(enabled: string[]): Rule[] {
    return enabled.map(name => this.rules.get(name)).filter((r): r is Rule => r !== undefined);
  }
  
  applyRules(t: Term, enabledRules?: string[]): Term {
    const rulesToApply = enabledRules ? this.getEnabledRules(enabledRules) : this.getAllRules();
    return applyRulesFix(t, rulesToApply);
  }
  
  applyRulesWithTrace(t: Term, enabledRules?: string[]): ReturnType<typeof applyRulesWithTrace> {
    const rulesToApply = enabledRules ? this.getEnabledRules(enabledRules) : this.getAllRules();
    return applyRulesWithTrace(t, rulesToApply);
  }
}

// Default registry with standard optimization rules
export const defaultRegistry = new RuleRegistry();
defaultRegistry.register(foldAdd);
defaultRegistry.register(foldMul);
defaultRegistry.register(mulOne);
defaultRegistry.register(addZero);
defaultRegistry.register(inlineLetVar);

/********************** Integration with existing optics *******************/

/** Adapter to use existing profunctor optics with the rewrite system */
export function adaptProfunctorOptic<S, A>(
  // This would integrate with existing CatkitOptics or OpticsFree
  // For now, we provide a simple adapter interface
  getter: (s: S) => A | undefined,
  setter: (s: S, a: A) => S
): Prism<S, A> {
  return {
    preview: getter,
    review: setter as any, // Simplified for demo
    modify: (s, f) => {
      const a = getter(s);
      return a !== undefined ? setter(s, f(a)) : s;
    }
  };
}

/** Generic rewrite function matching the requested signature */
export function genericRewrite<S, A>(
  optic: ModLike<S, A>,
  transform: (a: A) => A
): (s: S) => S {
  return (s: S) => optic.modify(s, transform);
}

/********************** Demo **************************************************/
export function demo() {
  console.log("=".repeat(80));
  console.log("OPTICS-DRIVEN PROGRAM REWRITING DEMO");
  console.log("=".repeat(80));

  const prog = add(
    mul(lit(1), add(lit(2), lit(3))),         // 1 * (2+3)  ->  (2+3) -> 5
    let_("x", mul(lit(0), v("y")), v("x"))    // let x = (0*y) in x  -> 0
  );
  
  console.log("\n1. ORIGINAL PROGRAM");
  console.log("Program:", show(prog));
  
  console.log("\n2. STEP-BY-STEP REWRITING");
  const trace = applyRulesWithTrace(prog, defaultRules);
  
  console.log("Rewrite steps:");
  for (const step of trace.steps) {
    console.log(`  ${step.rule}: ${step.before} → ${step.after}`);
  }
  
  console.log(`\nTotal iterations: ${trace.iterations}`);
  console.log("Final result:", show(trace.result));
  
  console.log("\n3. RULE REGISTRY DEMO");
  
  // Test selective rule application
  const foldingOnly = defaultRegistry.applyRules(prog, ["fold/add", "fold/mul"]);
  console.log("Folding only:", show(foldingOnly));
  
  const peepholeOnly = defaultRegistry.applyRules(prog, ["mul/one", "add/zero"]);
  console.log("Peephole only:", show(peepholeOnly));
  
  const inliningOnly = defaultRegistry.applyRules(prog, ["inline/let-var"]);
  console.log("Inlining only:", show(inliningOnly));

  console.log("\n4. CUSTOM RULES");
  
  // Add a custom rule for commutativity
  const commutativeAdd: Rule = {
    name: "commute/add",
    optic: _Add,
    step: (t) => {
      if (t._tag !== "Impure") return t;
      const n = t.node;
      if (n.tag === "Add" && n.left._tag === "Impure" && n.left.node.tag === "Var" &&
          n.right._tag === "Impure" && n.right.node.tag === "Lit") {
        // Swap var + lit to lit + var (canonical form)
        return add(n.right, n.left);
      }
      return t;
    }
  };
  
  defaultRegistry.register(commutativeAdd);
  
  const testCommute = add(v("x"), lit(42));
  console.log("Before commute:", show(testCommute));
  const afterCommute = defaultRegistry.applyRules(testCommute, ["commute/add"]);
  console.log("After commute:", show(afterCommute));

  console.log("\n5. COMPLEX OPTIMIZATION");
  
  const complex = add(
    mul(add(lit(1), lit(2)), lit(0)),  // (1+2)*0 -> 0
    let_("y", add(lit(5), lit(5)), add(v("y"), lit(0)))  // let y = 5+5 in y+0 -> 10
  );
  
  console.log("Complex program:", show(complex));
  const optimized = defaultRegistry.applyRules(complex);
  console.log("Fully optimized:", show(optimized));

  console.log("\n" + "=".repeat(80));
  console.log("OPTICS REWRITING FEATURES:");
  console.log("✓ Profunctor optics (prisms, traversals) for term manipulation");
  console.log("✓ Self-prisms for pattern matching on AST nodes");
  console.log("✓ Generic rewrite engine with optic composition");
  console.log("✓ Rule registry with selective application");
  console.log("✓ Trace generation for debugging optimizations");
  console.log("✓ Constant folding, peephole optimization, inlining");
  console.log("✓ Fixpoint rewriting with termination guarantees");
  console.log("=".repeat(80));
  
  console.log("\n🎯 PROGRAM OPTIMIZATION PIPELINE:");
  console.log("• Parse → AST → Optics-driven rewriting → Optimized AST → Interpret");
  console.log("• Lawful transformations preserve program semantics");
  console.log("• Local rewrites compose to global optimizations");
  console.log("• Rule registry enables modular optimization strategies");
}
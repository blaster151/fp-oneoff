// optics-rewrite.ts
// Optics-driven program rewriting for a tiny Free DSL in TypeScript.
// - minimal self-prism / traversal machinery (profunctor-flavored API)
// - Free<ExprF, A> term representation
// - rewrite(optic, f): Free -> Free
// - rewriteW(expr, rules): Writer<string[], Expr> with logged rule applications
// - tiny rule registry: constant folding, peephole, inlining
//
// Run: ts-node optics-rewrite.ts

import { Writer } from './strong-monad.js';

/********************** Tiny "profunctor-ish" optics **************************/
export interface RewritePrism<S, A> {
  readonly preview: (s: S) => A | undefined; // match
  readonly review: (a: A) => S;              // build (often identity for self-prisms)
  modify: (s: S, f: (a: A) => A) => S;       // default via preview/review
}

export interface Traversal<S, A> {
  modify: (s: S, f: (a: A) => A) => S;
}

// Compose prisms
export function composePrism<S, A, B>(p1: RewritePrism<S, A>, p2: RewritePrism<A, B>): RewritePrism<S, B> {
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
export function traversalFromPrism<S>(p: RewritePrism<S, S>): Traversal<S, S> {
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
export function selfPrism(pred: (t:Term)=>boolean): RewritePrism<Term, Term> {
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

/********************** Writer-logged rewriting *****************************/

/** Path tracking for rule applications */
export type Path = string[];

/** Writer monad utilities for logging */
const stringArrayMonoid = {
  empty: [] as string[],
  concat: (a: string[], b: string[]) => [...a, ...b]
};

/** Create a Writer value */
export function writer<W, A>(value: A, log: W): Writer<W, A> {
  return [value, log];
}

/** Map over Writer value */
export function mapWriter<W, A, B>(wa: Writer<W, A>, f: (a: A) => B): Writer<W, B> {
  return [f(wa[0]), wa[1]];
}

/** Bind for Writer monad */
export function bindWriter<W, A, B>(
  wa: Writer<W, A>, 
  k: (a: A) => Writer<W, B>,
  monoid: { empty: W; concat: (w1: W, w2: W) => W }
): Writer<W, B> {
  const [a, w1] = wa;
  const [b, w2] = k(a);
  return [b, monoid.concat(w1, w2)];
}

/** Convert path to string representation */
export function pathToString(path: Path): string {
  return path.length === 0 ? "root" : path.join(".");
}

/** Apply a single rule with Writer logging and path tracking */
export function applyRuleWithWriter(
  t: Term, 
  rule: Rule, 
  path: Path = []
): Writer<string[], Term> {
  const result = rule.optic.modify(t, rule.step);
  const applied = !eqTerm(result, t);
  
  if (applied) {
    const logEntry = `Rule: ${rule.name} at path ${pathToString(path)}`;
    return writer(result, [logEntry]);
  } else {
    return writer(t, []);
  }
}

/** Apply rules with Writer logging - one iteration */
export function applyRulesOnceWithWriter(
  t: Term, 
  rules: Rule[], 
  path: Path = []
): Writer<string[], Term> {
  // Try each rule until one applies
  for (const rule of rules) {
    const [result, log] = applyRuleWithWriter(t, rule, path);
    if (log.length > 0) {
      // Rule applied, now recursively apply to children with updated paths
      const childrenResult = mapChildrenWithWriter(result, (child, childPath) => 
        applyRulesOnceWithWriter(child, rules, childPath)
      );
      return bindWriter(writer(result, log), 
        () => childrenResult, 
        stringArrayMonoid
      );
    }
  }
  
  // No rule applied at this level, try children
  return mapChildrenWithWriter(t, (child, childPath) => 
    applyRulesOnceWithWriter(child, rules, childPath)
  );
}

/** Map over children with path tracking */
export function mapChildrenWithWriter<A>(
  t: Free<A>, 
  f: (child: Free<A>, path: Path) => Writer<string[], Free<A>>
): Writer<string[], Free<A>> {
  if (t._tag === "Pure") return writer(t, []);
  
  const n = t.node;
  switch (n.tag) {
    case "Lit":
    case "Var":
      return writer(t, []);
      
    case "Add": {
      const [leftResult, leftLog] = f(n.left, ["left"]);
      const [rightResult, rightLog] = f(n.right, ["right"]);
      const combinedLog = stringArrayMonoid.concat(leftLog, rightLog);
      const newNode = Impure({ tag: "Add", left: leftResult, right: rightResult });
      return writer(newNode, combinedLog);
    }
    
    case "Mul": {
      const [leftResult, leftLog] = f(n.left, ["left"]);
      const [rightResult, rightLog] = f(n.right, ["right"]);
      const combinedLog = stringArrayMonoid.concat(leftLog, rightLog);
      const newNode = Impure({ tag: "Mul", left: leftResult, right: rightResult });
      return writer(newNode, combinedLog);
    }
    
    case "Let": {
      const [boundResult, boundLog] = f(n.bound, ["bound"]);
      const [bodyResult, bodyLog] = f(n.body, ["body"]);
      const combinedLog = stringArrayMonoid.concat(boundLog, bodyLog);
      const newNode = Impure({ tag: "Let", name: n.name, bound: boundResult, body: bodyResult });
      return writer(newNode, combinedLog);
    }
    
    default:
      return writer(t, []);
  }
}

/** Writer-logged fixpoint rewriting */
export function rewriteW(expr: Term, rules: Rule[], maxIters: number = 100): Writer<string[], Term> {
  let current = writer(expr, [] as string[]);
  let iterations = 0;
  
  while (iterations < maxIters) {
    const [currentTerm, currentLog] = current;
    const [nextTerm, nextLog] = applyRulesOnceWithWriter(currentTerm, rules);
    
    // If no new logs, no rules applied - we're done
    if (nextLog.length === 0) {
      return current;
    }
    
    // Combine logs and continue
    const combinedLog = stringArrayMonoid.concat(currentLog, nextLog);
    current = writer(nextTerm, combinedLog);
    iterations++;
    
    // Check for convergence
    if (eqTerm(currentTerm, nextTerm)) {
      break;
    }
  }
  
  return current;
}

/** Enhanced rewriteW with detailed path information */
export function rewriteWDetailed(expr: Term, rules: Rule[], maxIters: number = 100): Writer<string[], Term> {
  const detailedRules = rules.map(rule => ({
    ...rule,
    name: `${rule.name}${rule.optic === _Add ? '/Add' : rule.optic === _Mul ? '/Mul' : rule.optic === _Let ? '/Let' : ''}`
  }));
  
  return rewriteW(expr, detailedRules, maxIters);
}

/********************** Pretty printing for Writer logs ***********************/

/** Pretty print Writer logs */
export function prettyLog(writerResult: Writer<string[], Term>): string {
  const [result, logs] = writerResult;
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("REWRITE LOG");
  lines.push("=".repeat(60));
  
  if (logs.length === 0) {
    lines.push("No rules applied - expression already in normal form");
  } else {
    lines.push(`Applied ${logs.length} rule(s):`);
    logs.forEach((log, i) => {
      lines.push(`  ${i + 1}. ${log}`);
    });
  }
  
  lines.push("");
  lines.push("Final result: " + show(result));
  lines.push("=".repeat(60));
  
  return lines.join("\n");
}

/** Pretty print with side-by-side comparison */
export function prettyComparison(
  original: Term,
  plainResult: Term,
  writerResult: Writer<string[], Term>
): string {
  const [loggedResult, logs] = writerResult;
  const lines: string[] = [];
  
  lines.push("=".repeat(80));
  lines.push("PLAIN REWRITE vs WRITER-LOGGED REWRITE");
  lines.push("=".repeat(80));
  
  lines.push("Original expression:");
  lines.push("  " + show(original));
  lines.push("");
  
  lines.push("Plain rewrite result:");
  lines.push("  " + show(plainResult));
  lines.push("");
  
  lines.push("Writer-logged rewrite result:");
  lines.push("  " + show(loggedResult));
  lines.push("");
  
  // Verify results are the same
  const sameResult = eqTerm(plainResult, loggedResult);
  lines.push(`Results match: ${sameResult ? "✅" : "❌"}`);
  lines.push("");
  
  lines.push("Rule application trace:");
  if (logs.length === 0) {
    lines.push("  (no rules applied)");
  } else {
    logs.forEach((log, i) => {
      lines.push(`  ${i + 1}. ${log}`);
    });
  }
  
  lines.push("=".repeat(80));
  
  return lines.join("\n");
}

/********************** Integration with existing optics *******************/

/** Adapter to use existing profunctor optics with the rewrite system */
export function adaptProfunctorOptic<S, A>(
  // This would integrate with existing CatkitOptics or OpticsFree
  // For now, we provide a simple adapter interface
  getter: (s: S) => A | undefined,
  setter: (s: S, a: A) => S
): RewritePrism<S, A> {
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
  
  console.log("\n6. WRITER-LOGGED REWRITING PREVIEW");
  
  const writerDemo = add(mul(lit(1), lit(3)), lit(0));
  console.log("Writer demo program:", show(writerDemo));
  
  const writerResult = rewriteW(writerDemo, defaultRules);
  const [writerFinal, writerLogs] = writerResult;
  
  console.log("Writer-logged result:", show(writerFinal));
  console.log("Rule trace:");
  writerLogs.forEach((log, i) => {
    console.log(`  ${i + 1}. ${log}`);
  });
  
  console.log("\nFor full Writer-logged rewriting demo, see writer-rewrite-demo.ts");
}
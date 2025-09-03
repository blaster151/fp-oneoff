---
id: THM-SHIFT-RESET
title: Delimited continuations (shift/reset)
source:
  - type: paper
    where: "Danvy & Filinski (1990), 'Abstracting control'"
    pages: [151-160]
  - type: paper
    where: "Biernacki et al. (2006), 'Control delimiters and their hierarchies'"
    pages: [1-15]
---

**Statement (LaTeX).**
Delimited control operators with one delimiter level:
$$
\begin{align}
\text{reset} &: \text{Cont}(A, A) \to \text{Cont}(R, A) \\
\text{shift} &: ((A \to \text{Cont}(R, R)) \to \text{Cont}(R, R)) \to \text{Cont}(R, A)
\end{align}
$$

**Operational Semantics.**
- `reset(m)` evaluates `m` with identity continuation in isolated scope
- `shift(f)` captures continuation up to nearest reset, reifies as function
- Multiple resumption: captured continuation can be called multiple times

**Key Properties.**
$$
\begin{align}
\text{reset}(\text{shift}(k \mapsto k(v))) &= v \\
\text{reset}(\text{shift}(k \mapsto e)) &= \text{reset}(e) \quad \text{if } k \notin \text{FV}(e)
\end{align}
$$

**Implications (TypeScript).**
- `reset<R, A>(m: Cont<A, A>): Cont<R, A>` - delimiter boundary
- `shift<R, A>(f: (k: CapturedCont<R, A>) => Cont<R, R>): Cont<R, A>` - control capture
- `CapturedCont<R, A> = (a: A) => Cont<R, R>` - reified continuation type
- Integration with `callCC` for escape continuations

**Test Hooks.**
- `src/types/__tests__/cont.test.ts` - Basic shift/reset examples
- `src/types/__tests__/cps.test.ts` - Advanced control flow patterns
- `src/examples/shift-reset-demo.ts` - Worked examples

**Future Unlocks.**
- Multi-prompt delimited control (shift₀/reset₀, shift₁/reset₁, ...)
- Algebraic effects and handlers via delimited continuations
- Coroutines and generators from control operators
- Applications to parsing and backtracking algorithms
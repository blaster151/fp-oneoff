// freeapp-effects-demo.ts
// Comprehensive demonstration of the FreeApplicative + Coyoneda effect system
// Shows modular interpreters, natural transformations, and optics retargeting

import { 
  FreeAp, faOf, faMap, faAp, faLift2, faLift3, field, foldMap,
  natFormToReaderValidation, natFormToDoc, DocOps, readerOps,
  Env, Validation, Reader, lens, viaLens, demo
} from "../types/freeapp-coyo.js";

console.log("=".repeat(80));
console.log("COMPREHENSIVE FREE APPLICATIVE EFFECTS DEMO");
console.log("=".repeat(80));

// Run the main demo
demo();

console.log("\n" + "=".repeat(80));
console.log("ADDITIONAL EFFECT SYSTEM EXAMPLES");
console.log("=".repeat(80));

console.log("\n1. COMPLEX FORM VALIDATION");

// More complex form with multiple field types
const parseEmail = (s: string) => {
  if (!s.includes("@")) throw new Error("invalid email format");
  return s;
};

const parseAge = (s: string) => {
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 0 || n > 150) throw new Error("age must be 0-150");
  return n;
};

const parseBoolean = (s: string) => {
  if (s === "true" || s === "yes" || s === "1") return true;
  if (s === "false" || s === "no" || s === "0") return false;
  throw new Error("must be true/false, yes/no, or 1/0");
};

// Build a user registration form
const registrationForm = faLift3(
  (email: string, age: number, newsletter: boolean) => ({ email, age, newsletter }),
  field("email", parseEmail, "email"),
  field("age", parseAge, "0-150"),
  field("newsletter", parseBoolean, "true/false")
);

console.log("Registration form built statically");

// Test with various environments
const goodEnv = { email: "ada@example.com", age: "30", newsletter: "true" };
const badEnv = { email: "not-email", age: "200", newsletter: "maybe" };
const partialEnv = { email: "bob@test.com", age: "25" }; // missing newsletter

const RVops = readerOps<Env, string>();
const runRegistration = foldMap(RVops as any, natFormToReaderValidation as any, registrationForm);

console.log("\nValidation results:");
console.log("Good env:", runRegistration(goodEnv));
console.log("Bad env:", runRegistration(badEnv));
console.log("Partial env:", runRegistration(partialEnv));

console.log("\n2. DOCUMENTATION GENERATION");

// Generate documentation for the registration form
const regDoc = foldMap(DocOps, natFormToDoc, registrationForm);
console.log("Registration form documentation:");
regDoc._doc.forEach(line => console.log(`  • ${line}`));

console.log("\n3. NESTED ENVIRONMENT RETARGETING");

// Demonstrate lens-based retargeting to nested environments
type AppConfig = {
  database: { url: string; port: string };
  form: Env;
  logging: { level: string };
};

const formLens = lens<AppConfig, Env>(
  config => config.form,
  (config, form) => ({ ...config, form })
);

const nestedNat = viaLens(formLens, natFormToReaderValidation);
const runNested = foldMap(
  readerOps<AppConfig, string>() as any,
  nestedNat as any,
  registrationForm
);

const appConfig: AppConfig = {
  database: { url: "localhost", port: "5432" },
  form: goodEnv,
  logging: { level: "info" }
};

console.log("Nested config result:", runNested(appConfig));

console.log("\n4. EFFECT COMPOSITION PATTERNS");

// Show different composition patterns
const simpleField = field("simple", (s: string) => s);
const numberField = field("number", parseAge);

// Sequential composition
const sequential = faLift2(
  (a: string, b: number) => `${a}-${b}`,
  simpleField,
  numberField
);

// Parallel composition (same as sequential for Applicative)
const parallel = faAp(faMap(simpleField, (a: string) => (b: number) => `${a}+${b}`), numberField);

console.log("Effect composition patterns demonstrated:");
console.log("  • Sequential: combine results with function application");
console.log("  • Parallel: same as sequential for Applicative (no sequencing)");
console.log("  • Validation: accumulate all errors before failing");
console.log("  • Documentation: collect all field specs without execution");

console.log("\n" + "=".repeat(80));
console.log("EFFECT SYSTEM ACHIEVEMENTS:");
console.log("✓ Static effect composition without runtime overhead");
console.log("✓ Modular interpreters via natural transformations");
console.log("✓ Error accumulation with Validation applicative");
console.log("✓ Environment flexibility via Reader and Lens composition");
console.log("✓ Documentation generation without program execution");
console.log("✓ Multiple target runtimes from single effect description");
console.log("=".repeat(80));

console.log("\n🎯 PRACTICAL APPLICATIONS:");
console.log("• Form validation with comprehensive error reporting");
console.log("• Configuration parsing with environment flexibility");
console.log("• API specification generation from effect descriptions");
console.log("• Multi-target compilation via interpreter composition");
console.log("• Static analysis of effect dependencies before execution");
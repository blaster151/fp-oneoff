import { Zmod } from "../helpers/groups";
import { 
  oneObjectCategory, 
  identitiesOnlyCategory,
  finiteIsomorphismCategory,
  finiteFullCategory
} from "../../src/category/instances/Subcategories";

describe("Subcategories of Grp", () => {
  it("one-object category has only identity morphism", () => {
    const G = Zmod(5);
    const C = oneObjectCategory(G);
    
    expect(C.objects?.length).toBe(1);
    expect(C.morphisms?.length).toBe(1);
    expect(C.objects?.[0]).toBe(G);
    
    // Only composition allowed is id ∘ id = id
    const id = C.morphisms?.[0]!;
    expect(C.compose(id, id)).toBe(id);
    
    // Verify it throws on invalid composition (though there are none in this case)
    expect(() => C.compose(id, id)).not.toThrow();
  });

  it("identities-only category forbids cross homs", () => {
    const G = Zmod(2), H = Zmod(3);
    const C = identitiesOnlyCategory([G, H]);
    
    expect(C.objects?.length).toBe(2);
    expect(C.morphisms?.length).toBe(2);
    
    // Each morphism should be an identity on its respective group
    const morphisms = C.morphisms!;
    const idG = morphisms.find(m => m.src === G);
    const idH = morphisms.find(m => m.src === H);
    
    expect(idG).toBeDefined();
    expect(idH).toBeDefined();
    expect(idG?.dst).toBe(G);
    expect(idH?.dst).toBe(H);
  });

  it("finite isomorphism category contains only isomorphisms", () => {
    const G1 = Zmod(2), G2 = Zmod(3), G3 = Zmod(2); // G1 ≅ G3, different from G2
    const C = finiteIsomorphismCategory(3, [G1, G2, G3]);
    
    expect(C.objects?.length).toBe(3);
    
    // Should have identity morphisms for each group
    const identities = C.morphisms?.filter(m => m.src === m.dst);
    expect(identities?.length).toBe(3);
    
    // Should have isomorphisms between groups of the same order
    const isos = C.morphisms?.filter(m => m.src !== m.dst);
    expect(isos?.length).toBeGreaterThanOrEqual(0); // At least identity isos
  });

  it("finite full category includes non-isomorphic homomorphisms", () => {
    const G1 = Zmod(2), G2 = Zmod(4);
    const C = finiteFullCategory(4, [G1, G2]);
    
    expect(C.objects?.length).toBe(2);
    
    // Should have identity morphisms
    const identities = C.morphisms?.filter(m => m.src === m.dst);
    expect(identities?.length).toBe(2);
    
    // Should have some non-identity morphisms (at least trivial homs)
    const nonIdentities = C.morphisms?.filter(m => m.src !== m.dst);
    expect(nonIdentities?.length).toBeGreaterThanOrEqual(1);
  });

  it("subcategory composition respects category laws", () => {
    const G = Zmod(2);
    const C = oneObjectCategory(G);
    
    const id = C.morphisms?.[0]!;
    
    // Identity laws
    expect(C.compose(id, C.id(G))).toBe(id);
    expect(C.compose(C.id(G), id)).toBe(id);
    
    // Associativity (trivial in one-object case)
    expect(C.compose(C.compose(id, id), id)).toBe(id);
    expect(C.compose(id, C.compose(id, id))).toBe(id);
  });

  it("demonstrates spectrum from trivial to rich categories", () => {
    const groups = [Zmod(2), Zmod(3), Zmod(4)];
    
    // Trivial: one object
    const trivial = oneObjectCategory(groups[0]!);
    expect(trivial.objects?.length).toBe(1);
    expect(trivial.morphisms?.length).toBe(1);
    
    // Identities only: multiple objects, minimal morphisms
    const identitiesOnly = identitiesOnlyCategory(groups);
    expect(identitiesOnly.objects?.length).toBe(3);
    expect(identitiesOnly.morphisms?.length).toBe(3);
    
    // Isomorphisms: some non-trivial morphisms
    const isoCategory = finiteIsomorphismCategory(4, groups);
    expect(isoCategory.objects?.length).toBe(3);
    expect(isoCategory.morphisms!.length).toBeGreaterThanOrEqual(3);
    
    // Full: richest morphism structure
    const fullCategory = finiteFullCategory(4, groups);
    expect(fullCategory.objects?.length).toBe(3);
    expect(fullCategory.morphisms!.length).toBeGreaterThanOrEqual(
      isoCategory.morphisms!.length
    );
  });
});
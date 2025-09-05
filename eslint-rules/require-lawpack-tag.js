/**
 * Warn if a module exports a "structure interface" or "instance" but
 * lacks a `@lawpack <Tag>` JSDoc on the exported symbol.
 *
 * This is a *nudge*; CI enforcement is done by the audit script.
 */
const STRUCTURE_NAMES = [
  "Monoid","Group","AbGroup","Ring","Ideal","Poset","Lattice","CompleteLattice",
  "CPO","Functor","HFunctor","Applicative","Monad","Adjunction","GaloisConnection",
  "Category","FunctorCT","NaturalTransformation","Iso"
];

module.exports = {
  meta: { type: "suggestion", docs: { description: "Require @lawpack tag for exported structures" }, schema: [] },
  create(ctx) {
    function hasLawpackTag(jsdoc) {
      return jsdoc && /@lawpack\s+[\w\/~=\^\(\)\[\]\+\.\s-]+/.test(jsdoc);
    }
    return {
      ExportNamedDeclaration(node) {
        const src = ctx.getSourceCode();
        const leading = node.leadingComments && node.leadingComments.length
          ? src.getText(node.leadingComments[node.leadingComments.length-1])
          : "";
        const decl = node.declaration;
        if (!decl) return;
        // Exported interface or const with a name that looks structural
        if (decl.type === "TSInterfaceDeclaration" || decl.type === "TSTypeAliasDeclaration") {
          if (STRUCTURE_NAMES.includes(decl.id.name) && !hasLawpackTag(leading)) {
            ctx.report({ node, message: `Exported ${decl.id.name} missing @lawpack <Tag> JSDoc.` });
          }
        }
        if (decl.type === "VariableDeclaration") {
          for (const v of decl.declarations) {
            const name = v.id && v.id.name;
            if (name && STRUCTURE_NAMES.some(k => new RegExp(k, "i").test(name)) && !hasLawpackTag(leading)) {
              ctx.report({ node, message: `Exported ${name} missing @lawpack <Tag> JSDoc.` });
            }
          }
        }
      }
    };
  }
};
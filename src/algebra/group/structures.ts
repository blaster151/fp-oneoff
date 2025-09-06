// Minimal shared structures for subgroup/iso/cosets
import { FiniteGroup as Group } from "../../structures/group/Group.js";
import { GroupHom } from "../../structures/group/Hom.js";

// Re-export canonical interfaces with aliases for backward compatibility
export { Group, GroupHom };

export interface Subgroup<A> extends Group<A> {
  // subset of some ambient group; we keep ambient implicit for now
}

export interface GroupIso<A,B> {
  source: Group<A>;
  target: Group<B>;
  to: GroupHom<A,B>;
  from: GroupHom<B,A>;
  // Optional sanity checks a test can run:
  leftInverse?: boolean;   // from ∘ to = id
  rightInverse?: boolean;  // to ∘ from = id
}
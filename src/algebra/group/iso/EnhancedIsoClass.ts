// EnhancedIsoClass.ts
// Enhanced isomorphism class that integrates with existing Group infrastructure

import { Group } from "../structures";
import { IsoClass } from "./IsoClass";
import { groupToIsoClass } from "./GroupToTable";

/**
 * Enhanced isomorphism class that wraps a Group and provides canonical classification
 */
export class EnhancedIsoClass<G> {
  private _isoClass: IsoClass;
  private _canonicalName?: string;
  
  constructor(
    readonly group: Group<G>,
    canonicalName?: string
  ) {
    this._isoClass = groupToIsoClass(group);
    this._canonicalName = canonicalName;
  }
  
  get size(): number { return this._isoClass.size; }
  get key(): string { return this._isoClass.key; }
  get canonicalName(): string | undefined { return this._canonicalName; }
  
  /**
   * Check if this group is isomorphic to another group
   */
  isIsomorphicTo(other: EnhancedIsoClass<any>): boolean {
    return this._isoClass.equals(other._isoClass);
  }
  
  /**
   * Check if this group is isomorphic to a group with the given canonical key
   */
  isIsomorphicToKey(key: string): boolean {
    return this.key === key;
  }
  
  /**
   * Set the canonical name for this isomorphism class
   */
  setCanonicalName(name: string): void {
    this._canonicalName = name;
  }
  
  /**
   * Get a string representation of this isomorphism class
   */
  toString(): string {
    const name = this.canonicalName || `Group_${this.size}`;
    return `${name} (key: ${this.key})`;
  }
}

/**
 * Registry of known isomorphism classes by canonical key
 */
export class IsoClassRegistry {
  private registry = new Map<string, { name: string; description?: string }>();
  
  /**
   * Register a canonical isomorphism class
   */
  register(key: string, name: string, description?: string): void {
    this.registry.set(key, { name, description });
  }
  
  /**
   * Get the canonical name for a key
   */
  getName(key: string): string | undefined {
    return this.registry.get(key)?.name;
  }
  
  /**
   * Get the description for a key
   */
  getDescription(key: string): string | undefined {
    return this.registry.get(key)?.description;
  }
  
  /**
   * Check if a key is registered
   */
  isRegistered(key: string): boolean {
    return this.registry.has(key);
  }
  
  /**
   * List all registered keys
   */
  listKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Global registry instance
export const globalIsoRegistry = new IsoClassRegistry();

/**
 * Create an enhanced isomorphism class and optionally register it
 */
export function createEnhancedIsoClass<G>(
  group: Group<G>,
  canonicalName?: string,
  description?: string
): EnhancedIsoClass<G> {
  const enhanced = new EnhancedIsoClass(group, canonicalName);
  
  if (canonicalName) {
    globalIsoRegistry.register(enhanced.key, canonicalName, description);
  }
  
  return enhanced;
}

/**
 * Auto-classify a group by checking against known canonical types
 */
export function autoClassifyGroup<G>(group: Group<G>): EnhancedIsoClass<G> {
  const enhanced = new EnhancedIsoClass(group);
  
  // Check if this key is already registered
  const knownName = globalIsoRegistry.getName(enhanced.key);
  if (knownName) {
    enhanced.setCanonicalName(knownName);
  }
  
  return enhanced;
}
import { useEffect, useRef, useCallback } from "react";
import { useDebounce } from "./use-debounce";
import type { Block } from "@blocknote/core";

export interface BlogDraft {
  id?: number;
  title: string;
  content: Block[];
  lastSaved: Date;
  isNew: boolean;
}

const DRAFT_KEY_PREFIX = "blog-draft-";
const AUTO_SAVE_DELAY = 2000; // 2 seconds

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export function useAutoSave(
  draft: BlogDraft,
  onSave?: (draft: BlogDraft) => void
) {
  const mounted = useRef<boolean>(false);
  const lastSavedRef = useRef<string>("");
  
  // Debounce the draft to avoid saving too frequently
  const debouncedDraft = useDebounce(draft, AUTO_SAVE_DELAY);
  
  // Generate a unique key for this draft
  const getDraftKey = useCallback((id?: number) => {
    return `${DRAFT_KEY_PREFIX}${id ?? "new"}`;
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback((draftToSave: BlogDraft) => {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      const draftKey = getDraftKey(draftToSave.id);
      const draftWithTimestamp: BlogDraft = {
        ...draftToSave,
        lastSaved: new Date(),
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp));
      
      if (onSave) {
        onSave(draftWithTimestamp);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      return false;
    }
  }, [getDraftKey, onSave]);

  // Load draft from localStorage
  const loadDraft = useCallback((id?: number): BlogDraft | null => {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage is not available");
      return null;
    }

    try {
      const draftKey = getDraftKey(id);
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as BlogDraft;
        return {
          ...parsed,
          lastSaved: new Date(parsed.lastSaved),
        };
      }
      
      return null;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, [getDraftKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback((id?: number) => {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      const draftKey = getDraftKey(id);
      localStorage.removeItem(draftKey);
      return true;
    } catch (error) {
      console.error("Failed to clear draft:", error);
      return false;
    }
  }, [getDraftKey]);

  // Get all saved drafts
  const getAllDrafts = useCallback((): BlogDraft[] => {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage is not available");
      return [];
    }

    try {
      const drafts: BlogDraft[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DRAFT_KEY_PREFIX)) {
          const draftData = localStorage.getItem(key);
          if (draftData) {
            try {
              const parsed = JSON.parse(draftData) as BlogDraft;
              drafts.push({
                ...parsed,
                lastSaved: new Date(parsed.lastSaved),
              });
            } catch (parseError) {
              console.warn(`Failed to parse draft data for key ${key}:`, parseError);
            }
          }
        }
      }
      
      return drafts.sort((a, b) => 
        new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime()
      );
    } catch (error) {
      console.error("Failed to load drafts:", error);
      return [];
    }
  }, []);

  // Check if draft has meaningful content
  const hasContent = useCallback((draftToCheck: BlogDraft): boolean => {
    const hasTitle = draftToCheck.title.trim().length > 0;
    const hasBlocks = Array.isArray(draftToCheck.content) && draftToCheck.content.length > 0;
    return hasTitle || hasBlocks;
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Only save if the content has actually changed
    const currentDraftString = JSON.stringify({
      title: debouncedDraft.title,
      content: debouncedDraft.content,
    });

    const hasChanges = currentDraftString !== lastSavedRef.current;
    const hasMeaningfulContent = hasContent(debouncedDraft);

    if (hasChanges && hasMeaningfulContent) {
      lastSavedRef.current = currentDraftString;
      saveDraft(debouncedDraft);
    }
  }, [debouncedDraft, saveDraft, hasContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    getAllDrafts,
  };
} 
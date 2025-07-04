"use client";

import dynamic from "next/dynamic";
import type { Block, PartialBlock } from "@blocknote/core";

// Dynamic import with SSR disabled to prevent "document is not defined" error
const BlockNoteEditor = dynamic(
  () => import("./blocknote-editor").then((mod) => ({ default: mod.BlockNoteEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] rounded-md border border-input bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }
);

interface DynamicBlockNoteEditorProps {
  content?: PartialBlock[];
  onChange?: (content: Block[]) => void;
  availableImages?: Array<{ name: string; url: string; path: string }>;
  placeholder?: string;
  editable?: boolean;
}

export function DynamicBlockNoteEditor(props: DynamicBlockNoteEditorProps) {
  return <BlockNoteEditor {...props} />;
} 
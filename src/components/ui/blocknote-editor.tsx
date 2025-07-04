"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { codeBlock } from "@blocknote/code-block";
import type { Block, PartialBlock } from "@blocknote/core";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface BlockNoteEditorProps {
  content?: PartialBlock[];
  onChange?: (content: Block[]) => void;
  availableImages?: Array<{ name: string; url: string; path: string }>;
  placeholder?: string;
  editable?: boolean;
}

export function BlockNoteEditor({
  content,
  onChange,
  availableImages = [],
  placeholder: _placeholder = "Start writing...",
  editable = true,
}: BlockNoteEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const { theme } = useTheme();

  // Prepare initial content - BlockNote requires undefined or non-empty array
  const initialContent = content && content.length > 0 ? content : undefined;

  const editor = useCreateBlockNote({
    codeBlock,
    initialContent,
    uploadFile: async (file: File) => {
      // Handle file upload - return a promise that resolves to the file URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    },
  });

  const handleInsertImage = (imageUrl: string) => {
    if (imageUrl) {
      // Insert image into BlockNote editor
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks(
        [
          {
            type: "image",
            props: {
              url: imageUrl,
            },
          },
        ],
        currentBlock,
        "after"
      );
      setShowImageDialog(false);
      setCustomImageUrl("");
    }
  };

  return (
    <div className="w-full">
      {editable && (
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Insert Image
          </Button>
        </div>
      )}

      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme === "dark" ? "dark" : "light"}
        onChange={() => {
          if (onChange) {
            onChange(editor.document);
          }
        }}
        className="min-h-[400px] rounded-md border border-input"
      />

      {/* Image Insert Dialog */}
      {editable && showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Insert Image</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label>Upload New Image</Label>
                    <PhotoUploader
                      onUploadComplete={(url) => handleInsertImage(url)}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="gallery" className="space-y-4">
                  <div>
                    <Label>Select from Gallery</Label>
                    {availableImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {availableImages.map((image) => (
                          <div
                            key={image.path}
                            className="cursor-pointer rounded-lg border p-2 hover:bg-accent"
                            onClick={() => handleInsertImage(image.url)}
                          >
                            <div className="aspect-square relative mb-2">
                              <Image
                                src={image.url}
                                alt={image.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <p className="text-sm font-medium truncate">
                              {image.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        No images available in gallery
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="customUrl">Image URL</Label>
                    <Input
                      id="customUrl"
                      placeholder="https://example.com/image.jpg"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                    />
                    <Button
                      onClick={() => handleInsertImage(customImageUrl)}
                      className="mt-2 w-full"
                      disabled={!customImageUrl}
                    >
                      Insert Image
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
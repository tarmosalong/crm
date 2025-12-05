"use client";

import { useState } from "react";
import { createTag, deleteTag } from "@/actions/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  tags: Tag[];
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

export function TagManager({ tags: initialTags }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsCreating(true);
    const formData = new FormData();
    formData.set("name", newTagName.trim());
    formData.set("color", selectedColor);

    const result = await createTag({}, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Tag created");
      // Add the new tag to local state (optimistic update)
      setTags([...tags, { id: Date.now().toString(), name: newTagName.trim(), color: selectedColor }]);
      setNewTagName("");
    }
    setIsCreating(false);
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setDeletingId(id);
    const result = await deleteTag(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Tag deleted");
      setTags(tags.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Existing Tags */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-300">Existing Tags</h4>
        {tags.length === 0 ? (
          <p className="text-sm text-slate-500">No tags created yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700"
              >
                <Badge
                  variant="outline"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={deletingId === tag.id}
                  className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {deletingId === tag.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Tag */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Create New Tag</h4>
        <div className="flex gap-3">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name..."
            className="bg-slate-900/50 border-slate-600 text-white max-w-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
          />
          <div className="flex gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color ? "ring-2 ring-white scale-110" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button
            onClick={handleCreateTag}
            disabled={isCreating || !newTagName.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        {/* Preview */}
        {newTagName && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Preview:</span>
            <Badge
              variant="outline"
              style={{ borderColor: selectedColor, color: selectedColor }}
            >
              {newTagName}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}


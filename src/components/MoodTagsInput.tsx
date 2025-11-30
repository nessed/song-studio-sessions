import { useState } from "react";
import { X, Plus } from "lucide-react";

interface MoodTagsInputProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export function MoodTagsInput({ tags, onUpdate }: MoodTagsInputProps) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdate([...tags, newTag.trim()]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const handleRemove = (tag: string) => {
    onUpdate(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTag("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span key={tag} className="tag-pill group pr-1.5">
          {tag}
          <button
            onClick={() => handleRemove(tag)}
            className="ml-1.5 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {isAdding ? (
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!newTag.trim()) setIsAdding(false);
          }}
          placeholder="Tag name"
          autoFocus
          className="input-inline text-xs px-2 py-1 w-24 bg-secondary rounded-full"
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="tag-pill opacity-60 hover:opacity-100 transition-opacity"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add tag
        </button>
      )}
    </div>
  );
}
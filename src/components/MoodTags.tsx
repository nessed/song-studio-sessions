import { useState } from "react";

interface MoodTagsProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export function MoodTags({ tags, onUpdate }: MoodTagsProps) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdate([...tags, newTag.trim()]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTag();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="tag-pill group">
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${tag}`}
          >
            ×
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
          className="input-inline text-xs w-20 px-2 py-0.5 border border-border rounded-full"
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + Add tag
        </button>
      )}
    </div>
  );
}

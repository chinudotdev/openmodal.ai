"use client";

import { Type, Image, Volume2, Video } from "lucide-react";

interface ModalityFiltersProps {
  inputModalities: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
  };
  outputModalities: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
  };
  onInputChange: (
    modality: keyof ModalityFiltersProps["inputModalities"],
  ) => void;
  onOutputChange: (
    modality: keyof ModalityFiltersProps["outputModalities"],
  ) => void;
}

export default function ModalityFilters({
  inputModalities,
  outputModalities,
  onInputChange,
  onOutputChange,
}: ModalityFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Input Modalities */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Input Modalities
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onInputChange("text")}
            className={`p-2 rounded-md border transition-colors ${
              inputModalities.text
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onInputChange("image")}
            className={`p-2 rounded-md border transition-colors ${
              inputModalities.image
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onInputChange("audio")}
            className={`p-2 rounded-md border transition-colors ${
              inputModalities.audio
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onInputChange("video")}
            className={`p-2 rounded-md border transition-colors ${
              inputModalities.video
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Video className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Output Modalities */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Output Modalities
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onOutputChange("text")}
            className={`p-2 rounded-md border transition-colors ${
              outputModalities.text
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOutputChange("image")}
            className={`p-2 rounded-md border transition-colors ${
              outputModalities.image
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOutputChange("audio")}
            className={`p-2 rounded-md border transition-colors ${
              outputModalities.audio
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOutputChange("video")}
            className={`p-2 rounded-md border transition-colors ${
              outputModalities.video
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Video className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

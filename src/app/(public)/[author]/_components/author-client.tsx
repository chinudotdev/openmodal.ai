import type { AuthorModel, AuthorResponse } from "@/actions/authors/dto";
import { cn } from "@/lib/utils";
import {
  ArrowLeftFromLine,
  ArrowRightToLine,
  Brain,
  Copy,
  Eye,
  FlaskConical,
  Image as ImageIcon,
  TestTube,
  Type,
  Video,
  Volume2,
} from "lucide-react";
import Image from "next/image";

type ModelStatus = "reasoning" | "experimental" | "preview" | "beta";

const statusIcons: Record<ModelStatus, typeof Brain> = {
  reasoning: Brain,
  experimental: FlaskConical,
  preview: Eye,
  beta: TestTube,
};

const statusColors: Record<ModelStatus, string> = {
  reasoning:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  experimental:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-300",
  preview:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  beta: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
};

const StatusBadge = ({ status }: { status: ModelStatus }) => {
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "no-select inline-flex items-center gap-1 rounded-full border px-0.5 py-0.5 font-medium text-xs",
        statusColors[status],
      )}
    >
      <Icon className="size-3" />
    </span>
  );
};

const StatusBadges = ({ status }: { status: AuthorModel["status"] }) => {
  const activeStatuses: ModelStatus[] = [];

  if (status.reasoning) activeStatuses.push("reasoning");
  if (status.experimental) activeStatuses.push("experimental");
  if (status.preview) activeStatuses.push("preview");

  if (activeStatuses.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {activeStatuses.map((statusType) => (
        <StatusBadge key={statusType} status={statusType} />
      ))}
    </div>
  );
};

const capabilityIconMap = {
  text: Type,
  image: ImageIcon,
  audio: Volume2,
  video: Video,
} as const;

type ModelCapability = "text" | "image" | "audio" | "video";

const getCapabilityIcon = (capability: ModelCapability) => {
  return capabilityIconMap[capability];
};

const CapabilityIndicator = ({ modalities }: { modalities: string[] }) => {
  const allCapabilities: ModelCapability[] = [
    "text",
    "image",
    "audio",
    "video",
  ];

  return (
    <div className="no-select flex gap-0.5">
      {allCapabilities.map((capability) => {
        const Icon = getCapabilityIcon(capability);
        const isCapabilityActive = modalities.includes(capability);

        return (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              isCapabilityActive
                ? "border-foreground/30 bg-background"
                : "border-muted-foreground/30 bg-muted-foreground/10"
            }`}
            key={capability}
            title={`${capability} ${isCapabilityActive ? "supported" : "not supported"}`}
          >
            <Icon
              className={cn(
                "size-3",
                isCapabilityActive
                  ? "text-foreground"
                  : "text-muted-foreground/50",
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

interface AuthorClientProps {
  data: AuthorResponse;
}

export default function AuthorClient({ data }: AuthorClientProps) {
  const { author, models, modelCount } = data;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {/* Author Logo and Name */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden">
                  <Image
                    src={author.logo}
                    alt={`${author.name} logo`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                  <div className="hidden w-full h-full bg-muted items-center justify-center text-muted-foreground font-semibold text-sm">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {author.name}
                </h1>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {author.description}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          {models.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No models found
              </h3>
              <p className="text-muted-foreground">
                This author doesn't have any models yet.
              </p>
            </div>
          ) : (
            <div className="bg-background">
              <div className="flex items-baseline justify-between">
                <p className="text-xl text-muted-foreground mb-6">
                  Browse models from {author.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {modelCount} models
                </p>
              </div>
              {models.map((model, index) => (
                <div
                  key={model.id}
                  className={`py-4 ${
                    index < models.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="select-text font-semibold text-xl hover:underline hover:underline-offset-3 transition-colors">
                        {model.name}
                      </h3>
                      <StatusBadges status={model.status} />
                      <button
                        type="button"
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-4 w-4 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10">
                          <ArrowRightToLine className="size-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CapabilityIndicator
                          modalities={model.inputModalities}
                        />
                      </div>

                      <div className="h-3 w-px bg-foreground/30" />

                      <div className="flex items-center gap-1.5">
                        <div className="flex h-4 w-4 items-center justify-center rounded border border-green-500/30 bg-green-500/10">
                          <ArrowLeftFromLine className="size-3 text-green-600 dark:text-green-400" />
                        </div>
                        <CapabilityIndicator
                          modalities={model.outputModalities}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mb-1 select-text text-muted-foreground leading-relaxed hover:text-foreground">
                    {model.description}
                  </p>

                  <p className="select-text text-muted-foreground text-xs">
                    Created{" "}
                    {new Date(model.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

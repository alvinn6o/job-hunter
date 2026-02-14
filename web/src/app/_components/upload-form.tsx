"use client";

import { useState, useRef, useCallback } from "react";

interface ParsedProfile {
  rawText: string;
  skills: { name: string; tier: "core" | "strong" | "peripheral" }[];
  titles: string[];
  keywords: string[];
  experience: { years: number; level: string } | null;
  suggestedLocations: string[];
  suggestedRoles: string[];
  aiResponse: string;
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 6h16l12 12v24a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 6v12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 28h12M18 34h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 16V4m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UploadForm({ onParsed }: { onParsed: (profile: ParsedProfile) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = useCallback((f: File): string | null => {
    if (f.type !== "application/pdf") {
      return "Only PDF files are accepted.";
    }
    if (f.size > 10 * 1024 * 1024) {
      return "File must be under 10 MB.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile],
  );

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your resume PDF.");
      return;
    }

    setIsLoading(true);
    try {
      const resumeBase64 = await fileToBase64(file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeBase64 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to parse resume");
      }

      const profile = await res.json() as ParsedProfile;
      onParsed(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out
          ${
            isDragOver
              ? "border-amber-500 bg-amber-500/5 scale-[1.01]"
              : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-navy-600 bg-navy-800/50 hover:border-navy-400 hover:bg-navy-800/80"
          }
          ${isDragOver ? "pulse-glow" : ""}
        `}
      >
        {isDragOver && (
          <svg
            className="dash-animated absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="16"
              ry="16"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
          {file ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <FileIcon className="w-10 h-10 text-emerald-400" />
                <div className="text-left">
                  <p className="font-sans text-lg font-medium text-white">
                    {file.name}
                  </p>
                  <p className="font-sans text-sm text-navy-300">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-2 p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 transition-colors"
                >
                  <XIcon className="w-4 h-4 text-navy-300" />
                </button>
              </div>
              <p className="font-sans text-sm text-navy-400 mt-1">
                Click or drop to replace
              </p>
            </>
          ) : (
            <>
              <div
                className={`mb-4 transition-transform duration-300 ${isDragOver ? "scale-110 -translate-y-1" : ""}`}
              >
                <UploadArrowIcon
                  className={`w-12 h-12 ${isDragOver ? "text-amber-400" : "text-navy-400"} transition-colors duration-300`}
                />
              </div>
              <p className="font-sans text-lg font-medium text-navy-100 mb-1">
                Drop your resume here
              </p>
              <p className="font-sans text-sm text-navy-400">
                PDF only, up to 10 MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="font-sans text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !file}
        className={`
          mt-8 w-full rounded-xl px-8 py-4
          font-sans text-base font-semibold tracking-wide
          transition-all duration-300 ease-out
          ${
            isLoading || !file
              ? "bg-navy-700 text-navy-400 cursor-not-allowed"
              : "bg-amber-500 text-navy-950 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
            Parsing your resume...
          </span>
        ) : (
          "Analyze Resume"
        )}
      </button>

      {isLoading && (
        <p className="mt-3 text-center font-sans text-sm text-navy-400">
          AI is extracting your skills and experience (~10 seconds)
        </p>
      )}
    </form>
  );
}

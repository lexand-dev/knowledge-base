"use client";

import { useState, useEffect, useRef } from "react";
import { upload } from "@vercel/blob/client";
import type { Document } from "@/modules/documents/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusColor(status: Document["status"]): string {
  switch (status) {
    case "ready":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "processing":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "failed":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
  }
}

function getStatusLabel(status: Document["status"]): string {
  switch (status) {
    case "uploading":
      return "Uploading";
    case "processing":
      return "Processing";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
  }
}

interface UploadFile {
  file: File;
  stage: "idle" | "uploading" | "done" | "error";
  error?: string;
}

async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<Map<string, UploadFile>>(new Map());

  const loadDocumentsRef = useRef<() => Promise<void>>(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadDocumentsRef.current();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing" || d.status === "uploading");
    if (!hasProcessing) return;

    const interval = setInterval(() => loadDocumentsRef.current(), 3000);
    return () => clearInterval(interval);
  }, [documents]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
    e.target.value = "";
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ["pdf", "docx", "txt"].includes(ext || "");
    });

    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      const uploadId = crypto.randomUUID();
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(uploadId, { file, stage: "uploading" });
        return next;
      });

      try {
        await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          onUploadProgress: () => {
            setUploads((prev) => {
              const next = new Map(prev);
              next.set(uploadId, { file, stage: "uploading" });
              return next;
            });
          },
        });

        setUploads((prev) => {
          const next = new Map(prev);
          next.set(uploadId, { file, stage: "done" });
          return next;
        });

        await loadDocumentsRef.current();

        setTimeout(() => {
          setUploads((prev) => {
            const next = new Map(prev);
            next.delete(uploadId);
            return next;
          });
        }, 2000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(uploadId, { file, stage: "error", error: message });
          return next;
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const activeUploads = Array.from(uploads.values());
  const hasActiveUploads = activeUploads.some((u) => u.stage !== "done" && u.stage !== "error");

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#0F0F0F]">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-instrument)] text-2xl font-bold text-[#1a1a1a] dark:text-[#FAFAFA]">
            Documents
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
            Manage your knowledge base files
          </p>
        </div>

        <div
          className={`relative mb-8 rounded-2xl border-2 border-dashed transition-all duration-200 ${
            dragActive
              ? "border-[#0D7377] bg-[#0D7377]/5"
              : "border-[#E8E6E1] bg-[#F5F3EF] hover:border-[#0D7377]/50 dark:border-[#262626] dark:bg-[#1A1A1A]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            accept=".pdf,.docx,.txt"
            multiple
            onChange={handleFileSelect}
            disabled={hasActiveUploads}
          />
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-[#0D7377]/10 p-4">
              <svg
                className="h-8 w-8 text-[#0D7377]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
              {hasActiveUploads ? "Uploading..." : "Drop files here"}
            </h3>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              {hasActiveUploads
                ? "Please wait"
                : "PDF, DOCX, or TXT files up to 10MB"}
            </p>
            
          </div>
        </div>

        {activeUploads.filter((u) => u.stage === "error").map((upload) => (
          <div key={upload.file.name} className="mb-4 rounded-lg bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>Failed to upload <strong>{upload.file.name}</strong>: {upload.error}</span>
          </div>
        ))}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
          </div>
        ) : documents.length === 0 && activeUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-[#F5F3EF] p-6 dark:bg-[#1A1A1A]">
              <svg
                className="h-12 w-12 text-[#6B6B6B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
              No documents yet
            </h3>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              Upload your first document to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeUploads.filter((u) => u.stage !== "done" && u.stage !== "error").length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[#E8E6E1] bg-white dark:border-[#262626] dark:bg-[#1A1A1A]">
                <div className="border-b border-[#E8E6E1] bg-[#F5F3EF] px-6 py-3 dark:border-[#262626] dark:bg-[#1A1A1A]/50">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">
                    Uploading
                  </span>
                </div>
                <div className="divide-y divide-[#E8E6E1] dark:divide-[#262626]">
                  {activeUploads.filter((u) => u.stage !== "done" && u.stage !== "error").map((upload) => (
                    <div key={upload.file.name} className="flex items-center gap-4 px-6 py-4">
                      <div className="rounded-lg bg-[#F5F3EF] p-2 dark:bg-[#262626]">
                        <svg className="h-5 w-5 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">{upload.file.name}</p>
                        <p className="text-xs text-[#6B6B6B]">
                          {upload.stage === "uploading" && "Uploading..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-[#E8E6E1] dark:bg-[#262626] overflow-hidden">
                          <div className="h-full animate-pulse rounded-full bg-[#0D7377] w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[#E8E6E1] bg-white dark:border-[#262626] dark:bg-[#1A1A1A]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E6E1] bg-[#F5F3EF] dark:border-[#262626] dark:bg-[#1A1A1A]/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Size</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Chunks</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6E1] dark:divide-[#262626]">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="group transition-colors hover:bg-[#F5F3EF]/50 dark:hover:bg-[#262626]/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#F5F3EF] p-2 dark:bg-[#262626]">
                              <svg className="h-5 w-5 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">{doc.filename}</p>
                              <p className="text-xs text-[#6B6B6B]">{doc.mimeType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status === "processing" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                            {getStatusLabel(doc.status)}
                          </span>
                          {doc.status === "failed" && doc.errorMessage && (
                            <p className="mt-1 text-xs text-red-500">{doc.errorMessage}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">{formatFileSize(doc.size)}</td>
                        <td className="px-6 py-4 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">{doc.chunkCount ?? "-"}</td>
                        <td className="px-6 py-4 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">{formatDate(new Date(doc.createdAt))}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-red-500/10 hover:text-red-500"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
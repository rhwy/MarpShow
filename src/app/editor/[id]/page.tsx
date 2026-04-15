"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/ui/components/TopBar";
import { CodeEditor } from "@/ui/components/CodeEditor";
import { EditorTabs } from "@/ui/components/EditorTabs";
import { PreviewPanel } from "@/ui/components/PreviewPanel";
import { MetadataForm } from "@/ui/components/MetadataForm";
import { MediaPanel } from "@/ui/components/MediaPanel";
import { AssistantPanel } from "@/ui/components/AssistantPanel";
import { DiffEditor } from "@/ui/components/DiffEditor";
import { ResizablePanels } from "@/ui/components/ResizablePanels";
import { VersionCommitForm } from "@/ui/components/VersionCommitForm";
import { ThemeViewer } from "@/ui/components/ThemeViewer";
import { MarpCheatSheet } from "@/ui/components/MarpCheatSheet";
import type { MetadataFormValues } from "@/ui/components/MetadataForm";
import type { EditorLanguage } from "@/ui/components/CodeEditor";
import type { EditorTabId } from "@/ui/components/EditorTabs";
import type { Presentation, ConversationMessage } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("EditorPage");

const SAVE_DEBOUNCE_MS = 1000;
const PREVIEW_DEBOUNCE_MS = 500;

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTabId>("markdown");
  const [metaSaving, setMetaSaving] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ConversationMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [versionSaving, setVersionSaving] = useState(false);
  const [lastVersion, setLastVersion] = useState<{
    id: number;
    title: string;
    timestamp: string;
  } | null>(null);
  const [pendingDiff, setPendingDiff] = useState<{
    original: string;
    proposed: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);

  // Track current content for each tab
  const [markdown, setMarkdown] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [jsContent, setJsContent] = useState("");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load presentation on mount
  useEffect(() => {
    async function load() {
      logger.info("Loading presentation for editing", { id });
      try {
        const res = await fetch(`/api/presentations/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Presentation = await res.json();
        setPresentation(data);
        setMarkdown(data.markdown);
        setCssContent(data.css);
        setJsContent(data.js);
        setChatMessages(data.conversation || []);
        // Set last version from history
        if (data.history?.length > 0) {
          const last = data.history[data.history.length - 1];
          setLastVersion({ id: last.id, title: last.title, timestamp: last.timestamp });
        }
        logger.info("Presentation loaded", { id, title: data.metadata.title });
      } catch (err) {
        logger.error("Failed to load presentation", { id, err });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Persist conversation to filesystem whenever it changes (after AI completes)
  const prevAiLoading = useRef(false);
  useEffect(() => {
    // Save when aiLoading transitions from true → false (AI just finished)
    if (prevAiLoading.current && !aiLoading && chatMessages.length > 0) {
      fetch(`/api/presentations/${id}/conversation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatMessages),
      })
        .then(() => logger.info("Conversation saved", { id }))
        .catch((err) => logger.error("Failed to save conversation", { id, err }));
    }
    prevAiLoading.current = aiLoading;
  }, [aiLoading, chatMessages, id]);

  // Render preview whenever markdown or CSS changes
  const renderPreview = useCallback(
    async (md: string, css: string, js: string) => {
      try {
        const res = await fetch(`/api/presentations/${id}/render`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: md, css, js }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPreviewHtml(data.html);
      } catch (err) {
        logger.error("Preview rendering failed", err);
      }
    },
    [id],
  );

  // Initial preview render after load
  useEffect(() => {
    if (presentation) {
      renderPreview(presentation.markdown, presentation.css, presentation.js);
    }
  }, [presentation, renderPreview]);

  // Save content to API (debounced)
  const saveContent = useCallback(
    (md: string, css: string, js: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        logger.info("Auto-saving presentation", { id });
        try {
          await fetch(`/api/presentations/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markdown: md, css, js }),
          });
          logger.info("Presentation saved", { id });
        } catch (err) {
          logger.error("Failed to save presentation", { id, err });
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [id],
  );

  // Handle editor content change
  const handleChange = useCallback(
    (value: string) => {
      switch (activeTab) {
        case "markdown":
          setMarkdown(value);
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
          previewTimerRef.current = setTimeout(() => {
            renderPreview(value, cssContent, jsContent);
          }, PREVIEW_DEBOUNCE_MS);
          saveContent(value, cssContent, jsContent);
          break;
        case "css":
          setCssContent(value);
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
          previewTimerRef.current = setTimeout(() => {
            renderPreview(markdown, value, jsContent);
          }, PREVIEW_DEBOUNCE_MS);
          saveContent(markdown, value, jsContent);
          break;
        case "javascript":
          setJsContent(value);
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
          previewTimerRef.current = setTimeout(() => {
            renderPreview(markdown, cssContent, value);
          }, PREVIEW_DEBOUNCE_MS);
          saveContent(markdown, cssContent, value);
          break;
      }
    },
    [activeTab, markdown, cssContent, jsContent, renderPreview, saveContent],
  );

  // Save metadata via PATCH API
  const handleMetadataSave = useCallback(
    async (values: MetadataFormValues) => {
      logger.info("Saving presentation metadata", { id });
      setMetaSaving(true);
      try {
        const res = await fetch(`/api/presentations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Update local presentation state
        setPresentation((prev) =>
          prev
            ? {
                ...prev,
                metadata: { ...prev.metadata, ...values },
              }
            : prev,
        );
        logger.info("Metadata saved", { id });

        // Auto-checkpoint: save a version snapshot for property changes
        try {
          const snapRes = await fetch(`/api/presentations/${id}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Properties changed" }),
          });
          if (snapRes.ok) {
            const snap = await snapRes.json();
            setLastVersion({ id: snap.id, title: snap.title, timestamp: snap.timestamp });
            logger.info("Auto-checkpoint created for properties change");
          }
        } catch {
          // Non-critical — don't fail the save
        }
      } catch (err) {
        logger.error("Failed to save metadata", { id, err });
      } finally {
        setMetaSaving(false);
      }
    },
    [id],
  );

  // Send a chat message to the AI API with streaming response
  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message immediately
      const userMsg: ConversationMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setAiLoading(true);

      // Create a placeholder assistant message that we'll update with streamed tokens
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: ConversationMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);

      logger.info("Sending chat message to AI", { id });

      try {
        const res = await fetch(`/api/presentations/${id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: chatMessages,
            markdown,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(trimmed.slice(6));

              if (data.token) {
                // Update the assistant message content with new token
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + data.token }
                      : msg,
                  ),
                );
              }

              if (data.done && data.updatedMarkdown) {
                // AI produced a markdown update — show diff for review
                logger.info("AI produced markdown update, showing diff for review");
                setPendingDiff({
                  original: markdown,
                  proposed: data.updatedMarkdown,
                });
                setActiveTab("markdown");
              }

              if (data.error) {
                // Update assistant message with error
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: `⚠️ ${data.error}` }
                      : msg,
                  ),
                );
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        logger.info("AI chat stream complete", { id });
      } catch (err) {
        logger.error("AI chat failed", { id, err });
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    "⚠️ Failed to reach the AI provider. Make sure your AI service is running.",
                }
              : msg,
          ),
        );
      } finally {
        setAiLoading(false);
      }
    },
    [id, chatMessages, markdown, cssContent, jsContent, renderPreview, saveContent],
  );

  // Handle version commit
  const handleVersionCommit = useCallback(
    async (title: string) => {
      setVersionSaving(true);
      try {
        const res = await fetch(`/api/presentations/${id}/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          const snapshot = await res.json();
          setLastVersion({
            id: snapshot.id,
            title: snapshot.title,
            timestamp: snapshot.timestamp,
          });
          logger.info("Version saved", { id, versionId: snapshot.id });
        }
      } catch (err) {
        logger.error("Failed to save version", { id, err });
      } finally {
        setVersionSaving(false);
      }
    },
    [id],
  );

  // Handle diff resolution — apply the final content from the merge view
  const handleDiffResolved = useCallback(
    (finalContent: string) => {
      logger.info("Diff resolved, applying changes");
      setMarkdown(finalContent);
      setPendingDiff(null);
      renderPreview(finalContent, cssContent, jsContent);
      saveContent(finalContent, cssContent, jsContent);
    },
    [cssContent, jsContent, renderPreview, saveContent],
  );

  // Get current value for the active tab (code tabs only)
  const currentValue = (() => {
    switch (activeTab) {
      case "markdown":
        return markdown;
      case "css":
        return cssContent;
      case "javascript":
        return jsContent;
      default:
        return "";
    }
  })();

  // Get the editor language for code tabs
  const isCodeTab = activeTab === "markdown" || activeTab === "css" || activeTab === "javascript";
  const editorLanguage: EditorLanguage | null = isCodeTab ? activeTab : null;

  if (loading) {
    return (
      <div
        className="flex flex-col min-h-screen"
        style={{ backgroundColor: "var(--surface-primary)" }}
      >
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--fg-muted)" }}>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div
        className="flex flex-col min-h-screen"
        style={{ backgroundColor: "var(--surface-primary)" }}
      >
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--fg-muted)" }}>Presentation not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--surface-primary)" }}
    >
      <TopBar />

      {/* Context bar — presentation title + navigation */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: 32,
          backgroundColor: "var(--surface-card)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span
          className="text-xs font-medium truncate"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--fg-secondary)",
          }}
        >
          {presentation.metadata.title}
        </span>
        <Link
          href={`/details/${id}`}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{
            color: "var(--fg-muted)",
            fontFamily: "var(--font-body)",
            textDecoration: "none",
          }}
          title="View details"
          data-testid="editor-to-details-link"
        >
          <FileText size={12} />
          Details
        </Link>
      </div>

      {/* Main area: Assistant + Code + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Assistant panel (collapsible) */}
        {assistantOpen && (
          <div
            className="flex-shrink-0 h-full"
            style={{ width: "20%" }}
          >
            <AssistantPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClose={() => setAssistantOpen(false)}
              onClear={() => {
                setChatMessages([]);
                // Also persist the cleared conversation
                fetch(`/api/presentations/${id}/conversation`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify([]),
                }).catch((err) =>
                  logger.error("Failed to clear conversation", err),
                );
              }}
              loading={aiLoading}
            />
          </div>
        )}

        {/* Code + Preview resizable panels */}
        <ResizablePanels
          initialLeftPercent={50}
          minLeftPercent={25}
          maxLeftPercent={75}
          className="flex-1"
          left={
            <div className="flex flex-col h-full">
              <div className="flex items-end" style={{ backgroundColor: "var(--surface-primary)" }}>
                {!assistantOpen && (
                  <button
                    onClick={() => setAssistantOpen(true)}
                    className="flex items-center justify-center px-3"
                    style={{
                      height: 36,
                      color: "var(--accent-primary)",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                    aria-label="Open AI assistant"
                    data-testid="assistant-toggle-btn"
                    title="AI Assistant"
                  >
                    <Sparkles size={16} />
                  </button>
                )}
                <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
              {pendingDiff && activeTab === "markdown" ? (
                <DiffEditor
                  originalDoc={pendingDiff.original}
                  modifiedDoc={pendingDiff.proposed}
                  onResolved={handleDiffResolved}
                />
              ) : activeTab === "config" ? (
                <MetadataForm
                  values={{
                    title: presentation.metadata.title,
                    description: presentation.metadata.description || "",
                    author: presentation.metadata.author || "",
                  }}
                  onSave={handleMetadataSave}
                  saving={metaSaving}
                />
              ) : activeTab === "media" ? (
                <MediaPanel presentationId={id} />
              ) : activeTab === "theme" ? (
                <ThemeViewer markdown={markdown} />
              ) : activeTab === "docs" ? (
                <MarpCheatSheet />
              ) : (
                <CodeEditor
                  value={currentValue}
                  language={editorLanguage!}
                  onChange={handleChange}
                  onCursorSlide={activeTab === "markdown" ? setCurrentSlide : undefined}
                />
              )}
            </div>
          }
          right={
            <div className="flex flex-col h-full">
              <PreviewPanel
                html={previewHtml}
                presentationId={id}
                onPresent={() => router.push(`/present/${id}`)}
                currentSlide={currentSlide}
              />
              <VersionCommitForm
                onCommit={handleVersionCommit}
                saving={versionSaving}
                lastVersion={lastVersion}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import API, { API_BASE_URL } from "../services/api";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    fetchHistory();
    fetchDocuments();
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await API.get("/chat/history");
      setChatHistory(result.data);
    } catch (error) {
      console.error("History Error:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const result = await API.get("/documents/");
      setDocuments(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await API.delete(`/documents/${id}`);
      fetchDocuments();

      if (documentId === id) {
        setDocumentId(null);
        setFileName("");
      }
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);

      const result = await API.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDocumentId(result.data.document_id);
      setFileName(file.name);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    const userQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/chat/?question=${encodeURIComponent(
          userQuestion
        )}&document_id=${documentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        fullText += chunk;

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: fullText,
          };

          return updated;
        });
      }

      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Question Failed");
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = (chat) => {
    setMessages([
      {
        role: "user",
        content: chat.question,
      },
      {
        role: "assistant",
        content: chat.answer || "",
      },
    ]);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#040711] text-white">
      <div className="futuristic-bg" />
      <div className="scanline" />

      <div className="relative z-10 flex h-screen flex-col p-4 md:p-6">
        <header className="mb-4 flex flex-col gap-4 rounded border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/75">
              Research OS
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-normal md:text-3xl">
              ResearchMind AI
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
            <div className="status-chip">
              <span className="text-cyan-200">{documents.length}</span>
              Docs
            </div>
            <div className="status-chip">
              <span className="text-emerald-200">{chatHistory.length}</span>
              Chats
            </div>
            <div className="status-chip">
              <span className="text-fuchsia-200">{loading ? "Live" : "Idle"}</span>
              Core
            </div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[340px_1fr]">
          <aside className="glass-panel min-h-0 overflow-hidden p-4">
            <div className="flex h-full flex-col gap-5">
              <div className="rounded border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <label className="block">
                  <span className="mb-3 block text-sm font-semibold text-cyan-100">
                    Upload PDF
                  </span>
                  <input
                    type="file"
                    className="file-input"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>

                <button className="primary-action mt-4 w-full" onClick={uploadFile}>
                  Upload document
                </button>

                {fileName && (
                  <div className="mt-4 rounded border border-white/10 bg-black/20 p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Active document
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-white">
                      {fileName}
                    </div>
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-300">
                    Documents
                  </h2>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                    {documents.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {documents.length === 0 && (
                    <div className="empty-state">No documents uploaded yet.</div>
                  )}

                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`data-row ${documentId === doc.id ? "data-row-active" : ""
                        }`}
                    >
                      <button
                        className="min-w-0 flex-1 truncate text-left"
                        onClick={() => {
                          setDocumentId(doc.id);
                          setFileName(doc.file_name);
                        }}
                      >
                        {doc.file_name}
                      </button>

                      <button
                        className="delete-action"
                        onClick={() => deleteDocument(doc.id)}
                        title="Delete document"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mb-3 mt-7 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-300">
                    Chat History
                  </h2>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                    {chatHistory.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {chatHistory.length === 0 && (
                    <div className="empty-state">No chats yet.</div>
                  )}

                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      className="history-row"
                      onClick={() => loadConversation(chat)}
                    >
                      {chat.question.length > 48
                        ? `${chat.question.substring(0, 48)}...`
                        : chat.question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="glass-panel min-h-0 p-4 md:p-5">
            <div className="flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">
                    Neural Chat
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Ask your research stack
                  </h2>
                </div>
                <div className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100 md:block">
                  Secure session
                </div>
              </div>

              <div className="chat-viewport min-h-0 flex-1 overflow-y-auto">
                {messages.length === 0 && (
                  <div className="empty-chat">
                    <div className="orbital-loader">
                      <span />
                      <span />
                      <span />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-white">
                      Upload a paper and start asking.
                    </h3>
                    <p className="mt-3 max-w-md text-center text-sm leading-6 text-slate-400">
                      Answers stream in live and stay connected to the active document.
                    </p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-line ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`message-bubble ${msg.role === "user"
                          ? "message-user"
                          : "message-assistant"
                        }`}
                    >
                      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {msg.role === "user" ? "You" : "ResearchMind"}
                      </div>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message-line justify-start">
                    <div className="message-bubble message-assistant">
                      <div className="typing-loader">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      askQuestion();
                    }
                  }}
                  className="futuristic-input flex-1"
                  placeholder="Ask a question..."
                />

                <button className="primary-action sm:w-36" onClick={askQuestion}>
                  Send
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

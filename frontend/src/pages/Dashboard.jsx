import { useState, useEffect, useRef } from "react";
import API from "../services/api";
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
            behavior: "smooth"
        });

    }, [messages, loading]);
    useEffect(() => {

        fetchHistory();
        fetchDocuments();

    }, []);
    const fetchHistory = async () => {

        try {

            const result =
                await API.get(
                    "/chat/history"
                );

            setChatHistory(
                result.data
            );

        } catch (error) {

            console.error(
                "History Error:",
                error
            );

        }

    };
    const fetchDocuments = async () => {

        try {

            const result =
                await API.get(
                    "/documents/"
                );

            setDocuments(
                result.data
            );

        } catch (error) {

            console.error(
                error
            );

        }

    };
    const deleteDocument = async (id) => {

        try {

            await API.delete(
                `/documents/${id}`
            );

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

            const result = await API.post(
                "/upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setDocumentId(result.data.document_id);
            setFileName(file.name);
            console.log(
                "Selected Document:",
                result.data.document_id
            );

            alert("Upload Successful");
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
                `http://127.0.0.1:8000/chat/?question=${encodeURIComponent(
                    userQuestion
                )}&document_id=${documentId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const reader =
                response.body.getReader();

            const decoder =
                new TextDecoder();

            let fullText = "";

            while (true) {

                const {
                    done,
                    value
                } = await reader.read();

                if (done) break;

                const chunk =
                    decoder.decode(value);

                fullText += chunk;

                setMessages((prev) => {

                    const updated = [...prev];

                    updated[
                        updated.length - 1
                    ] = {
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
                content: chat.question
            },
            {
                role: "assistant",
                content: chat.answer
            }
        ]);

    };
    return (
        <div className="flex h-screen bg-slate-950 text-white">

            {/* Sidebar */}
            <div className="w-80 border-r border-slate-800 p-4 bg-slate-900/50">

                <h1 className="text-2xl font-bold mb-6">
                    ResearchMind AI
                </h1>

                <input
                    type="file"
                    className="mb-3 w-full"
                    onChange={(e) =>
                        setFile(
                            e.target.files[0]
                        )
                    }
                />

                <button
                    onClick={uploadFile}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded p-3"
                >
                    Upload PDF
                </button>
                {fileName && (

                    <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800">

                        <div className="text-sm text-slate-400">
                            Active Document
                        </div>

                        <div className="mt-1 text-white font-medium">
                            📄 {fileName}
                        </div>

                    </div>

                )}

                <div className="mt-8">

                    <h3 className="font-semibold text-slate-300">
                        Chat History
                    </h3>

                    <div className="mt-4">
                        <h3 className="font-semibold text-slate-300 mb-3">
                            Documents
                        </h3>
                        <div className="mb-6">

                            {documents.map((doc) => (

                                <div
                                    key={doc.id}
                                    className={`flex justify-between items-center p-2 rounded mb-2 ${documentId === doc.id
                                        ? "bg-blue-600"
                                        : "hover:bg-slate-800"
                                        }`}
                                >

                                    <div
                                        onClick={() => {

                                            setDocumentId(doc.id);
                                            setFileName(doc.file_name);

                                        }}
                                        className="cursor-pointer flex-1"
                                    >

                                        📄 {doc.file_name}

                                    </div>

                                    <button
                                        onClick={() =>
                                            deleteDocument(doc.id)
                                        }
                                        className="ml-2 text-red-400 hover:text-red-300"
                                    >

                                        🗑

                                    </button>

                                </div>

                            ))}

                        </div>


                        {chatHistory.length === 0 ? (

                            <div className="text-slate-400">
                                No chats yet
                            </div>

                        ) :
                            (

                                chatHistory.map((chat) => (

                                    <div
                                        key={chat.id}
                                        onClick={() =>
                                            loadConversation(chat)
                                        }
                                        className="p-2 rounded hover:bg-slate-800 cursor-pointer text-sm mb-2"
                                    >
                                        {chat.question.length > 35
                                            ? chat.question.substring(0, 35) + "..."
                                            : chat.question}
                                    </div>

                                ))

                            )}

                    </div>

                </div>

            </div>

            {/* Main Chat Area */}
            <div className="flex-1 p-6 flex flex-col min-h-screen">
                <div className="h-[600px]">
                    <div className="flex-1 border border-slate-800 rounded-2xl p-6 overflow-y-scroll bg-slate-950 shadow-inner">

                        {messages.length === 0 && (
                            <div className="text-slate-400">
                                Upload a document and ask questions.
                            </div>
                        )}

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`mb-4 flex ${msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >

                                <div className="max-w-[70%] break-words">


                                    <div className="text-xs text-slate-400 mb-1">

                                        {msg.role === "user"
                                            ? "👤 You"
                                            : "🤖 ResearchMind AI"}

                                    </div>

                                    <div
                                        className={`p-4 rounded-2xl shadow-lg border ${msg.role === "user"
                                            ? "bg-blue-600 text-white border-blue-500"
                                            : "bg-slate-900 text-white border-slate-700"
                                            }`}
                                    >

                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>

                                    </div>

                                </div>

                            </div>

                        ))}

                        {loading && (

                            <div className="flex justify-start mb-4">

                                <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl shadow">

                                    <div className="flex gap-1">

                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>

                                        <div
                                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                                            style={{ animationDelay: "0.15s" }}
                                        ></div>

                                        <div
                                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                                            style={{ animationDelay: "0.3s" }}
                                        ></div>

                                    </div>

                                </div>

                            </div>

                        )}

                        <div ref={chatEndRef}></div>

                    </div>

                    <div className="flex gap-2 mt-4">

                        <input
                            value={question}
                            onChange={(e) =>
                                setQuestion(
                                    e.target.value
                                )
                            }
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3"
                            placeholder="Ask a question..."
                        />

                        <button
                            onClick={askQuestion}
                            className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg"
                        >
                            Send
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

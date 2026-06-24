import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {

    const [documentId, setDocumentId] = useState(null);
    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);
    useEffect(() => {

        fetchHistory();

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

            console.log(
                "Selected Document:",
                result.data.document_id
            );

            alert("Upload Successful");

        } catch (error) {

            console.error(error);

            alert("Upload Failed");
        }
    };

    const askQuestion = async () => {

        if (!question.trim()) {
            return;
        }

        try {

            setLoading(true);

            const result = await API.post(
                `/chat/?question=${encodeURIComponent(
                    question
                )}&document_id=${documentId}`
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    content: question,
                },
                {
                    role: "assistant",
                    content: result.data,
                },
            ]);
    

            setQuestion("");
            fetchHistory();

        } catch (error) {

            console.error(error);

            alert("Question Failed");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">

            {/* Sidebar */}
            <div className="w-72 border-r border-slate-800 p-4">

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

                <div className="mt-8">

                    <h3 className="font-semibold text-slate-300">
                        Chat History
                    </h3>

                    <div className="mt-4">

                        {chatHistory.length === 0 ? (

                            <div className="text-slate-400">
                                No chats yet
                            </div>

                        ) : (

                            chatHistory.map((chat) => (

                                <div
                                    key={chat.id}
                                    className="p-2 rounded hover:bg-slate-800 cursor-pointer text-sm mb-2"
                                >
                                    {chat.question}
                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

            {/* Main Chat Area */}
            <div className="flex-1 p-6 flex flex-col">

                <div className="flex-1 border border-slate-800 rounded-lg p-4 overflow-y-auto">

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

                            <div
                                className={`max-w-2xl p-3 rounded-xl ${msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-white"
                                    }`}
                            >

                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>

                            </div>

                        </div>

                    ))}

                    {loading && (

                        <div className="flex justify-start mb-4">

                            <div className="bg-slate-800 p-3 rounded-xl">
                                Thinking...
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
    );
}
export default function Dashboard() {
    return (
        <div className="flex h-screen bg-slate-950 text-white">

            <div className="w-72 border-r border-slate-800 p-4">

                <h1 className="text-2xl font-bold mb-6">
                    ResearchMind AI
                </h1>

                <button className="w-full bg-blue-600 hover:bg-blue-700 rounded p-3">
                    Upload PDF
                </button>

                <div className="mt-8">
                    <h3 className="font-semibold text-slate-300">
                        Chat History
                    </h3>

                    <div className="mt-4 text-slate-400">
                        No chats yet
                    </div>
                </div>

            </div>

            <div className="flex-1 p-6">

                <div className="h-[80%] border border-slate-800 rounded-lg p-4">

                    <div className="bg-slate-800 p-3 rounded-lg max-w-xl">
                        Hello 👋 Upload a document and ask questions.
                    </div>

                </div>

                <div className="flex gap-2 mt-4">

                    <input
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3"
                        placeholder="Ask a question..."
                    />

                    <button className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg">
                        Send
                    </button>

                </div>

            </div>

        </div>
    );
}
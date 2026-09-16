import { SUPPORTED_LANGUAGES } from "./constraints/languages"
import { useState } from "react"
import axios from 'axios'
import MonacoEditor from "./components/MonacoEditor"
import Chat from "./components/Chat"

function App() {
  const [roomId, setroomId] = useState('example-room')
  const [username, setusername] = useState(`Dev_${Math.floor(Math.random() * 1000)}`)
  const [joined, setjoined] = useState(false)
  const [showChat, setShowChat] = useState(true);
  const [showStdout, setShowStdout] = useState(true);

  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0])
  const [stdin, setStdin] = useState('')
  const [stdout, setStdout] = useState(null)
  const [loading, setloading] = useState(false)

  function handleLanguageChange(e) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.id === parseInt(e.target.value))
    setSelectedLang(lang)
    setStdout(null)
  }

  const handleCodeRun = async () => {
    const editor = window.monaco?.editor.getModels()[0]
    const code = editor ? editor.getValue() : ''
    if(!code.trim()){
      setStdout({stderr: "Editor is empty "})
    }
    setloading(true)
    setShowStdout(true)
    setStdout(null)
    try {
      const res = await axios.post(`/api/runcode`, {
        lang_Id: selectedLang.id,
        code: code,
        stdin: stdin
      })
      setStdout(res.data)
    } catch (error) {
      setStdout({ stderr: error?.response?.data?.error || "Execution failed" })
    } finally {
      setloading(false)
    }
  }

  if(!joined){
    return (
      <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans antialiased relative overflow-hidden">
        {/* Subtle background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Collaborative Code Compiler
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your details to join or create a live pair-programming room.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (username.trim() && roomId.trim()) {
                setjoined(true)
              }
            }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Your Display Name
              </label>
              <input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                placeholder="e.g. Dev_42"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-zinc-600"
              />
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="room" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Room ID
              </label>
              <input
                id="room"
                type="text"
                value={roomId}
                onChange={(e) => setroomId(e.target.value)}
                placeholder="e.g. room-alpha"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-zinc-600"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              Join Session →
            </button>
          </form>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full bg-zinc-950 text-zinc-100 flex flex-col p-4 md:p-6 gap-4 font-sans antialiased">
      {/* Header / Controls Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-800/90 border border-zinc-700/80 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-zinc-400 font-semibold uppercase tracking-wider">Room:</span>
            <span className="text-emerald-400 font-mono font-bold">{roomId}</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="lang-select" className="text-sm font-medium text-zinc-300">
              Select a language:
            </label>
            <select
              id="lang-select"
              value={selectedLang.id}
              onChange={handleLanguageChange}
              className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStdout((prev) => !prev)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {showStdout ? "Hide Output" : "Show Output"}
          </button>

          <button
            onClick={() => setShowChat((prev) => !prev)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>

          <button
            onClick={handleCodeRun}
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 lg:min-h-0">
        {/* Code Editor Panel */}
        <MonacoEditor roomId={roomId} username={username} selectedLang ={selectedLang}/>

        {/* Input & Output Section */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:h-full lg:min-h-0">
          {/* Custom Stdin Input */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg flex flex-col gap-2 shrink-0">
            <label htmlFor="stdin-input" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Custom Input (stdin)
            </label>
            <input
              id="stdin-input"
              type="text"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-500"
            />
          </div>

          {/* Console / Stdout Output Panel */}
          {showStdout && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex flex-col flex-1 min-h-[160px] lg:min-h-0 overflow-hidden">
              <div className="bg-zinc-800/80 px-4 py-2.5 border-b border-zinc-700/60 text-xs font-semibold text-zinc-400 flex items-center justify-between">
                <span>stdout Console</span>
                {stdout && stdout.time && (
                  <span className="text-emerald-400 font-mono text-xs">
                    Time: {stdout.time}s | Mem: {stdout.memory} KB
                  </span>
                )}
              </div>

              <div className="p-4 font-mono text-sm overflow-y-auto flex-1 whitespace-pre-wrap leading-relaxed">
                {loading && (
                  <span className="text-blue-400 animate-pulse font-medium">
                    Submitting and compiling code...
                  </span>
                )}
                {!loading && !stdout && (
                  <span className="text-zinc-500 italic">
                    Run your code to see the stdout here.
                  </span>
                )}
                {stdout && (
                  <>
                    {stdout.compile_stdout && (
                      <div className="text-red-500 bg-red-950/40 border border-red-800/60 p-3 rounded-lg mb-3 shadow-inner">
                        <strong className="text-red-400 font-bold block mb-1">Compilation Error:</strong>
                        {stdout.compile_stdout}
                      </div>
                    )}
                    {stdout.stderr && (
                      <div className="text-red-500 bg-red-950/40 border border-red-800/60 p-3 rounded-lg mb-3 shadow-inner">
                        <strong className="text-red-400 font-bold block mb-1">Runtime Error:</strong>
                        {stdout.stderr}
                      </div>
                    )}
                    {stdout.stdout && (
                      <div className="text-emerald-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                        {stdout.stdout}
                      </div>
                    )}
                    {!stdout.stdout && !stdout.stderr && !stdout.compile_stdout && (
                      <div className="text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800">
                        Process finished with status: {stdout.status}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chat Component */}
          {showChat && (
            <div className="flex-1 min-h-[260px] lg:min-h-0 overflow-hidden">
              <Chat roomId={roomId} username={username} />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App

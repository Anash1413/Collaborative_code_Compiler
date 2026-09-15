import { SUPPORTED_LANGUAGES } from "./constraints/languages"
import { useState } from "react"
import axios from 'axios'
import Editor from '@monaco-editor/react'

function App() {
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0])
  const [code, setCode] = useState(selectedLang.defaultCode)
  const [stdin, setStdin] = useState('')
  const [stdout, setStdout] = useState(null)
  const [loading, setloading] = useState(false)

  function handleLanguageChange(e) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.id === parseInt(e.target.value))
    setSelectedLang(lang)
    setCode(lang.defaultCode)
    setStdout(null)
  }

  const handleCodeRun = async () => {
    setloading(true)
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

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col p-4 md:p-6 gap-4 font-sans antialiased">
      {/* Header / Controls Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

        <button
          onClick={handleCodeRun}
          disabled={loading}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Running...' : 'Run Code'}
        </button>
      </header>

      {/* Main Grid Content Area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Code Editor Panel */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg min-h-[400px]">
          <div className="bg-zinc-800/80 px-4 py-2 border-b border-zinc-700/60 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Editor ({selectedLang.name})</span>
          </div>
          <div className="flex-1 w-full min-h-[350px]">
            <Editor
              height="100%"
              value={code}
              onChange={(e) => setCode(e || '')}
              theme="vs-dark"
              language={selectedLang.monacoLang}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true
              }}
            />
          </div>
        </section>

        {/* Input & Output Section */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {/* Custom Stdin Input */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg flex flex-col gap-2">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex flex-col flex-1 overflow-hidden min-h-[280px]">
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
        </section>
      </main>
    </div>
  )
}

export default App

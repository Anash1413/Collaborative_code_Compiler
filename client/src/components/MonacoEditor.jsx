import  { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { WS_URL } from "../config";

// Array of bright colors for remote cursors
const CURSOR_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#818cf8",
  "#e879f9",
];

const MonacoEditor = ({ selectedLang, roomId, username }) => {
  const [collaborators, setcollaborators] = useState([])  
  const [status, setstatus] = useState("connecting");
  const editorRef = useRef(null);
  const docRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const handleEditorDidMount = (editor)=>{
    editorRef.current = editor
    const doc = new Y.Doc() 
    docRef.current = doc
    const provider = new WebsocketProvider( WS_URL , roomId ,doc ,)
    providerRef.current = provider
   //here we'll check for connection status
    provider.on('status' , (e)=>{
        setstatus(e.status) // 'connected' | 'connecting' | 'disconnected'
    })
     
    const randomColor = CURSOR_COLORS[Math.floor(Math.random()*CURSOR_COLORS.length)]
    provider.awareness.setLocalStateField('user',{
        name: username,
        color :randomColor
    })
    // now i'll check for active users and add them to collaoborators array
    provider.awareness.on('change' , ()=>{
           const state = Array.from(provider.awareness.getStates().values())
    const activeusers = state.filter((stat)=>stat.user&&stat.user.name).map((stat)=> stat.user)
    setcollaborators(activeusers)
    })
   
    //now the monaco binding comes in line (matalb main collaboration feature is about to implemented)
  const yText = doc.getText('monaco')
  const binding = new MonacoBinding(yText, editorRef.current.getModel(),new Set([editor]),provider.awareness)
  bindingRef.current = binding
}

// Cleanup on unmount or room change
useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, [roomId])
  return (
    <section className="lg:col-span-7 xl:col-span-8 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg h-[500px] lg:h-full lg:min-h-0">
      <div className="bg-zinc-800/80 px-4 py-2 border-b border-zinc-700/60 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between shrink-0">
        <span>Editor ({selectedLang.name})</span>
        <span className="normal-case font-mono text-[11px] text-zinc-400 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-700/50">
          Room: <strong className="text-emerald-400">{roomId}</strong>
        </span>
      </div>

      {/* Awareness bar showing connection status & connected peers */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-800/90 border-b border-zinc-700/60 text-xs text-zinc-300 font-medium shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              status === "connected" ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span className="capitalize">Status: {status}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Online ({collaborators.length}):</span>
          {collaborators.map((user, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full font-bold text-[11px] text-zinc-950 shadow-xs"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0 overflow-hidden">
        <Editor
          height="100%"
          value={selectedLang.defaultCode}
          theme="vs-dark"
          language={selectedLang.monacoLang}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </section>
  );
};

export default MonacoEditor;

import { useState } from "react";
export default function CaptionGen(){ const [topic,set]=useState("New drop"),[out,setOut]=useState("");
return (<div className="card"><h3>AI Caption (stub)</h3>
<input value={topic} onChange={e=>set(e.target.value)}/>
<button className="btn" onClick={()=>setOut(`🔥 ${topic} — live now. #SmartFlow #${topic.replace(/\s+/g,'')}`)}>Generate</button>
<p>{out}</p></div>); }

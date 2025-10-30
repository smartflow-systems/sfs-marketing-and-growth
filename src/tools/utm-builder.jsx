import { useState } from "react";
export default function UTMBuilder(){ const [s,set]=useState({url:"",source:"",medium:"",campaign:""});
let out=""; try{ const u=new URL(s.url||"https://example.com");
s.source&&u.searchParams.set("utm_source",s.source);
s.medium&&u.searchParams.set("utm_medium",s.medium);
s.campaign&&u.searchParams.set("utm_campaign",s.campaign);
out=s.url?u.toString():""; }catch{}
return (<div className="card"><h3>UTM / QR Builder</h3>
<input placeholder="URL" value={s.url} onChange={e=>set({...s,url:e.target.value})}/>
<input placeholder="source" value={s.source} onChange={e=>set({...s,source:e.target.value})}/>
<input placeholder="medium" value={s.medium} onChange={e=>set({...s,medium:e.target.value})}/>
<input placeholder="campaign" value={s.campaign} onChange={e=>set({...s,campaign:e.target.value})}/>
<p><small>{out}</small></p></div>);}

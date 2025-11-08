import React from "react"; import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css"; import CircuitBackground from "./components/CircuitBackground";
import Landing from "./pages/Landing"; import Tools from "./pages/Tools";
function Nav(){return(<nav className="container" style={{display:"flex",gap:12,alignItems:"center"}}>
  <b>SmartFlow</b> <Link to="/">Home</Link> <Link to="/tools">Tools</Link></nav>)}
createRoot(document.getElementById("root")).render(
  <React.StrictMode><CircuitBackground/><BrowserRouter><Nav/><Routes>
    <Route path="/" element={<Landing/>}/><Route path="/tools" element={<Tools/>}/>
  </Routes></BrowserRouter></React.StrictMode>);

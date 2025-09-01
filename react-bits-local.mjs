import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "react-bits-local", version: "0.1.0" });

// helper: return text content
const T = (text) => [{ type: "text", text }];

// ---- tools ----
server.registerTool(
  "reactbits.circularText",
  {
    title: "Circular Text (JSX + CSS)",
    description: "Return JSX/CSS to render text around a circle",
    inputSchema: { text: z.string(), radius: z.number().default(80) }
  },
  async ({ text, radius = 80 }) => {
    const R = radius;
    const jsx = `// JSX
<svg width="${R*2}" height="${R*2}" viewBox="0 0 ${R*2} ${R*2}">
  <defs>
    <path id="rb-circle" d="M ${R},${R} m -${R-2},0 a ${R-2},${R-2} 0 1,1 ${2*(R-2)},0 a ${R-2},${R-2} 0 1,1 -${2*(R-2)},0"/>
    <linearGradient id="rb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#9c7af2"/>
    </linearGradient>
  </defs>
  <text class="rb-circular-text">
    <textPath href="#rb-circle" startOffset="0%">${text}</textPath>
  </text>
</svg>`;
    const css = `/* CSS */
.rb-circular-text{font:600 14px/1.4 system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;fill:url(#rb-grad)}`;
    return { content: T(`${jsx}\n\n${css}`) };
  }
);

server.registerTool(
  "reactbits.shinyText",
  {
    title: "Shiny Text (JSX + CSS)",
    description: "Gradient shimmer text effect",
    inputSchema: { text: z.string() }
  },
  async ({ text }) => {
    return {
      content: T(`// JSX
<h1 class="rb-shiny">${text}</h1>

// CSS
.rb-shiny{
  background: linear-gradient(90deg,#fff 0%,#a5b4fc 20%,#fff 40%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
  background-size:200% 100%; animation: rb-shine 2.5s linear infinite;
}
@keyframes rb-shine{0%{background-position:200% 0}100%{background-position:-200% 0}}`)
    };
  }
);

server.registerTool(
  "reactbits.typewriter",
  {
    title: "Typewriter Hook (JS + JSX)",
    description: "Minimal React typewriter effect",
    inputSchema: { text: z.string(), speed: z.number().default(40) }
  },
  async ({ text, speed = 40 }) => {
    const safe = text.replace(/"/g, '\\"');
    return {
      content: T(`// Hook
import { useEffect, useState } from "react";
export function useTypewriter(fullText, speed=${speed}){
  const [out, setOut] = useState("");
  useEffect(()=>{
    let i=0;
    const id=setInterval(()=>{ i++; setOut(fullText.slice(0,i)); if(i>=fullText.length) clearInterval(id); }, speed);
    return ()=>clearInterval(id);
  },[fullText, speed]);
  return out;
}
// Usage
function Hero(){ const t = useTypewriter("${safe}", ${speed}); return <h2 className="rb-typing">{t}</h2>; }
// Optional CSS
.rb-typing::after{content:"▮"; margin-left:4px; animation: blink 1s step-end infinite}
@keyframes blink{50%{opacity:0}}`)
    };
  }
);

// ---- start ----
async function main(){
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((err)=>{ console.error("Server error:", err); process.exit(1); });

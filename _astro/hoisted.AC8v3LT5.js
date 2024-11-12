import"https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";const c=new Blob([`
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js");

      async function loadPyodideAndPackages() {
        self.pyodide = await loadPyodide();
        await self.pyodide.loadPackage("micropip");
      }

      let pyodideReadyPromise = loadPyodideAndPackages();

      self.onmessage = async (event) => {
        await pyodideReadyPromise;
        const { pythonCode } = event.data;
        try {
          self.pyodide.runPython(\`
            import sys
            import io
            sys.stdout = io.StringIO()
          \`);
          await self.pyodide.loadPackagesFromImports(pythonCode);
          await self.pyodide.runPythonAsync(pythonCode);
          const output = await self.pyodide.runPythonAsync("sys.stdout.getvalue()");
          self.postMessage({ results: output });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      };
    `],{type:"application/javascript"}),l=new Blob([`
      self.onmessage = (event) => {
        const { jsCode } = event.data;
        try {
          let output = '';
          const originalConsoleLog = console.log;
          console.log = (...args) => {
            output += args.join(' ') + '\\n';
            originalConsoleLog.apply(console, args);
          };
          eval(jsCode);
          console.log = originalConsoleLog;
          self.postMessage({ results: output });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      };
    `],{type:"application/javascript"});function p(){const i=document.createElement("style");i.textContent=`
    .rb-btn { 
      font-family: monospace; line-height: normal;
      background-color: rgba(23, 23, 23, 0.2); color: #737373;
      border: 1px solid #737373; text-align: center; font-size: 1rem;
      border-radius: 4px; margin-left: 4px; padding: 0 4px 0 4px;
      height: 26px; width: 26px;
    }
    .rb-btn:hover { color: #d4d4d4; border-color: #d4d4d4; }
    .rb-editor { border-radius: 4px; padding: 2px; }
    .rb-container {
      position: relative; background-color: #282828; border-radius: 4px;
      line-height: normal; padding: 0px; margin: 24px 0px;
      box-shadow: 25px 25px 50px 5px #000000c6;
    }
    .rb-btn-group {
      position: absolute; z-index: 10; top: 8px; right: 8px;
      line-height: 0px;
    }
    .rb-output { margin: 0; padding: 0; color: #fafafa; }
    .rb-output:not(:empty) {
      font-family: monospace; font-size: 0.875rem;
      margin: 4px 8px; padding: 0 0 4px 0;
    }
    .rb-loading {
      display: flex; justify-content: center;
      div {
        width: 0.3rem; height: 0.3rem; margin: 0.4rem 0.3rem;
        background: #fafafa; border-radius: 50%;
        animation: 0.9s bounce infinite alternate;
        &:nth-child(2) { animation-delay: 0.3s; }
        &:nth-child(3) { animation-delay: 0.6s; }
      }
    }
    @keyframes bounce {
      to { opacity: 0.3; transform: translate3d(0, -0.4rem, 0); }
    }
  `,document.head.appendChild(i)}function u(i,t,e=!0,r="python"){const o=document.createElement("div");o.classList.add("rb-editor");const n=ace.edit(o);return n.session.setMode(r==="python"?"ace/mode/python":"ace/mode/javascript"),n.setTheme("ace/theme/gruvbox"),n.renderer.setScrollMargin(10,10),n.renderer.setPadding(10),n.getSession().selection.on("changeSelection",function(s){n.getSession().selection.clearSelection()}),n.container.style.pointerEvents="none",n.renderer.$cursorLayer.element.style.display="none",n.setValue(t),n.setOptions({readOnly:!0,fontSize:"0.875rem",highlightActiveLine:!1,highlightGutterLine:!1,showFoldWidgets:!1,showGutter:e,showPrintMargin:!1,minLines:2,maxLines:30}),i.appendChild(o),n}function a(i,t){const e=document.createElement("button");return e.textContent=i,e.classList.add("rb-btn"),e.addEventListener("click",t),e}function h(i,t,e,r){const o=document.createElement("div");o.classList.add("rb-btn-group"),o.appendChild(a("▷",t)),o.appendChild(a("⟳",e)),o.appendChild(a("⧠",r)),i.appendChild(o)}function g(i){const t=document.createElement("div");return t.classList.add("rb-output"),t.style.whiteSpace="pre-wrap",i.appendChild(t),t}class d{constructor(t,e,r,o){this.codeType=o,o==="python"?this.worker=new Worker(URL.createObjectURL(c)):o==="js"&&(this.worker=new Worker(URL.createObjectURL(l))),p(),this.container=t,this.container.classList.add("rb-container","not-content"),this.editor=u(this.container,e,r,o),this.createOutput(),h(this.container,this.runCode.bind(this),this.clearOutput.bind(this),this.copyCode.bind(this))}createOutput(){this.output=g(this.container)}runCode(){this.output.innerHTML='<div class="rb-loading"><div></div><div></div><div></div></div>';const t=this.editor.getValue();this.codeType==="python"?this.worker.postMessage({pythonCode:t}):this.codeType==="js"&&this.worker.postMessage({jsCode:t}),this.worker.onmessage=e=>{const{results:r,error:o}=e.data;o?this.output.textContent=this.handleError(o):this.output.textContent=r}}clearOutput(){this.output.textContent=""}copyCode(){const t=this.editor.getValue();navigator.clipboard.writeText(t).then(()=>{console.log("Code copied to clipboard")}).catch(e=>{console.error("Could not copy text: ",e)})}handleError(t){const e=t.message||t.toString(),r=e.split(`
`);return r[r.length-2]||e}static initialize(){document.querySelectorAll("script[type='text/runnable'], pre.runnable, div.runnable, runnable").forEach(e=>{const r=e.textContent.trim(),o=e.dataset.lines!=="false",n=e.dataset.code||"python",s=document.createElement("div");e.replaceWith(s),new d(s,r,o,n).editor.clearSelection(!0)})}}document.addEventListener("DOMContentLoaded",()=>{d.initialize()});

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function fetchAndExtractGoogleAppsScript() {
  const url = "https://script.google.com/macros/s/AKfycbyW4gClZCQz6nQcLrQ7Mrg249FXpvo6VLU_7-NHDoVwNQyKiPAfapZQPWfbWmRMpTIl3w/exec";
  try {
    console.log("Fetching from Google Apps Script:", url);
    const response = await fetch(url);
    const text = await response.text();
    
    // Write out the raw HTML
    fs.writeFileSync(path.join(process.cwd(), "gas_diagnostic.txt"), `Status: ${response.status}\n\n${text}`);
    
    // Now extract the 'goog.script.init(...)' part
    const googInitRegex = /goog\.script\.init\(([\s\S]*?)\);/m;
    const match = text.match(googInitRegex);
    if (match) {
      const configStr = match[1].trim();
      // Since it's a JavaScript object/JSON literal (often containing hex/unicode escape sequences like \x7b, \x22),
      // we can safely parse/eval it in a sandboxed script or carefully replace hex sequences.
      // Let's decode the hex escape sequences (\xHH) and unicode sequences (\uHHHH) manually,
      // or evaluate it safely inside sandboxed JSON parse since it's a JSON string.
      // E.g. replace all \xHH with characters.
      let decoded = configStr;
      // Convert \xHH to characters
      decoded = decoded.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      // Convert \\/ to /
      decoded = decoded.replace(/\\\\\//g, "/");
      // Double slashes to single slashes if they are escaping double quotes
      // decoded = decoded.replace(/\\"/g, '"');
      
      try {
        const configObj = JSON.parse(decoded);
        if (configObj && configObj.userHtml) {
          fs.writeFileSync(path.join(process.cwd(), "gas_user_html.html"), configObj.userHtml);
          console.log("Successfully extracted and wrote userHtml to gas_user_html.html");
          return { success: true, userHtml: configObj.userHtml };
        }
      } catch (err: any) {
        // Fallback: search for "userHtml":"..." directly
        console.log("Failed parsing JSON directly, trying fallback regex", err.message);
        const userHtmlRegex = /"userHtml"\s*:\s*"([\s\S]*?)"\s*,\s*"[^"]+"\s*:/;
        const subMatch = decoded.match(/"userHtml"\s*:\s*"([\s\S]*?)"\s*,/);
        if (subMatch) {
          let htmlText = subMatch[1];
          // replaces escaped chars
          htmlText = htmlText.replace(/\\n/g, "\n");
          htmlText = htmlText.replace(/\\"/g, '"');
          htmlText = htmlText.replace(/\\'/g, "'");
          htmlText = htmlText.replace(/\\t/g, "\t");
          htmlText = htmlText.replace(/\\\//g, "/");
          fs.writeFileSync(path.join(process.cwd(), "gas_user_html.html"), htmlText);
          console.log("Successfully extracted raw userHtml via fallback regex");
          return { success: true, userHtml: htmlText };
        }
      }
    }
    return { success: false, reason: "goog.script.init not found or matched" };
  } catch (error: any) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  let gasData: any = null;
  fetchAndExtractGoogleAppsScript().then(res => {
    gasData = res;
  });

  app.use(express.json());

  app.get("/api/gas-data", async (req, res) => {
    if (!gasData) {
      gasData = await fetchAndExtractGoogleAppsScript();
    }
    res.json(gasData);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

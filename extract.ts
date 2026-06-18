import fs from "fs";
import path from "path";

function run() {
  console.log("Starting extraction script...");
  const diagPath = path.join(process.cwd(), "gas_diagnostic.txt");
  if (!fs.existsSync(diagPath)) {
    console.error("gas_diagnostic.txt does not exist!");
    return;
  }
  
  const text = fs.readFileSync(diagPath, "utf-8");
  console.log("File size:", text.length, "bytes");
  
  const startKeyword = "goog.script.init(";
  const startIndex = text.indexOf(startKeyword);
  if (startIndex === -1) {
    console.error("Could not find goog.script.init in the file!");
    return;
  }
  
  let index = startIndex + startKeyword.length;
  while (index < text.length && text[index] !== '"' && text[index] !== "'") {
    index++;
  }
  
  if (index >= text.length) {
    console.error("Could not find start of string argument!");
    return;
  }
  
  const quoteChar = text[index];
  const firstQuoteIndex = index;
  index++; // Skip opening quote
  
  let finished = false;
  while (index < text.length && !finished) {
    if (text[index] === '\\') {
      index += 2; // Skip backslash and whatever character is next
    } else if (text[index] === quoteChar) {
      finished = true;
    } else {
      index++;
    }
  }
  
  const configStr = text.substring(firstQuoteIndex, index + 1);
  console.log("Extracted first string argument of length:", configStr.length);
  
  console.log("Decoding escape sequences...");
  let decoded = configStr;
  
  // Strip outer quotes
  if (decoded.startsWith('"') && decoded.endsWith('"')) {
    decoded = decoded.substring(1, decoded.length - 1);
  } else if (decoded.startsWith("'") && decoded.endsWith("'")) {
    decoded = decoded.substring(1, decoded.length - 1);
  }
  
  // Decode hex and unicode escapes first so JSON parse doesn't get confused
  decoded = decoded.replace(/\\x([0-9A-Fa-f]{2})/g, (m, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  decoded = decoded.replace(/\\u([0-9A-Fa-f]{4})/g, (m, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  
  // Clean backslashes for JSON parse
  decoded = decoded.replace(/\\\\|\\/g, (m) => {
    if (m === "\\\\") return "\\";
    return ""; // strip single stray backslashes
  });
  
  console.log("Attempting JSON parse...");
  try {
    const configObj = JSON.parse(decoded);
    console.log("JSON parsed successfully! Keys:", Object.keys(configObj));
    if (configObj.userHtml) {
      fs.writeFileSync(path.join(process.cwd(), "gas_user_html.html"), configObj.userHtml);
      console.log("Extracted userHtml of length:", configObj.userHtml.length, "and saved to gas_user_html.html");
      return;
    } else {
      console.error("userHtml is missing in the parsed object");
    }
  } catch (err: any) {
    console.error("JSON parse failed:", err.message);
    
    // Extract the index from error message if possible
    const matchPos = err.message.match(/position (\d+)/);
    if (matchPos) {
      const pos = parseInt(matchPos[1], 10);
      const start = Math.max(0, pos - 50);
      const end = Math.min(decoded.length, pos + 50);
      console.log("Context around error position:", pos);
      console.log("...", decoded.substring(start, end), "...");
    }
    
    // Save decoded to another file to inspect why it failed to parse
    fs.writeFileSync(path.join(process.cwd(), "decoded_config_failed.txt"), decoded);
    console.log("Saved decoded failed string to decoded_config_failed.txt for debugging");
  }
}

run();

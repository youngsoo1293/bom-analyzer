import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as xlsx from "xlsx";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Local storage simulation (JSON file)
  const HISTORY_FILE = path.join(process.cwd(), 'data', 'history.json');
  if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
  }

  // API Routes

  // 1. Component Spec Extraction via Gemini (as fallback for Digi-Key)
  app.post("/api/component/specs", async (req, res) => {
    const { partNumbers } = req.body;
    
    try {
      const prompt = `Extract technical specifications for the following electronic component part numbers: ${partNumbers.join(", ")}. 
      Focus on parameters like: Max Voltage, Rds(on), Switching Time (Rise/Fall), Package Type, and typical price.
      If the data is uncertain (e.g. depends on specific test conditions like Tj=25C vs 150C), mark it as "uncertain: true".
      Return the data in a structured JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                partNumber: { type: Type.STRING },
                specs: {
                  type: Type.OBJECT,
                  properties: {
                    maxVoltage: { type: Type.STRING },
                    rdsOn: { type: Type.STRING },
                    switchingTimeRise: { type: Type.STRING },
                    switchingTimeFall: { type: Type.STRING },
                    package: { type: Type.STRING },
                    price: { type: Type.STRING },
                  }
                },
                uncertainties: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["partNumber", "specs"]
            }
          }
        }
      });

      const specs = JSON.parse(response.text);
      res.json(specs);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to fetch component specs" });
    }
  });

  // 2. BOM Comparison
  app.post("/api/bom/compare", async (req, res) => {
    const { oldBOM, newBOM } = req.body; // Base64 or JSON data

    try {
      // Comparison logic based on RefDes
      const diff = compareBOMs(oldBOM, newBOM);
      res.json(diff);
    } catch (error: any) {
      res.status(500).json({ error: "BOM comparison failed" });
    }
  });

  // 3. History Management
  app.get("/api/history", (req, res) => {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post("/api/history", (req, res) => {
    const newEntry = req.body;
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    data.unshift({ ...newEntry, id: Date.now(), timestamp: new Date().toISOString() });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data.slice(0, 50))); // Keep last 50
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function compareBOMs(oldBOM: any[], newBOM: any[]) {
  const diffs: any[] = [];
  const oldMap = new Map(oldBOM.map(item => [item.refDes, item]));
  const newMap = new Map(newBOM.map(item => [item.refDes, item]));

  // Added & Changed
  for (const [refDes, newItem] of newMap) {
    const oldItem = oldMap.get(refDes);
    if (!oldItem) {
      diffs.push({ status: 'added', ...newItem });
    } else if (oldItem.partNumber !== newItem.partNumber) {
      diffs.push({ status: 'changed', refDes, oldPart: oldItem.partNumber, newPart: newItem.partNumber });
    }
  }

  // Deleted
  for (const [refDes, oldItem] of oldMap) {
    if (!newMap.has(refDes)) {
      diffs.push({ status: 'deleted', ...oldItem });
    }
  }

  return diffs;
}

startServer();

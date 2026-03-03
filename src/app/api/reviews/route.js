import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const body = await request.json();
    const { staffId, row } = body || {};

    if (!staffId || !row || !row.timestamp) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const date = new Date(row.timestamp);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid timestamp" }, { status: 400 });
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(process.cwd(), "data");
    const filePath = path.join(dir, `reviews-${monthKey}.json`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existing = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) existing = parsed;
        }
      } catch {
        // If file is corrupted, we start a fresh array but keep the old file on disk.
      }
    }

    existing.push({ staffId, row });

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf8");

    return NextResponse.json({ ok: true, file: `reviews-${monthKey}.json` });
  } catch (error) {
    console.error("Failed to write monthly review file:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}


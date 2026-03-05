import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function staffFilePath(staffId) {
  return path.join(DATA_DIR, `lc_reviews_${staffId}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function GET(_request, { params }) {
  const { staffId } = await params;
  if (!staffId) return NextResponse.json({ ok: false, error: "Missing staffId" }, { status: 400 });

  const fp = staffFilePath(staffId);
  if (!fs.existsSync(fp)) return NextResponse.json({ ok: true, rows: [] });

  try {
    const raw = fs.readFileSync(fp, "utf8");
    const rows = raw.trim() ? JSON.parse(raw) : [];
    return NextResponse.json({ ok: true, rows: Array.isArray(rows) ? rows : [] });
  } catch {
    return NextResponse.json({ ok: true, rows: [] });
  }
}

export async function POST(request, { params }) {
  const { staffId } = await params;
  if (!staffId) return NextResponse.json({ ok: false, error: "Missing staffId" }, { status: 400 });

  try {
    const { row } = await request.json();
    if (!row) return NextResponse.json({ ok: false, error: "Missing row" }, { status: 400 });

    ensureDataDir();
    const fp = staffFilePath(staffId);

    let existing = [];
    if (fs.existsSync(fp)) {
      try {
        const raw = fs.readFileSync(fp, "utf8");
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) existing = parsed;
        }
      } catch { /* start fresh */ }
    }

    existing.push(row);
    fs.writeFileSync(fp, JSON.stringify(existing, null, 2), "utf8");

    // Also append to monthly audit file
    if (row.timestamp) {
      try {
        const date = new Date(row.timestamp);
        if (!Number.isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const monthFile = path.join(DATA_DIR, `reviews-${monthKey}.json`);
          let monthly = [];
          if (fs.existsSync(monthFile)) {
            try { monthly = JSON.parse(fs.readFileSync(monthFile, "utf8")); } catch { monthly = []; }
          }
          monthly.push({ staffId, row });
          fs.writeFileSync(monthFile, JSON.stringify(monthly, null, 2), "utf8");
        }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("staff table write error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

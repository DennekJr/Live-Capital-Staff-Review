import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

const ALLOWED_KEYS = new Set([
  "lc_extra_staff",
  "lc_admin_questions",
  "lc_base_staff_overrides",
  "lc_all_index",
]);

function filePath(key) {
  return path.join(DATA_DIR, `${key}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 400 });
  }

  const fp = filePath(key);
  if (!fs.existsSync(fp)) {
    return NextResponse.json({ ok: true, value: null });
  }

  try {
    const raw = fs.readFileSync(fp, "utf8");
    return NextResponse.json({ ok: true, value: raw.trim() ? JSON.parse(raw) : null });
  } catch {
    return NextResponse.json({ ok: true, value: null });
  }
}

export async function POST(request) {
  try {
    const { key, value } = await request.json();

    if (!key || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 400 });
    }

    ensureDataDir();
    fs.writeFileSync(filePath(key), JSON.stringify(value, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("shared write error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

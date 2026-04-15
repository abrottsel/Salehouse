import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { spawn } from "child_process";
import path from "path";

/**
 * POST /api/deploy
 *
 * Authenticated via HMAC-SHA256 signature in the `X-Signature-256` header.
 * The signing secret is stored in the `DEPLOY_SECRET` environment variable
 * on the server (loaded from `.env.local` through PM2). The same secret
 * is stored as a GitHub Actions repository secret so the workflow can sign
 * requests.
 *
 * On success we spawn `deploy/deploy.sh` in the background (detached, so the
 * child survives the HTTP response) and return immediately with the commit
 * metadata we received. The script handles: download tarball from GitHub →
 * rsync into /var/www/zemplus → npm ci --omit=dev → next build → pm2 reload
 * zemplus → health check → Telegram notification.
 *
 * Why not git pull: the Moscow server was bootstrapped from a tarball during
 * the Paris → Moscow migration and has no `.git` directory. Tarball-based
 * sync keeps the workflow self-contained and avoids a fragile bootstrap step.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEPLOY_SCRIPT = "/var/www/zemplus/deploy/deploy.sh";
const DEPLOY_LOG = "/var/www/zemplus/logs/deploy.log";

type DeployPayload = {
  ref?: string;
  sha?: string;
  actor?: string;
  run_id?: string;
};

function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  // Accept both "sha256=..." and bare hex digests.
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  if (provided.length !== expected.length) return false;

  try {
    return timingSafeEqual(
      Buffer.from(provided, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.DEPLOY_SECRET;
  if (!secret) {
    console.error("[/api/deploy] DEPLOY_SECRET is not configured");
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }

  // Read the body exactly once, as a string, so the HMAC can be computed
  // against the bytes we actually received.
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers.get("x-signature-256"), secret)) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 },
    );
  }

  let payload: DeployPayload = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as DeployPayload) : {};
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const ref = payload.ref ?? "main";
  const sha = payload.sha ?? "";
  const actor = payload.actor ?? "github-actions";

  // Launch deploy.sh as a transient systemd unit. This cuts every
  // parent-child tie with the Next.js process — pm2 can reload /
  // restart zemplus mid-deploy and the unit keeps running on its own.
  // `--scope` runs it inline attached to our process briefly, so we
  // prefer `--collect` + no `--scope` to get a fully backgrounded
  // service. `--property=KillMode=process` prevents systemd from
  // killing subprocesses of deploy.sh if we ever stop the unit early.
  const unitName = `zemplus-deploy-${Date.now()}`;
  // systemd-run starts with a blank environment — no HOME, no PATH,
  // no USER. PM2 needs HOME to find its dump file (otherwise it
  // silently creates a fresh /etc/.pm2 instance and "reload zemplus"
  // targets a ghost process list). Setting PATH too so `npm`, `npx`,
  // `pm2`, `curl` resolve.
  const envArgs = [
    "--setenv=HOME=/root",
    "--setenv=USER=root",
    "--setenv=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    "--setenv=PM2_HOME=/root/.pm2",
    `--setenv=DEPLOY_REF=${ref}`,
    `--setenv=DEPLOY_SHA=${sha}`,
    `--setenv=DEPLOY_ACTOR=${actor}`,
    `--setenv=DEPLOY_LOG=${DEPLOY_LOG}`,
  ];
  const child = spawn(
    "/usr/bin/systemd-run",
    [
      "--unit", unitName,
      "--collect",
      "--quiet",
      "--property=KillMode=process",
      ...envArgs,
      "--",
      "/bin/bash", DEPLOY_SCRIPT,
    ],
    {
      detached: true,
      stdio: "ignore",
      cwd: path.dirname(DEPLOY_SCRIPT),
    },
  );
  child.unref();

  return NextResponse.json({
    ok: true,
    dispatched: true,
    ref,
    sha: sha.slice(0, 7),
    actor,
    pid: child.pid,
  });
}

/**
 * GET /api/deploy — returns the tail of the deploy log. Useful for CI to
 * poll and report progress, and for humans to sanity-check the last run.
 * Authentication is the same HMAC but against an empty body (so the caller
 * just needs the shared secret, not knowledge of any payload).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.DEPLOY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }

  if (!verifySignature("", req.headers.get("x-signature-256"), secret)) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 },
    );
  }

  const { readFile } = await import("fs/promises");
  try {
    const buf = await readFile(DEPLOY_LOG, "utf8");
    const lines = buf.trimEnd().split("\n");
    const tail = lines.slice(-120).join("\n");
    return new NextResponse(tail, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    // Missing log file = no deploy has run yet. Return an empty body with
    // 200 so callers can poll safely without special-casing ENOENT.
    const code = (err as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT") {
      return new NextResponse("", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

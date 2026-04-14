"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { callApi, ApiResponse } from "../../lib/apiClient";
import { ENDPOINT_GROUPS, Endpoint } from "../../lib/endpointList";

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-emerald-900 text-emerald-300",
  POST:   "bg-blue-900 text-blue-300",
  PUT:    "bg-yellow-900 text-yellow-300",
  PATCH:  "bg-orange-900 text-orange-300",
  DELETE: "bg-red-900 text-red-300",
};

function buildPath(template: string, params: Record<string, string>): string {
  let path = template;
  for (const [key, val] of Object.entries(params)) {
    path = path.replace(`:${key}`, val || `:${key}`);
  }
  return path;
}

function JsonViewer({ data }: { data: unknown }) {
  const formatted = JSON.stringify(data, null, 2);
  return (
    <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all leading-5">
      {formatted}
    </pre>
  );
}

export default function TesterPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [adminInfo, setAdminInfo] = useState<Record<string, unknown> | null>(null);
  const [selected, setSelected] = useState<Endpoint>(ENDPOINT_GROUPS[0].endpoints[0]);
  const [body, setBody] = useState<string>("");
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(ENDPOINT_GROUPS.map((g) => [g.group, true]))
  );

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    const info = localStorage.getItem("adminInfo");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
    if (info) setAdminInfo(JSON.parse(info));
  }, [router]);

  const selectEndpoint = useCallback((ep: Endpoint) => {
    setSelected(ep);
    setBody(ep.defaultBody ?? "");
    setPathParams(Object.fromEntries((ep.pathParams ?? []).map((p) => [p, ""])));
    setResponse(null);
  }, []);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const resolvedPath = buildPath(selected.path, pathParams);
      const result = await callApi(
        selected.method,
        resolvedPath,
        body,
        selected.auth ? token : undefined
      );
      setResponse(result);
    } catch (err) {
      setResponse({
        status: 0,
        ok: false,
        data: { error: String(err) },
        elapsedMs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/");
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">Long Song Academy</span>
          <span className="text-zinc-600 text-sm">API Tester</span>
        </div>
        <div className="flex items-center gap-4">
          {adminInfo && (
            <span className="text-zinc-400 text-sm">
              {(adminInfo.name as string) ?? ""}{" "}
              <span className="text-indigo-400 text-xs">
                [{(adminInfo.role as string) ?? ""}]
              </span>
            </span>
          )}
          {token && (
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950 border border-emerald-800 px-2 py-1 rounded">
              Token ✓
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Гарах
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 overflow-y-auto">
          <div className="py-2">
            {ENDPOINT_GROUPS.map((group) => (
              <div key={group.group}>
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                >
                  {group.group}
                  <span>{openGroups[group.group] ? "▾" : "▸"}</span>
                </button>
                {openGroups[group.group] &&
                  group.endpoints.map((ep) => {
                    const isSelected =
                      selected.label === ep.label &&
                      selected.path === ep.path &&
                      selected.method === ep.method;
                    return (
                      <button
                        key={`${ep.method}-${ep.path}`}
                        onClick={() => selectEndpoint(ep)}
                        className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            METHOD_COLORS[ep.method]
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="truncate">{ep.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Request Panel */}
          <div className="shrink-0 border-b border-zinc-800 p-5 flex flex-col gap-4">
            {/* URL bar */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-2.5 py-1.5 rounded shrink-0 ${
                  METHOD_COLORS[selected.method]
                }`}
              >
                {selected.method}
              </span>
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm text-zinc-300">
                {buildPath(selected.path, pathParams)}
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            {/* Path params */}
            {selected.pathParams && selected.pathParams.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selected.pathParams.map((param) => (
                  <div key={param} className="flex items-center gap-2">
                    <label className="text-zinc-500 text-xs font-mono">:{param}</label>
                    <input
                      value={pathParams[param] ?? ""}
                      onChange={(e) =>
                        setPathParams((prev) => ({ ...prev, [param]: e.target.value }))
                      }
                      placeholder={param}
                      className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-sm text-white font-mono w-52 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Body */}
            {["POST", "PUT", "PATCH"].includes(selected.method) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-500 text-xs uppercase tracking-widest">
                  Request Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 font-mono text-sm text-zinc-300 outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            )}

            {/* Auth badge */}
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              {selected.auth ? (
                <span className="text-indigo-400">🔒 Auth шаардлагатай</span>
              ) : (
                <span className="text-zinc-600">🔓 Auth шаардлагагүй</span>
              )}
              {selected.description && (
                <span className="text-zinc-700">— {selected.description}</span>
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <span className="animate-pulse">●</span> Хүлээж байна...
              </div>
            )}

            {!loading && response && (
              <div className="flex flex-col gap-3">
                {/* Status bar */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded ${
                      response.ok
                        ? "bg-emerald-900 text-emerald-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {response.status}
                  </span>
                  <span className="text-zinc-500 text-sm">{response.elapsedMs}ms</span>
                </div>

                {/* Response body */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-auto">
                  <JsonViewer data={response.data} />
                </div>
              </div>
            )}

            {!loading && !response && (
              <div className="flex items-center justify-center h-full text-zinc-700 text-sm">
                Send дарж хариу харна уу
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

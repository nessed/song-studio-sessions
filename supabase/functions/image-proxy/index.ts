// Simple CORS-friendly image proxy for cover art palette extraction
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return new Response("Missing url", { status: 400, headers: corsHeaders });
  }

  try {
    const upstream = await fetch(url);

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream fetch failed", { status: 502, headers: corsHeaders });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy error", error);
    return new Response("Proxy error", { status: 500, headers: corsHeaders });
  }
});

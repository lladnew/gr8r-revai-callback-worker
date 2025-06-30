// v1.0.4 gr8r-revai-callback-worker
// CHANGED: Updated logToGrafana to match v1.0.9 format of grafana-worker (v1.0.4)
// - WRAPPED all meta fields inside a `meta` object (v1.0.4)
// - REMOVED top-level `source` and `service`, now embedded inside `meta` (v1.0.4)
// - RETAINED: full raw_payload, transcription metadata, and body capture (v1.0.4)
// 
// v1.0.3 gr8r-revai-callback-worker
// CHANGED: flattened Grafana logging payload to surface meta fields at top level (v1.0.3)
// RETAINED: full raw_payload capture, metadata, and structured logging (v1.0.3)
//
// v1.0.2
// CHANGED: added request.clone().text() to capture the full raw payload (v1.0.2)
// ADDED: raw_payload to Grafana logs for successful callbacks (v1.0.2)
//
// v1.0.1
// added code starting line 16 to add transcription ID and metadata to grafana logs (v1.0.1)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/revai/callback' && request.method === 'POST') {
      try {
        const rawBody = await request.clone().text(); // NEW: clone request to capture raw JSON string
        const body = await request.json();
        const { id, status, transcript } = body;

        if (!id || !status) {
          return new Response('Missing required fields (id, status)', { status: 400 });
        }

        await logToGrafana(env, 'info', 'Rev.ai callback received', {
          source: 'gr8r-revaicallback-worker',
          service: 'callback',
          id,
          transcription_id: id, // duplicate under a clearer key
          status,
          transcript: transcript || 'N/A',
          metadata: body.metadata || 'none',
          raw_payload: rawBody // full original payload for inspection
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        await logToGrafana(env, 'error', 'Unexpected Rev.ai callback error', {
          source: 'gr8r-revaicallback-worker',
          service: 'callback',
          error: err.message,
          stack: err.stack,
          originalPayload: await request.text()
        });
        return new Response(`Unexpected error: ${err.message}`, { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};

async function logToGrafana(env, level, message, meta = {}) {
  const payload = {
    level,
    message,
    meta: {
      source: meta.source || 'gr8r-revaicallback-worker',
      service: meta.service || 'callback',
      ...meta
    }
  };

  try {
    const res = await env.GRAFANA.fetch('https://internal/api/grafana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resText = await res.text();
    console.log('📤 Sent to Grafana:', JSON.stringify(payload));
    console.log('📨 Grafana response:', res.status, resText);

    if (!res.ok) {
      throw new Error(`Grafana log failed: ${res.status} - ${resText}`);
    }
  } catch (err) {
    console.error('📛 Logger failed:', err.message, '📤 Original payload:', payload);
  }
}

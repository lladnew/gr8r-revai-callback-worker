// v1.0.6 gr8r-revai-callback-worker
// CHANGED: replaced direct Rev.ai transcript fetch with internal call to gr8r-revai-worker (v1.0.6)
// - NEW: constructs internal fetch to https://revai.gr8r.com/api/revai/fetch-transcript (v1.0.6)
// - REMOVED: direct Rev.ai fetch using transcript URL from payload (v1.0.6)
// - RETAINED: raw_payload logging, metadata capture, structured error logging (v1.0.6)
// - ADDED: logs for successful transcript fetch via internal API (v1.0.6)
// - ADDED: logs error response body from fetch failures (v1.0.6)
//
// v1.0.5
// ADDED: writes transcript to R2 as text/plain file under transcripts/ folder (v1.0.5)
// ADDED: updates Airtable with R2 Transcript URL and Status=Transcription Complete (v1.0.5)
// ADDED: triggers gr8r-socialcopyAI-worker to begin social copy generation (v1.0.5)
//
// v1.0.4
// CHANGED: Updated logToGrafana to match v1.0.9 format of grafana-worker (v1.0.4)
// - WRAPPED all meta fields inside a `meta` object (v1.0.4)
// - REMOVED top-level `source` and `service`, now embedded inside `meta` (v1.0.4)
// - RETAINED: full raw_payload, transcription metadata, and body capture (v1.0.4)
//
// v1.0.3
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
        const rawBody = await request.clone().text();
        const body = await request.json();
        const { id, status, transcript, metadata } = body;

        if (!id || !status) {
          return new Response('Missing required fields (id, status)', { status: 400 });
        }

        const title = metadata?.title || 'Untitled';
        const fetchUrl = `https://revai.gr8r.com/api/revai/fetch-transcript?id=${id}&title=${encodeURIComponent(title)}`;

        let transcriptText;
        try {
          const transcriptRes = await fetch(fetchUrl);
          if (!transcriptRes.ok) {
            const bodyText = await transcriptRes.text();
            throw new Error(`Transcript fetch failed: ${transcriptRes.status} - ${bodyText}`);
          }
          const json = await transcriptRes.json();
          transcriptText = json.text;
        } catch (err) {
          await logToGrafana(env, 'error', 'Unexpected Rev.ai callback error', {
            source: 'gr8r-revaicallback-worker',
            service: 'callback',
            error: err.message,
            stack: err.stack,
            raw_payload: rawBody
          });
          return new Response(`Transcript fetch failed: ${err.message}`, { status: 500 });
        }

        await logToGrafana(env, 'info', 'Rev.ai callback received', {
          source: 'gr8r-revaicallback-worker',
          service: 'callback',
          id,
          transcription_id: id,
          status,
          transcript: transcript || 'N/A',
          title,
          transcript_text_length: transcriptText.length,
          metadata: metadata || 'none',
          raw_payload: rawBody
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
          raw_payload: await request.text()
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

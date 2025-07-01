// v1.0.9 gr8r-revai-callback-worker
// RESTORED: R2 transcript upload and Airtable update logic removed without changelog in v1.0.6–v1.0.8
// - ADDED: uploads transcript text to R2 via `ASSETS` binding at key `transcripts/{title}.txt`
// - ADDED: updates Airtable via `AIRTABLE` binding using table ID `tblQKTuBRVrpJLmJp`
// - ADDED: logs success/failure of R2 upload and Airtable update to Grafana (v1.0.9)
// - RETAINED: Rev.ai transcript fetch via `REVAIFETCH`, full error capture, and raw_payload logging (v1.0.9)
// v1.0.8 gr8r-revai-callback-worker
// ENHANCED: added `title` and `transcript_url` to both success and error Grafana logs (v1.0.8)
// OPTIONAL: added check to skip callbacks if status is not 'completed' (v1.0.8)
// RETAINED: all previous behavior, error handling, and metadata logging (v1.0.8)
// v1.0.7 gr8r-revai-callback-worker
// FIXED: properly calls internal binding to gr8r-revai-worker using env.REVAI (v1.0.7)
// - CHANGED: fetch URL to 'https://internal/api/revai/fetch-transcript' and uses env.REVAI (v1.0.7)
// - FIXED: sends correct POST body { transcript_url } to match revai-worker input (v1.0.7)
// - RETAINED: raw_payload logging, structured error capture, and R2/Airtable update logic (v1.0.7)
// v1.0.6 gr8r-revai-callback-worker
// CHANGED: replaced direct Rev.ai transcript fetch with internal call to gr8r-revai-worker (v1.0.6)
// - NEW: constructs internal fetch to https://revai.gr8r.com/api/revai/fetch-transcript (v1.0.6)
// - REMOVED: direct Rev.ai fetch using transcript URL from payload (v1.0.6)
// - RETAINED: raw_payload logging, metadata capture, structured error logging (v1.0.6)
// - ADDED: logs for successful transcript fetch via internal API (v1.0.6)
// - ADDED: logs error response body from fetch failures (v1.0.6)
// v1.0.5 gr8r-revai-callback-worker
// ADDED: creates R2 transcript file and updates Airtable with R2 URL (v1.0.5)
// - ADDED: structured R2 key naming using `transcripts/{title}.txt` (v1.0.5)
// - ADDED: updates Airtable field 'R2 Transcript URL' and sets Status to 'Transcription Complete' (v1.0.5)
// - RETAINED: metadata and full Grafana logging (v1.0.5)
// v1.0.4 gr8r-revai-callback-worker
// CHANGED: Updated logToGrafana to match v1.0.9 format of grafana-worker (v1.0.4)
// - WRAPPED all meta fields inside a `meta` object (v1.0.4)
// - REMOVED top-level `source` and `service`, now embedded inside `meta` (v1.0.4)
// - RETAINED: full raw_payload, transcription metadata, and body capture (v1.0.4)
// v1.0.3 gr8r-revai-callback-worker
// CHANGED: flattened Grafana logging payload to surface meta fields at top level (v1.0.3)
// RETAINED: full raw_payload capture, metadata, and structured logging (v1.0.3)
// v1.0.2
// CHANGED: added request.clone().text() to capture the full raw payload (v1.0.2)
// ADDED: raw_payload to Grafana logs for successful callbacks (v1.0.2)
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

        if (!id || !status || !metadata) {
          return new Response('Missing required fields (id, status, metadata)', { status: 400 });
        }

        const title = metadata.title || 'Untitled';

        if (status !== 'completed' || !transcript) {
          return new Response('Callback ignored: status not completed or transcript missing', { status: 204 });
        }

        // Step 1: Fetch transcript text
        const fetchResp = await env.REVAIFETCH.fetch('https://internal/api/revai/fetch-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript_url: transcript })
        });

        const fetchText = await fetchResp.text();
        if (!fetchResp.ok) {
          await logToGrafana(env, 'error', 'Transcript fetch failed', {
            error: `Transcript fetch failed: ${fetchResp.status}`,
            revResponse: fetchText,
            title,
            transcript_url: transcript,
            raw_payload: rawBody
          });
          return new Response(`Transcript fetch error: ${fetchResp.status}`, { status: 500 });
        }

        await logToGrafana(env, 'info', 'Transcript fetch successful', {
          id,
          title,
          transcript_url: transcript,
          transcript_snippet: fetchText.slice(0, 100),
          raw_payload: rawBody
        });

        // Step 2: Upload to R2
        const r2Key = `transcripts/${title}.txt`;
        const r2Resp = await env.ASSETS.fetch('https://internal/r2/put', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: r2Key,
            body: fetchText,
            contentType: 'text/plain'
          })
        });

        const r2Result = await r2Resp.text();
        if (!r2Resp.ok) {
          await logToGrafana(env, 'error', 'R2 upload failed', {
            error: `R2 upload failed: ${r2Resp.status}`,
            r2Response: r2Result,
            title,
            r2_key: r2Key
          });
          return new Response(`R2 upload failed: ${r2Resp.status}`, { status: 500 });
        }

        const r2Url = `https://videos.gr8r.com/${r2Key}`;
        await logToGrafana(env, 'info', 'R2 upload successful', {
          title,
          r2_url: r2Url
        });

        // Step 3: Update Airtable
        const airtableResp = await env.AIRTABLE.fetch('https://internal/api/airtable/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'tblQKTuBRVrpJLmJp',
            title,
            fields: {
              'R2 Transcript URL': r2Url,
              Status: 'Transcription Complete'
            }
          })
        });

        const airtableResult = await airtableResp.text();
        if (!airtableResp.ok) {
          await logToGrafana(env, 'error', 'Airtable update failed', {
            error: `Airtable update failed: ${airtableResp.status}`,
            airtableResponse: airtableResult,
            title
          });
          return new Response(`Airtable update failed: ${airtableResp.status}`, { status: 500 });
        }

        await logToGrafana(env, 'info', 'Airtable update successful', {
          title,
          r2_url: r2Url
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        await logToGrafana(env, 'error', 'Unexpected Rev.ai callback error', {
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
      source: meta.source || 'gr8r-revai-callback-worker',
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

// v1.2.8 gr8r-revai-callback-worker
// removing r2Url from line 164 and adding const at line 274
// v1.2.7 gr8r-revai-callback-worker
// line 206 moved to line 162... variables must be outside try block added r2Url variable
// v1.2.6 gr8r-revai-callback-worker
// Updated line 204 to add socialCopy as a variable to be reused
// Updated line 251 removing const strict variable definition
// Changed Airtable Status to Pending Schedule line 303
// v1.2.5 gr8r-revai-callback-worker
// Updated R2 text upload to include Social Copy
// Updated Airtable update to include Social Copy
// v1.2.4 gr8r-revai-callback-worker
// added try { const socialCopyResponse = await... for fetching Social Copy from OpenAi via the socialcopy-worker - logging only for now to view output
// v1.2.3 gr8r-revai-callback-worker
// added sanitizing for R2 transcript URL title
// v1.2.2 gr8r-revai-callback-worker
// adding airtable error logging at line 255
// v1.2.1 gr8r-revai-callback-worker
// undoing eroneous "fix" in 1.1.9
// v1.2.0 gr8r-revai-callback-worker
// Removed "env.ASSETS.fetch('r2/put') and replaced with direct evn.VIDEO_BUCKET.put(...)
// v1.1.9
//FIXED: Internal fetch path for REVAIFETCH now uses correct relative path (/api/revai/fetch-transcript) instead of invalid full URL with /internal prefix (prevented "Not found" error)
//ADDED: Error handling and Grafana logging for Airtable get record check, including HTTP status and response body on failure
// v1.1.8 gr8r-revai-callback-worker
// - ADDED: console.log and Grafana debug log of REVAIFETCH payload before fetch
// - ADDED: try/catch block around REVAIFETCH call with explicit error and response logging
// - ADDED: logs response body and status when REVAIFETCH responds with non-200
// - RETAINED: all behavior and logs from v1.1.7
//v1.1.7 gr8r-revai-callback-worker
//ADDED: console.log('[revai-callback] Top of handler') to verify if the Worker is executing at all
//ADDED: secondary console.log() after request.clone().text() to verify body read step
//RETAINED: all previous logic from v1.1.6, including robust JSON parsing and Grafana logging
//v1.1.6 gr8r-revai-callback-worker
//- SPLIT: separated rawBody read and JSON.parse into two try/catch blocks for granular error capture
//- ADDED: error logging to Grafana if body read or parse fails, with full rawBody and error message
//- RETAINED: existing debug and console logs where successful
// v1.1.5 gr8r-revai-callback-worker
// - ADDED: console.log of fetched transcript text for debugging (v1.1.5)
// - ADDED: Grafana log with fetchText snippet and status for debugging (v1.1.5)
// - RETAINED: all logic from v1.1.4, no changes to fetch, R2, Airtable steps (v1.1.5)
// v1.1.4 gr8r-revai-callback-worker
// - FIXED: correctly expects plain text response from revai-worker fetch-transcript endpoint (v1.1.4)
// - RETAINED: entire logic from v1.1.3 including binding usage and structured Grafana logs (v1.1.4)
// v1.1.3 gr8r-revai-callback-worker
// - FIXED: all internal fetch() calls now explicitly use env.<BINDING>.fetch (v1.1.3)
// - RETAINED: entire logic and structure from v1.1.2 unchanged except binding fix (v1.1.3)
// v1.1.2 gr8r-revai-callback-worker
// - FIXED: Rev.ai retry loop by ensuring 200 OK is always returned after processing (v1.1.2)
// - ADDED: wraps transcript fetch, R2 upload, and Airtable update in try/catch block (v1.1.2)
// - ADDED: on failure, logs error to Grafana but still returns 200 OK with { success: false } (v1.1.2)
// - ADDED: skips processing if Airtable record for job.id exists and has Status = 'Transcription Complete' (v1.1.2)
// - RETAINED: exact log structure, R2 key format, Airtable field mappings, and internal service calls (v1.1.2)
// - RETAINED: all v1.1.1 behavior including use of metadata as title and job.id as Transcript ID match
// v1.1.1 gr8r-revai-callback-worker
// FIXED: parses Rev.ai callback correctly using `body.job` structure (v1.1.1)
// - CHANGED: destructures fields from `body.job` instead of `body`
// - CHANGED: transcript fetch request now passes `{ job_id }` instead of `{ transcript_url }`
// - CHANGED: Airtable update now matches on field `Transcript ID = job.id`
// - CHANGED: continues to use `job.metadata` as transcript title for R2 key (`transcripts/{title}.txt`) (v1.1.1)
// - RETAINED: R2 upload via `ASSETS`, Airtable update via `AIRTABLE`, all Grafana debug/info/error logs (v1.1.1)
// - RETAINED: all debug-level Grafana logs added in v1.1.0 (v1.1.1)
// v1.0.10 gr8r-revai-callback-worker
// ADDED: debug-level logToGrafana() trace logs for all major steps (v1.0.10)
// - ADDED: 'Callback triggered', 'Parsed body', 'Fetching transcript', 'Uploading to R2', 'Updating Airtable'
// - RETAINED: info/error logs for transcript fetch, R2 upload, and Airtable update (v1.0.10)
// - RETAINED: console.log() and console.error() for local tail logs (v1.0.10)
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

console.log('[revai-callback] Worker loaded'); // Logs when the Worker is initialized (cold start)
export default {
  async fetch(request, env, ctx) {
    console.log('[revai-callback] Handler started');// Logs on every request
    const url = new URL(request.url);
    

    if (url.pathname === '/api/revai/callback' && request.method === 'POST') {
      console.log('[revai-callback] Callback triggered');
      await logToGrafana(env, 'debug', 'Callback triggered');

let rawBody, body;

// NEW: Verify that tail log starts
console.log('[revai-callback] Top of handler');

// Step 1: Try to get raw text safely
try {
  rawBody = await request.clone().text();
  console.log('[revai-callback] Raw body successfully read'); // <== NEW marker
  console.log('[revai-callback] Raw body:', rawBody);
} catch (e) {
  console.error('[revai-callback] Failed to read raw body:', e.message);
  await logToGrafana(env, 'error', 'Failed to read raw body', {
    error: e.message
  });
  return new Response('Body read failed', { status: 400 });
}

// Step 2: Try to parse JSON
try {
  body = JSON.parse(rawBody);
  console.log('[revai-callback] Parsed body:', body);
} catch (e) {
  console.error('[revai-callback] Failed to parse body:', e.message);
  await logToGrafana(env, 'error', 'Failed to parse JSON body', {
    rawBody,
    error: e.message
  });
  return new Response('Bad JSON', { status: 400 });
}

      const job = body.job;
      if (!job || !job.id || !job.status) {
        return new Response('Missing required job fields', { status: 400 });
      }

      const { id, status, metadata } = job;
      const title = metadata || 'Untitled';

      await logToGrafana(env, 'debug', 'Parsed callback body', {
        id,
        status,
        title
      });
let fetchResp, fetchText, socialCopy; //variables set for later use that could change
      if (status !== 'transcribed') {
        return new Response('Callback ignored: status not transcribed', { status: 200 });
      }

      try {
        // Step 0: Check Airtable for existing record
        
        const checkResp = await env.AIRTABLE.fetch('https://internal/api/airtable/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'tblQKTuBRVrpJLmJp',
            matchField: 'Transcript ID',
            matchValue: id
          })
        });

       if (!checkResp.ok) {
  const errorText = await checkResp.text();
  console.error('[revai-callback] Airtable fetch failed:', checkResp.status, errorText);
  await logToGrafana(env, 'error', 'Airtable fetch failed', {
    job_id: id,
    status: checkResp.status,
    response: errorText
  });
  return new Response('Airtable check failed', { status: 200 });
}

const checkData = await checkResp.json();
const found = Array.isArray(checkData.records) && checkData.records.length > 0;
const alreadyDone = found && checkData.records[0].fields?.Status === 'Transcription Complete';

if (alreadyDone) {
  await logToGrafana(env, 'info', 'Transcript already processed, skipping', {
    job_id: id,
    title
  });
  return new Response(JSON.stringify({ success: false, reason: 'Already complete' }), { status: 200 });
}

// Step 1: Fetch transcript text (plain text)
console.log('[revai-callback] Fetch body for REVAIFETCH:', JSON.stringify({ job_id: id }));
await logToGrafana(env, 'debug', 'Sending request to REVAIFETCH', {
  job_id: id,
  fetch_payload: { job_id: id }
});

try {
  fetchResp = await env.REVAIFETCH.fetch('https://internal/api/revai/fetch-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: id })
  });
  fetchText = await fetchResp.text();
  console.log('[revai-callback] REVAIFETCH response:', fetchResp.status, fetchText);
  } catch (err) {
  console.error('[revai-callback] REVAIFETCH fetch error:', err.message);
  await logToGrafana(env, 'error', 'REVAIFETCH fetch threw error', {
    job_id: id,
    error: err.message
  });
  return new Response('Failed to fetch transcript', { status: 200 });
}

if (!fetchResp.ok) {
  await logToGrafana(env, 'error', 'REVAIFETCH returned error response', {
    job_id: id,
    status: fetchResp.status,
    text: fetchText
  });
  return new Response('Transcript fetch failed', { status: 200 });
}
// Step 1.5: Generate Social Copy from transcript
try {
  const socialCopyResponse = await env.SOCIALCOPY_WORKER.fetch('https://internal/api/socialcopy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript: fetchText, title })
  });

  if (!socialCopyResponse.ok) {
    const errText = await socialCopyResponse.text();
    console.error('[revai-callback] ❌ SocialCopy worker failed:', socialCopyResponse.status, errText);
    await logToGrafana(env, 'error', 'SocialCopy worker failed', {
      status: socialCopyResponse.status,
      response: errText,
      source: 'revai-callback-worker'
    });
  } else {
    socialCopy = await socialCopyResponse.json();
    console.log('[revai-callback] ✅ Social Copy generated:', JSON.stringify(socialCopy, null, 2));
    await logToGrafana(env, 'info', 'Received Social Copy from worker', {
      ...socialCopy,
      source: 'revai-callback-worker',
      title
    });
  }
} catch (err) {
  console.error('[revai-callback] 💥 Exception while calling SocialCopy worker:', err);
  await logToGrafana(env, 'error', 'Exception while calling SocialCopy worker', {
    message: err.message,
    stack: err.stack,
    source: 'revai-callback-worker',
    title
  });
}
       // Step 2: Upload transcript + Social Copy to R2
const sanitizedTitle = title.replace(/[^a-zA-Z0-9 _-]/g, "").replace(/\s+/g, "_");
const r2Key = `transcripts/${sanitizedTitle}.txt`;
const r2Url = 'https://videos.gr8r.com/' + r2Key;

let fullTextToUpload = fetchText;

// Append social copy if available
if (socialCopy?.hook || socialCopy?.body || socialCopy?.cta || socialCopy?.hashtags) {
  fullTextToUpload += `\n\n${socialCopy.hook || ''}\n${socialCopy.body || ''}\n${socialCopy.cta || ''}\n\n${socialCopy.hashtags || ''}`.trimEnd();
}

await logToGrafana(env, 'debug', 'Uploading transcript + social copy to R2', {
  r2_key: r2Key,
  has_social_copy: !!socialCopy
});

try {
  await env.VIDEO_BUCKET.put(r2Key, fullTextToUpload, {
    httpMetadata: { contentType: 'text/plain' }
  });
} catch (err) {
  throw new Error(`R2 upload failed: ${err.message}`);
}
       
        // Step 3: Update Airtable
        await logToGrafana(env, 'debug', 'Updating Airtable record', { title, job_id: id });

        const airtableResp = await env.AIRTABLE.fetch('https://internal/api/airtable/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'tblQKTuBRVrpJLmJp',
            matchField: 'Transcript ID',
            matchValue: id,
            fields: {
  'R2 Transcript URL': r2Url,
  Status: 'Pending Schedule',
  ...(socialCopy?.hook && { 'Social Copy Hook': socialCopy.hook }),
  ...(socialCopy?.body && { 'Social Copy Body': socialCopy.body }),
  ...(socialCopy?.cta && { 'Social Copy Call to Action': socialCopy.cta }),
  ...(socialCopy?.hashtags && { Hashtags: socialCopy.hashtags })
}
          })
        });

if (!airtableResp.ok) {
  const errorText = await airtableResp.text();
  console.error('[revai-callback] Airtable update failed:', airtableResp.status, errorText);
  await logToGrafana(env, 'error', 'Airtable update failed', {
    title,
    r2_url: r2Url,
    job_id: id,
    status: airtableResp.status,
    response: errorText
  });
  throw new Error(`Airtable update failed: ${airtableResp.status} - ${errorText}`);
}

        await logToGrafana(env, 'info', 'Airtable update successful', { title, r2_url: r2Url });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (err) {
        await logToGrafana(env, 'error', 'Callback processing error', {
          title,
          job_id: id,
          error: err.message
        });

        return new Response(JSON.stringify({ success: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
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

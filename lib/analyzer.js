const _sdk = require('@anthropic-ai/sdk');
const Anthropic = _sdk.default || _sdk;

const client = new Anthropic();

async function analyze(scraped) {
  var fd = scraped.formData;
  var ws = scraped.website || {};
  var socials = scraped.socialProfiles || [];

  var socialSummary = socials.map(function (s) {
    return s.platform + ': ' + s.url + '\nTitle: ' + (s.title || 'N/A') + '\nDesc: ' + (s.description || 'N/A');
  }).join('\n\n');

  var prompt = 'You are a business intelligence analyst. Analyze this prospect and return a JSON object.\n\n' +
    'BUSINESS INFO:\n' +
    'Website: ' + (fd.website || 'N/A') + '\n' +
    'Owner: ' + (fd.ownerName || 'N/A') + '\n' +
    'Title: ' + (fd.ownerTitle || 'N/A') + '\n' +
    'Notes: ' + (fd.notes || 'N/A') + '\n\n' +
    'WEBSITE DATA:\n' +
    'Title: ' + (ws.title || 'N/A') + '\n' +
    'Description: ' + (ws.metaDesc || 'N/A') + '\n' +
    'Headings: ' + (ws.headings || []).join(', ') + '\n' +
    'Services found: ' + (ws.services || []).join(', ') + '\n' +
    'Body excerpt: ' + (ws.bodyText || '').slice(0, 2000) + '\n\n' +
    'SOCIAL PROFILES:\n' + (socialSummary || 'None provided') + '\n\n' +
    'Return ONLY valid JSON (no markdown, no backticks) with this exact structure:\n' +
    '{\n' +
    '  "businessName": "string",\n' +
    '  "tagline": "one-line summary",\n' +
    '  "industry": "string",\n' +
    '  "overallScore": 0-100,\n' +
    '  "executiveSummary": "2-3 sentences",\n' +
    '  "kpis": [{"label":"string","value":"string"}, ...4 items],\n' +
    '  "categoryScores": {"webPresence":0-100,"seo":0-100,"contentStrategy":0-100,"socialMedia":0-100,"brandIdentity":0-100,"leadGeneration":0-100},\n' +
    '  "barMetrics": [{"label":"string","score":0-100}, ...6 items],\n' +
    '  "strengths": [{"title":"string","desc":"string"}, ...3-5 items],\n' +
    '  "gaps": [{"title":"string","desc":"string"}, ...3-5 items],\n' +
    '  "servicesDeepDive": {"services":[{"name":"string","score":0-100,"desc":"string"}, ...3-6], "highlight":{"title":"string","desc":"string"}},\n' +
    '  "competitiveLandscape": {"competitors":[{"name":"string","score":0-100,"desc":"string"}, ...3-4], "advantages":["string",...], "threats":["string",...]},\n' +
    '  "quickWins": [{"title":"string","desc":"string","impact":"High/Med/Low","effort":"High/Med/Low","timeline":"string"}, ...5 items],\n' +
    '  "aeoAnalysis": {"score":0-100,"summary":"string","recommendations":["string",...3],"projections":[{"label":"string","value":"string"}, ...3]},\n' +
    '  "pipelineLite": {"phases":[{"title":"string","desc":"string"}, ...3],"projections":[{"label":"string","value":"string"}, ...3]},\n' +
    '  "socialMediaDiagnosis": {\n' +
    '    "ownerProfile": {"name":"string","title":"string","summary":"string"},\n' +
    '    "platforms": [{"name":"LinkedIn/Facebook/Instagram/YouTube/TikTok","url":"string or empty","score":0-100,"followers":"string","engagement":"string","postFreq":"string","strengths":["string"],"gaps":["string"],"recommendations":["string"]}, ...for each platform provided]\n' +
    '  }\n' +
    '}\n\n' +
    'Be specific and insightful. Use real data from the scrape. Score honestly. If data is missing, estimate conservatively and note it. Make recommendations actionable.';

  var msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  var text = msg.content[0].text.trim();
  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from response
    var match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
}

module.exports = { analyze };

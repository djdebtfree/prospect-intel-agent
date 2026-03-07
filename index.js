// Pipeline Lite - Prospect Intel Agent v1.0
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { scrape } = require('./lib/scraper');
const { analyze } = require('./lib/analyzer');
const { generate } = require('./lib/template');

const app = express();
const PORT = process.env.PORT || 3000;

// Dashboard storage
const dashboards = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Generate dashboard
app.post('/api/generate', async function (req, res) {
  try {
    var formData = req.body;
    if (!formData.website || !formData.ownerName) {
      return res.status(400).json({ error: 'Website and owner name are required' });
    }

    console.log('Generating dashboard for:', formData.website);

    // Step 1: Scrape
    console.log('Step 1: Scraping...');
    var scraped = await scrape(formData);

    // Step 2: Analyze with AI
    console.log('Step 2: Analyzing with AI...');
    var analysis = await analyze(scraped);

    // Step 3: Generate dashboard HTML
    console.log('Step 3: Building dashboard...');
    var html = generate(analysis);

    // Store
    var id = crypto.randomUUID();
    dashboards.set(id, html);
    console.log('Dashboard stored:', id);

    res.json({ url: '/d/' + id });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// Serve dashboards
app.get('/d/:id', function (req, res) {
  var html = dashboards.get(req.params.id);
  if (!html) return res.status(404).send('Dashboard not found');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health check
app.get('/health', function (req, res) {
  res.json({ status: 'ok', dashboards: dashboards.size });
});

if (require.main === module) {
  app.listen(PORT, function () {
    console.log('Pipeline Lite running on port ' + PORT);
  });
}

module.exports = app;

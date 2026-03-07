const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function scrapeWebsite(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PipelineLiteBot/1.0)' },
      timeout: 15000,
      redirect: 'follow'
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts/styles
    $('script, style, noscript').remove();

    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const headings = [];
    $('h1, h2, h3').each(function (i) {
      if (i < 30) headings.push($(this).text().trim());
    });

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    // Find social links on the page
    const socialLinks = {};
    $('a[href]').each(function () {
      var href = $(this).attr('href') || '';
      if (href.includes('linkedin.com')) socialLinks.linkedin = href;
      if (href.includes('facebook.com')) socialLinks.facebook = href;
      if (href.includes('instagram.com')) socialLinks.instagram = href;
      if (href.includes('youtube.com')) socialLinks.youtube = href;
      if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter = href;
      if (href.includes('tiktok.com')) socialLinks.tiktok = href;
    });

    // Try to find services
    var services = [];
    $('h2, h3').each(function () {
      var t = $(this).text().trim().toLowerCase();
      if (t.includes('service') || t.includes('solution') || t.includes('offer') || t.includes('what we do')) {
        var next = $(this).next();
        if (next.length) {
          next.find('li').each(function (i) {
            if (i < 10) services.push($(this).text().trim());
          });
          if (services.length === 0) {
            var txt = next.text().trim();
            if (txt.length > 5 && txt.length < 200) services.push(txt);
          }
        }
      }
    });

    return { title, metaDesc: metaDesc || ogDesc, headings, bodyText, socialLinks, services };
  } catch (err) {
    return { title: '', metaDesc: '', headings: [], bodyText: '', socialLinks: {}, services: [], error: err.message };
  }
}

async function scrapeSocialProfile(url, platform) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
      redirect: 'follow'
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    $('script, style').remove();
    var title = $('title').text().trim();
    var desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    return { platform, url, title, description: desc.slice(0, 500) };
  } catch (err) {
    return { platform, url, title: '', description: '', error: err.message };
  }
}

async function scrape(formData) {
  var website = null;
  var socialProfiles = [];

  // Scrape main website
  if (formData.website) {
    website = await scrapeWebsite(formData.website);
  }

  // Scrape social profiles in parallel
  var socialTasks = [];
  if (formData.linkedin) socialTasks.push(scrapeSocialProfile(formData.linkedin, 'LinkedIn'));
  if (formData.facebook) socialTasks.push(scrapeSocialProfile(formData.facebook, 'Facebook'));
  if (formData.instagram) socialTasks.push(scrapeSocialProfile(formData.instagram, 'Instagram'));
  if (formData.youtube) socialTasks.push(scrapeSocialProfile(formData.youtube, 'YouTube'));
  if (formData.tiktok) socialTasks.push(scrapeSocialProfile(formData.tiktok, 'TikTok'));

  if (socialTasks.length > 0) {
    socialProfiles = await Promise.all(socialTasks);
    socialProfiles = socialProfiles.filter(Boolean);
  }

  return { website, socialProfiles, formData };
}

module.exports = { scrape };

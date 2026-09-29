import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\563e70bb-e158-4aeb-b1f2-14b5f128e2ee';

async function runStudioTest() {
  console.log('🚀 Starting Studio QA Browser Test...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();
    const targetUrl = process.env.TEST_URL || 'http://127.0.0.1:5173';
    console.log(`🌐 Navigating to ${targetUrl} ...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 20000 });

    // 1. Click on "נסיעה חדשה"
    console.log('🔘 Opening Studio ("נסיעה חדשה")...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const studioBtn = buttons.find(b => b.innerText.includes('נסיעה חדשה'));
      if (studioBtn) studioBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // 2. Click "פענח נסיעה והצג על המפה"
    console.log('🔘 Clicking "פענח נסיעה והצג על המפה"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const parseBtn = buttons.find(b => b.innerText.includes('פענח נסיעה'));
      if (parseBtn) parseBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // 3. Inspect parsed waypoints
    const result = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[placeholder="שם העצירה..."]'));
      return inputs.map(el => el.value);
    });

    console.log('📍 Extracted Waypoints in Studio (' + result.length + '):', result);

    // 4. Capture screenshot of the Studio with live interactive editor
    const studioScreenPath = path.join(ARTIFACT_DIR, 'studio_editor_tested.png');
    await page.screenshot({ path: studioScreenPath });
    console.log('📸 Saved Studio editor screenshot to:', studioScreenPath);

    console.log('🎉 Studio QA Test completed successfully!');
  } catch (err) {
    console.error('❌ Studio Test Error:', err);
  } finally {
    await browser.close();
  }
}

runStudioTest();

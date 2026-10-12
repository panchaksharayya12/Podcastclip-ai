import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting ClipForge AI Comprehensive Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health endpoint
  console.log('Test 1: Health Endpoint');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'Health returns 200 OK');
    assert(data.status === 'ok', 'Status is ok');
    assert(data.ffmpegAvailable === true, 'FFmpeg is detected and available');
    assert(typeof data.openAiConfigured === 'boolean', 'OpenAI configuration status is boolean');
  } catch (err) {
    assert(false, `Health test threw: ${err.message}`);
  }

  // 2. Transcript Analysis (Deterministic Fallback Engine)
  console.log('\nTest 2: Deterministic Transcript Analysis');
  let analyzedClips = [];
  try {
    const transcript = `
      ALEX: Welcome back to the podcast. Today Maya is with us. Maya, what is the biggest mistake you see ambitious creators making?
      MAYA: The biggest mistake people make is waiting for permission. No one is ever going to hand you an engraved invitation to build something exceptional. The world rewards those who decide to act before anyone else agrees.
      ALEX: What about burnout?
      MAYA: What most people call burnout isn't working too hard—it's working without autonomy. When you have control over your craft, your energy compounds. But executing someone else's checklist burns you out in two hours.
      ALEX: That is so true. What is your advice for someone starting today?
      MAYA: Stop trying to sound clever. Focus entirely on clarity. The clearest thinker in the room always wins. Give yourself a 48-hour constraint and ship a real artifact into the real world.
    `;

    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        targetDuration: '15-30',
        platform: 'YouTube Shorts',
        clipStyle: 'Educational',
        numberOfSuggestions: 5,
      }),
    });

    const data = await res.json();
    assert(res.status === 200, 'Analysis returns 200 OK');
    assert(data.success === true, 'Analysis reports success');
    assert(data.analysisMode === 'transcript-based', 'Analysis mode is transcript-based');
    assert(Array.isArray(data.clips) && data.clips.length > 0, `Discovered ${data.clips?.length} clips`);

    analyzedClips = data.clips;
    const clip = data.clips[0];
    assert(typeof clip.title === 'string' && clip.title.length > 0, 'Clip has title');
    assert(clip.startTime >= 0, 'Clip has non-negative start time');
    assert(clip.endTime > clip.startTime, 'Clip end time is greater than start time');
    assert(clip.duration > 0, 'Clip duration is positive');
    assert(typeof clip.hook === 'string', 'Clip has opening hook');
    assert(typeof clip.reason === 'string', 'Clip has reason');
    assert(typeof clip.caption === 'string', 'Clip has caption');
    assert(Array.isArray(clip.hashtags), 'Clip has hashtags');
    assert(clip.engagementPotential === 'Very High' || clip.engagementPotential === 'High' || clip.engagementPotential === 'Moderate', 'Clip has engagement potential badge');
    assert(clip.engagementEstimateDisclaimer.includes('Qualitative AI estimate'), 'Disclaimer is present and transparent');
    assert(clip.performanceBreakdown && clip.performanceBreakdown.overallScore > 0, 'Content potential score breakdown is populated');
  } catch (err) {
    assert(false, `Transcript analysis threw: ${err.message}`);
  }

  // 3. Invalid analysis inputs
  console.log('\nTest 3: Input Validation and Error Handling');
  try {
    const resEmpty = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: '' }),
    });
    assert(resEmpty.status === 400, 'Empty transcript correctly rejected with 400 Bad Request');

    const resShort = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Hello world' }),
    });
    assert(resShort.status === 400, 'Very short transcript correctly rejected with 400 Bad Request');
  } catch (err) {
    assert(false, `Validation test threw: ${err.message}`);
  }

  // 4. Captions export (SRT, CSV, JSON)
  console.log('\nTest 4: Captions & Metadata Export');
  try {
    const resSrt = await fetch(`${BASE_URL}/api/captions/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'srt',
        title: 'test-clip',
        startTime: 10,
        endTime: 25,
        text: 'The biggest mistake is waiting for permission. The world rewards those who act.',
      }),
    });
    const srtText = await resSrt.text();
    assert(resSrt.status === 200, 'SRT export returns 200 OK');
    assert(srtText.includes('-->') && srtText.includes('00:00:10'), 'SRT content contains valid timestamps');

    const resCsv = await fetch(`${BASE_URL}/api/captions/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'csv',
        title: 'test-export',
        clips: analyzedClips,
      }),
    });
    const csvText = await resCsv.text();
    assert(resCsv.status === 200, 'CSV export returns 200 OK');
    assert(csvText.includes('Title,Start Time (s)'), 'CSV contains proper header row');

    const resJson = await fetch(`${BASE_URL}/api/captions/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        title: 'test-export',
        clips: analyzedClips,
      }),
    });
    const jsonParsed = await resJson.json();
    assert(resJson.status === 200, 'JSON export returns 200 OK');
    assert(Array.isArray(jsonParsed) && jsonParsed.length > 0, 'JSON export returns valid array');
  } catch (err) {
    assert(false, `Captions export threw: ${err.message}`);
  }

  // 5. Projects CRUD
  console.log('\nTest 5: Projects Lifecycle (Save, List, Get, Delete)');
  let testProjectId = null;
  try {
    const saveRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Podcast Suite',
        transcript: 'Sample discussion about product engineering',
        clips: analyzedClips,
        analysisMode: 'transcript-based',
      }),
    });
    const saveData = await saveRes.json();
    assert(saveRes.status === 201, 'Project created with 201 Created');
    assert(saveData.success === true && saveData.project.id, 'Project ID generated');
    testProjectId = saveData.project.id;

    const listRes = await fetch(`${BASE_URL}/api/projects`);
    const listData = await listRes.json();
    assert(listRes.status === 200, 'Projects list returns 200 OK');
    assert(listData.projects.some((p) => p.id === testProjectId), 'Created project found in list');

    const getRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`);
    const getData = await getRes.json();
    assert(getRes.status === 200, 'Fetch project by ID returns 200 OK');
    assert(getData.project.name === 'Test Podcast Suite', 'Project name matches');

    const delRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, { method: 'DELETE' });
    assert(delRes.status === 200, 'Delete project returns 200 OK');
  } catch (err) {
    assert(false, `Projects CRUD threw: ${err.message}`);
  }

  // 6. Real FFmpeg Video Processing and Clipping Test
  console.log('\nTest 6: Real FFmpeg Video Processing Pipeline');
  try {
    // Generate a quick synthetic 5-second test video with FFmpeg testsrc and sine audio
    const ffmpegPath = path.resolve('node_modules/ffmpeg-static/ffmpeg.exe');
    const testVideoPath = path.resolve('test_synthetic.mp4');

    console.log('  Generating synthetic 5-second test MP4 with ffmpeg...');
    execSync(
      `"${ffmpegPath}" -y -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=5 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac "${testVideoPath}"`,
      { stdio: 'ignore' }
    );
    assert(fs.existsSync(testVideoPath), 'Synthetic test video generated successfully');

    // Test Uploading the media file
    const fileBuffer = fs.readFileSync(testVideoPath);
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });
    formData.append('media', blob, 'test_podcast.mp4');

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201, 'Media upload returns 201 Created');
    assert(uploadData.id && uploadData.isVideo === true, 'Upload parsed as valid video');
    assert(uploadData.duration >= 4.5, `Duration probed accurately: ${uploadData.duration}s`);

    // Test Generating a real 9:16 Vertical Video Clip with FFmpeg
    console.log('  Rendering 9:16 vertical video clip with FFmpeg...');
    const clipRes = await fetch(`${BASE_URL}/api/clips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaId: uploadData.id,
        startTime: 1.0,
        endTime: 3.5,
        clipTitle: 'Momentum Rule',
        aspectRatio: '9:16',
      }),
    });
    const clipData = await clipRes.json();
    assert(clipRes.status === 201, 'Clip rendering returns 201 Created');
    assert(clipData.success === true, 'Rendering reported success');
    assert(clipData.duration === 2.5, 'Clip duration matches 2.5 seconds');

    // Test downloading the rendered clip
    const downloadRes = await fetch(`${BASE_URL}${clipData.downloadUrl}`);
    assert(downloadRes.status === 200, 'Download endpoint returns 200 OK');
    assert(downloadRes.headers.get('content-type') === 'video/mp4', 'Download header is video/mp4');
    const clipBytes = await downloadRes.arrayBuffer();
    assert(clipBytes.byteLength > 1000, `Downloaded real rendered MP4 (${clipBytes.byteLength} bytes)`);

    // Clean up test file
    if (fs.existsSync(testVideoPath)) fs.unlinkSync(testVideoPath);
    await fetch(`${BASE_URL}/api/media/${uploadData.id}`, { method: 'DELETE' });
    console.log('  Cleaned up temporary test video.');
  } catch (err) {
    assert(false, `FFmpeg video clipping test threw: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

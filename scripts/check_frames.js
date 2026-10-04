const { execSync } = require('child_process');
const FFMPEG = 'C:\\Users\\saipa\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe';
const video = 'c:\\Users\\saipa\\OneDrive\\Desktop\\hyd to del\\pavan_express_4k_showcase.mp4';

for (let t = 0.5; t <= 4.0; t += 0.5) {
  const out = `c:\\Users\\saipa\\OneDrive\\Desktop\\hyd to del\\frame_${t}s.png`;
  try {
    execSync(`"${FFMPEG}" -ss ${t} -i "${video}" -vframes 1 -update 1 "${out}" -y`, { stdio: 'pipe' });
    console.log(`Saved frame at ${t}s`);
  } catch (e) {
    console.error(e.message);
  }
}

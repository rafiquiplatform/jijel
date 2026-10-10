const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const core = h.match(/<script id="app-core">([\s\S]*?)<\/script>/)[1];
try { new Function(core); console.log('SYNTAX OK'); } catch (e) { console.log('SYNTAX FAIL: ' + e.message); }

const pat = process.argv[3] || "'teacher'|'counselor'|'student'|u\\.level|roleName:'|role==='teacher'|role==='counselor'|K\\.children|K\\.schema|levelName";
const re = new RegExp(pat);
core.split('\n').forEach((l, k) => { if (re.test(l)) console.log('L' + (k + 1) + ': ' + l.trim().slice(0, 320)); });
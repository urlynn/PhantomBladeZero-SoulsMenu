const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),mod=path.join(root,'mod/PBZSoulsMenu');
const scripts=fs.readdirSync(mod).filter(n=>n.endsWith('.js'));
for(const name of scripts)cp.execFileSync(process.execPath,['--check',path.join(mod,name)]);
const config=fs.readFileSync(path.join(mod,'config.js'),'utf8');
const template=/const TEMPLATE=`([\s\S]*?)`;/.exec(config)[1];
assert.equal(fs.readFileSync(path.join(mod,'settings.default.ini.example'),'utf8').replace(/\r\n/g,'\n'),template.replace(/\r\n/g,'\n'));
fs.mkdirSync(path.join(root,'.build'),{recursive:true});
console.log('PASS '+scripts.length+' script syntax checks and default INI template consistency.');

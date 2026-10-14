import {build} from 'esbuild';
import fs from 'node:fs/promises';
await build({entryPoints:['preview.tsx'],bundle:true,outfile:'preview.js',format:'iife',jsx:'automatic',target:'chrome120'});
let css=await fs.readFile('original-styles.css','utf8');
css=css.replace('@source "../src";','@source "./GameViews.tsx";\n@source "./preview.tsx";');
css+='\n/* Editorial translation only. Pause animation at its original final position for a legible illustration. */\n*,*::before,*::after{animation:none!important;transition:none!important}\n.editorial-en,.editorial-en strong{color:#0000ff!important}\n';
await fs.writeFile('preview-input.css',css);
await fs.writeFile('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><link rel="stylesheet" href="preview.css"><title>Editorial translation of archived DevEvolution views</title></head><body><div id="root"></div><script src="preview.js"></script></body></html>');
console.log('Original view component bundle created');

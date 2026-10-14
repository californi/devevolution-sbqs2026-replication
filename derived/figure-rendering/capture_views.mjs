import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const D=path.dirname(new URL(import.meta.url).pathname),A=path.join(D,'preview-app');
const {chromium}=createRequire(path.join(A,'package.json'))('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu','--allow-file-access-from-files']});
const page=await browser.newPage({viewport:{width:1056,height:4000},deviceScaleFactor:2});
const saved=[];
for(const mode of ['levels','study','wrong','correct','path','summary']) {
 await page.setViewportSize({width:['levels','path'].includes(mode)?1056:500,height:4000});
 await page.goto('file://'+path.join(A,'index.html')+'?view='+mode);
 await page.waitForSelector('body[data-ready="true"]');
 await page.evaluate(()=>document.fonts.ready);
 const target=mode==='levels'||mode==='path'||mode==='summary'?page.locator('main > .pop-in'):page.locator('#preview');
 const out=path.join(D,mode+'.png');await target.screenshot({path:out});
 await page.evaluate(()=>window.scrollTo(0,0));
 let clip;
 if(mode==='levels')clip=await target.boundingBox();
 if(mode==='study')clip=await page.locator('.flashcard-blue').boundingBox();
 if(mode==='wrong'||mode==='correct'){
  const top=await page.locator('main > .pop-in > .card-pop').first().boundingBox();
  const feedback=await page.locator(mode==='wrong'?'main > .pop-in > .bg-destructive\\/10':'main > .pop-in > .card-pop').last().boundingBox();
  clip={x:top.x-2,y:top.y-2,width:top.width+4,height:feedback.y+feedback.height-top.y+4};
 }
 if(mode==='path'){
  const trail=page.locator('main .max-w-2xl');
  const box=await trail.boundingBox();const fifth=await trail.locator('button').nth(4).boundingBox();
  const start=await page.locator('main > .pop-in > .flex.justify-center.mb-2').boundingBox();
  clip={x:box.x-8,y:start.y-4,width:box.width+16,height:fifth.y+fifth.height-start.y+14};
 }
 if(mode==='summary'){
  const first=await page.locator('main ul > li').nth(0).boundingBox();const third=await page.locator('main ul > li').nth(2).boundingBox();
  clip={x:first.x-2,y:first.y-2,width:first.width+4,height:third.y+third.height-first.y+4};
 }
 await page.screenshot({path:path.join(D,mode+'-detail.png'),clip});
 const text=await page.locator('body').innerText();
 saved.push({mode,path:out,text,box:await target.boundingBox()});
}
await fs.writeFile(path.join(D,'captured-views.json'),JSON.stringify(saved,null,2));
await browser.close();console.log('Six original-component English views captured');

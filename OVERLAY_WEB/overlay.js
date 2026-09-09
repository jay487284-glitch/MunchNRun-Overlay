(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const api = (params.get("api") || "").replace(/\/$/, "");
  const anon = params.get("anon") || "", channel = params.get("channel") || "", read = params.get("read") || "";
  const root = document.getElementById("overlay"), cards = document.getElementById("cards"), title = document.getElementById("title");
  const images = new Map();
  const manifestPromise = fetch("assets/manifest.json").then(r => { if(!r.ok) throw Error(`Artwork manifest HTTP ${r.status}`); return r.json(); });
  let lastPayload = "", generation = 0, revision = null, refreshing = false, legacyRead = false, currentPayload = null;
  const publicImage = value => { try {const u=new URL(value); return u.protocol === "https:" && !["localhost","127.0.0.1","[::1]"].includes(u.hostname);} catch {return false;} };

  function image(src) {
    if (!images.has(src)) images.set(src,new Promise((resolve,reject) => {
      const img = new Image(); img.referrerPolicy="no-referrer";
      const timeout=setTimeout(()=>{images.delete(src);reject(Error("Image timeout"));},8000);
      img.onload=()=>{clearTimeout(timeout);resolve(img);};img.onerror=()=>{clearTimeout(timeout);images.delete(src);reject(Error("Image unavailable"));};img.crossOrigin="anonymous";img.src=src;
    }));
    return images.get(src);
  }
  function contain(ctx,img,rect) {
    const [x,y,w,h]=rect,ratio=Math.min(w/img.width,h/img.height),dw=img.width*ratio,dh=img.height*ratio;
    ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  }
  function textFit(ctx,text,rect,color="#fff",size=25,outline=true) {
    const [x,y,w,h]=rect; ctx.textAlign="center";ctx.textBaseline="middle";
    do {ctx.font=`bold ${size}px Arial`; if(ctx.measureText(text).width<=w)break;size-=1;} while(size>5);
    ctx.lineJoin="round";ctx.lineWidth=2;ctx.strokeStyle="#1b1614";ctx.fillStyle=color;
    if(outline)ctx.strokeText(text,x+w/2,y+h/2);ctx.fillText(text,x+w/2,y+h/2);
  }
  function heart(ctx,rect,count) {
    const [x,y,w,h]=rect;ctx.save();ctx.translate(x,y);ctx.scale(w/240,h/216);ctx.beginPath();
    for(let i=0;i<=120;i++){const t=i*2*Math.PI/120,px=120+7*(16*Math.sin(t)**3),py=99-6.4*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
    ctx.closePath();const gradient=ctx.createLinearGradient(0,0,0,216);gradient.addColorStop(0,"#ff4139");gradient.addColorStop(.4,"#ff271f");gradient.addColorStop(1,"#c30508");ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle="#ffb132";ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle="#fff4dd";ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.ellipse(61,45,33,24,0,Math.PI+.3,Math.PI+2.7);ctx.strokeStyle="#ffdad7";ctx.lineWidth=5;ctx.stroke();
    textFit(ctx,String(count),[28,62,184,85],"#fff",82,false);ctx.restore();
  }
  function legacyEffects(card) {
    // Keep the already-published schema-1 overlay usable until the new game republishes.
    const text=String(card.action_text||""),result=[];
    const regex=/Spawn (\d+) (Red|Pink|Cyan|Orange) Hunters?|([+-]?\d+) (WIN|Life|Lives|Power Bite|Power Bites|Munchies)|Remove (\d+) Hunters?/gi;
    for(const m of text.matchAll(regex)) {
      if(m[1])result.push({action:"spawn_enemy",amount:Number(m[1]),hunter_type:m[2].toLowerCase()});
      else if(m[5])result.push({action:"remove_enemy",amount:Number(m[5]),hunter_type:"red"});
      else {const n=Number(m[3]),kind=m[4].toLowerCase();result.push({action:kind==="win"?"win_change":kind.startsWith("li")?(n<0?"remove_life":"add_life"):kind.startsWith("power")?(n<0?"remove_power":"spawn_power"):(n<0?"remove_dots":"add_dots"),amount:kind==="win"?n:Math.abs(n),hunter_type:"red"});}
    }
    return result;
  }
  function makePlan(effects,manifest) {
    const all=effects.length===4&&effects.every(e=>e.action==="spawn_enemy")&&new Set(effects.map(e=>e.hunter_type)).size===4;
    const equal=all&&new Set(effects.map(e=>e.amount)).size===1;
    const win=effects.length>0&&effects.every(e=>e.action==="win_change");
    const value=equal?String(effects.reduce((n,e)=>n+e.amount,0)):effects.map(e=>e.action==="win_change"?`${e.amount>=0?"+":""}${e.amount}`:String(Math.abs(e.amount))).join("/");
    const width=effects.length>4?Math.max(100,effects.length*28):100;
    let ordered=effects,positions;
    if(all){ordered=["red","pink","cyan","orange"].map(k=>effects.find(e=>e.hunter_type===k));positions=[[8,53,55,59],[41,53,55,59],[25,32,55,59],[25,70,55,59]];}
    else if(effects.length===2)positions=[[7,33,65,70],[35,66,62,66]];
    else if(effects.length>2){const size=Math.min(58,(width-8)/effects.length+18);positions=effects.map((_,i)=>[4+i*(width-size-8)/Math.max(1,effects.length-1),45+(i%2)*20,size,size]);}
    else positions=[[8,34,84,91]];
    return {width,height:180,amount_label:value+(win||!effects.length?"":"x"),win_only:win,amount_color:win?(effects[0].amount<0?"#ff333d":"#ffe05b"):"#ffffff",icons:ordered.map((e,i)=>({file:typeof manifest.actions[e.action]==="object"?manifest.actions[e.action][e.hunter_type]:manifest.actions[e.action],rect:positions[i],action:e.action,amount:e.amount}))};
  }
  async function drawCard(card,manifest,giftImages={},box={x:0,y:0,width:100,height:180}) {
    const effects=card.effects||legacyEffects(card),plan=card.render_plan||makePlan(effects,manifest);
    const c=document.createElement("canvas"),dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1)),scale=box.height/180;
    c.className="trigger-card";c.width=Math.ceil(box.width*dpr);c.height=Math.ceil(box.height*dpr);
    Object.assign(c.style,{left:`${box.x}px`,top:`${box.y}px`,width:`${box.width}px`,height:`${box.height}px`});
    c.setAttribute("aria-label",`${card.label||card.event_type}: ${plan.amount_label}; ${card.action_text||""}`);
    c.dataset.amount=plan.amount_label;c.dataset.eventType=card.event_type;c.dataset.mappingId=card.mapping_id||"";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.translate((box.width-plan.width*scale)/2,0);ctx.scale(scale,scale);textFit(ctx,plan.amount_label,[3,plan.win_only?25:0,plan.width-6,plan.win_only?40:31],plan.amount_color,plan.win_only?30:25);
    for(const icon of plan.icons){
      if(icon.file)contain(ctx,await image(`assets/${icon.file}`),icon.rect);
      else if(icon.action!=="win_change")textFit(ctx,"?",icon.rect,"#ffe05b",20);
    }
    const bottom=plan.win_only?[(plan.width-94)/2,85,94,94]:[(plan.width-64)/2,125,64,54];
    if(card.event_type==="like"){heart(ctx,bottom,card.trigger_count||1);c.dataset.socialAmount=String(card.trigger_count||1);}
    else if(card.event_type==="follow")contain(ctx,await image("assets/follow.png"),bottom);
    else {
      let gift=null;
      const data=giftImages[card.gift_image_key];
      // Schema 4: immutable shared Storage URL. Legacy schema 3 stays readable
      // during rollout; no sample gift asset fallback exists in either version.
      const assetURL = data && typeof data==="object" && /^[0-9a-f]{64}$/.test(card.gift_image_key||"") &&
        data.sha256===card.gift_image_key && data.url===`${api}/storage/v1/object/public/mnr-gift-artwork/sha256/${card.gift_image_key}.png` && publicImage(data.url) ? data.url : null;
      const legacyPNG = typeof data==="string" && data.length<=25000 && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(data) ? data : null;
      if(card.gift_id && (assetURL||legacyPNG)) {
        try {gift=await image(assetURL||legacyPNG);}catch {console.warn(`Cached gift PNG could not load: ID ${card.gift_id}`);}
      }
      if(gift){contain(ctx,gift,bottom);c.dataset.giftImage="loaded";c.dataset.giftId=card.gift_id;}
      else {
        textFit(ctx,"IMAGE MISSING",bottom,"#ff6868",9);c.dataset.giftImage="missing";
        console.warn(`Missing gift artwork: ${card.gift_name||"unnamed"} (ID ${card.gift_id||"missing"}). Sync gifts and Publish again.`);
      }
    }
    return c;
  }
  function compactLayout(payload) {
    const s=payload.overlay_settings||{},number=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback,width=Math.max(240,Math.min(1920,number(s.overlay_width,720)));
    const icon=Math.max(28,Math.min(96,number(s.icon_size,48))),cg=Math.max(0,number(s.column_gap,8)),rg=Math.max(0,number(s.row_gap,8)),manual=Math.max(0,number(s.cards_per_row,0));
    const positions=[];let x=0,y=payload.show_title?32:0,row=0,inRow=0,rowHeight=0;const counts=[];
    for(const card of (payload.cards||[])){const p=card.render_plan||{width:100},ratio=icon/84,w=Math.min(width,Math.max(icon+4,Math.ceil(Math.max(70,Number(p.width)||100)*ratio))),h=Math.max(62,Math.ceil(180*ratio));
      if((manual&&inRow>=manual)||(inRow&&x+w>width)){counts.push(inRow);y+=rowHeight+rg;row++;x=0;inRow=0;rowHeight=0;}
      positions.push({x,y,width:w,height:h,row});x+=w+cg;rowHeight=Math.max(rowHeight,h);inRow++;
    }
    if(inRow)counts.push(inRow);return {width,height:Math.max(1,y+rowHeight),rows:counts.length,cards:positions.length,row_counts:counts,positions,title_height:payload.show_title?32:0};
  }
  async function render(payload) {
    const serialized=JSON.stringify(payload);if(serialized===lastPayload)return;
    const token=++generation,manifest=await manifestPromise;
    const layout=compactLayout(payload),list=Array.isArray(payload.cards)?payload.cards:[];
    const nodes=await Promise.all(list.map((card,index)=>drawCard(card,manifest,payload.gift_images||{},layout.positions[index])));
    if(token!==generation)return;
    lastPayload=nodes.some(n=>n.dataset.giftImage==="missing")?"":serialized;
    title.hidden=!payload.show_title||!payload.title;title.textContent=payload.title||"";
    Object.assign(root.style,{width:`${layout.width}px`,height:`${layout.height}px`,background:(payload.overlay_settings||{}).background_mode==="custom"?((payload.overlay_settings||{}).background_color||"#101827"):"transparent"});
    root.dataset.outputWidth=String(layout.width);root.dataset.outputHeight=String(layout.height);root.dataset.rows=String(layout.rows);root.dataset.cards=String(layout.cards);
    cards.replaceChildren(...nodes);root.dataset.ready="true";root.dataset.artworkReady=String(!nodes.some(n=>n.dataset.giftImage==="missing"));
  }
  async function refresh() {
    if(refreshing||!publicImage(api)||!anon||!channel||!read)return;
    refreshing=true;
    try {
      const endpoint=legacyRead?"read_mnr_overlay":"read_mnr_overlay_update";
      const body={p_channel_id:channel,p_read_token:read};if(!legacyRead)body.p_revision=revision;
      const response=await fetch(`${api}/rest/v1/rpc/${endpoint}`,{method:"POST",cache:"no-store",signal:AbortSignal.timeout(10000),headers:{apikey:anon,"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!response.ok){if(response.status===404)legacyRead=true;console.warn(`Overlay read HTTP ${response.status}`);return;}
      const update=await response.json();
      const payload=legacyRead?update:update?.payload;
      if(payload&&typeof payload==="object"){
        currentPayload=payload;
        if(!legacyRead)revision=update.revision;
        await render(payload);
      }else if(currentPayload&&root.dataset.artworkReady!=="true"){
        // Retry failed image loads using the config already in memory, without
        // retransmitting all mappings on every poll during a CDN interruption.
        await render(currentPayload);
      }
    }catch(error){console.warn("Overlay refresh unavailable:",error.message);}
    finally{refreshing=false;}
  }

  refresh();setInterval(refresh, 2000);
})();

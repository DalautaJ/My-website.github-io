/* Matrix-style rain background */
const cv=document.getElementById('rain');
if(cv){const x=cv.getContext('2d');let cols,drops;
 const size=16,chars='01アイウエオ{}[]<>/#$%&*SECURE';
 const fit=()=>{cv.width=innerWidth;cv.height=innerHeight;cols=Math.floor(cv.width/size);drops=Array(cols).fill(1)};
 fit();addEventListener('resize',fit);
 setInterval(()=>{x.fillStyle='rgba(5,10,18,.12)';x.fillRect(0,0,cv.width,cv.height);x.fillStyle='#00ff9c';x.font=size+'px monospace';
  drops.forEach((y,i)=>{x.fillText(chars[Math.floor(Math.random()*chars.length)],i*size,y*size);
   if(y*size>cv.height&&Math.random()>.975)drops[i]=0;drops[i]++})},55)}

/* Scroll reveal */
const io=new IntersectionObserver(e=>e.forEach(a=>{if(a.isIntersecting){a.target.classList.add('show');io.unobserve(a.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Typing effect */
const ty=document.getElementById('type');
if(ty){const w=['Protect your data server.','Stop attackers before they strike.','Learn. Harden. Defend.'];let i=0,j=0,del=false;
 (function t(){const s=w[i];
  j+=del?-1:1;ty.textContent=s.slice(0,j);
  let d=del?35:70;
  if(!del&&j===s.length){del=true;d=1400}
  else if(del&&j===0){del=false;i=(i+1)%w.length;d=400}
  setTimeout(t,d)})()}

/* Hardening checklist progress */
const boxes=document.querySelectorAll('.check input');
if(boxes.length){const f=document.getElementById('fill'),p=document.getElementById('pct');
 const up=()=>{const n=[...boxes].filter(b=>b.checked).length,v=Math.round(n/boxes.length*100);
  f.style.width=v+'%';p.textContent=v+'% hardened ('+n+'/'+boxes.length+')'+(v===100?' — Fortress mode! 🏰':'')};
 boxes.forEach(b=>b.addEventListener('change',up));up()}

/* Scroll progress bar */
const pr=document.getElementById('prog');
if(pr)addEventListener('scroll',()=>{pr.style.width=scrollY/(document.documentElement.scrollHeight-innerHeight)*100+'%'});

/* Card spotlight follows the mouse */
document.querySelectorAll('.card').forEach(c=>c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}));

/* Login: 3D tilt + show/hide password */
const tilt=document.getElementById('tilt');
if(tilt)document.addEventListener('mousemove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;tilt.style.transform='perspective(900px) rotateY('+x*14+'deg) rotateX('+(-y*14)+'deg)'});
const eye=document.getElementById('eye');
if(eye)eye.addEventListener('click',()=>{const p=document.getElementById('pw');p.type=p.type==='password'?'text':'password'});

/* Click a card -> popup with meaning + how to protect */
const D={
"White Hat":["An ethical hacker who breaks into systems only with written permission, to find security holes before criminals do. Also called a penetration tester.",["Hire certified testers (such as CEH or OSCP) for regular penetration tests","Run a bug bounty program so researchers can report flaws safely","Fix reported problems quickly, then test again","Always get written permission before testing any system"],"🛡️ How they help"],
"Black Hat":["A criminal hacker who breaks into systems without permission to steal data or money, or to cause damage, for example selling stolen passwords or spreading ransomware.",["Use strong, unique passwords with multi-factor authentication","Keep all software patched and up to date","Keep tested offline backups","Train staff to spot scams, and monitor your logs"]],
"Grey Hat":["Someone who hacks without permission but usually without evil intent, sometimes telling the owner about the flaw afterward. It is still illegal to access a system without permission.",["Publish a security contact and a responsible-disclosure policy so people can report bugs safely","Respond to reports quickly and fix the issue","Keep systems patched so there are fewer holes to find","Never test a system you don't have permission for"]],
"Script Kiddie":["A beginner who runs ready-made hacking tools made by others without really understanding them. They aim at easy, well-known weaknesses.",["Patch known vulnerabilities quickly","Change all default usernames and passwords","Use rate limiting and a firewall","Remove unused services and software"]],
"Hacktivist":["A hacker who attacks to promote a political or social cause, for example defacing a website, leaking data or knocking a site offline.",["Use DDoS protection or a CDN","Put a web application firewall (WAF) in front of your sites","Monitor your website for unexpected changes and keep clean backups","Limit how much sensitive data is stored and exposed"]],
"State-Sponsored (APT)":["APT means Advanced Persistent Threat: a skilled, well-funded group, often backed by a government, that quietly stays inside a network for months to steal secrets.",["Segment the network so one breach can't reach everything","Use endpoint detection (EDR) and centralized logging","Require hardware security keys for important accounts","Follow zero-trust: verify every user and device, every time"]],
"Blue Team":["The defenders. They monitor systems, patch weaknesses, hunt for intruders and respond when something goes wrong.",["Watch logs and alerts with a SIEM tool","Patch and harden systems regularly","Practice incident response with drills","Use red team reports to fix the weak spots"],"🛡️ What they do"],
"Red Team":["Authorized \"attackers\" hired to act like real criminals and test how well the defenders cope, so the weaknesses get fixed first.",["Simulate real attacks such as phishing and network intrusion","Test both digital and physical security","Write a clear report of what worked and why","Re-test after fixes to confirm the holes are closed"],"🛡️ What they do"],
"Phishing":["Fake emails, texts or websites that pretend to be a trusted company or person to trick you into giving up passwords, money or clicking something harmful.",["Don't click unexpected links or open unexpected attachments","Check the sender's real address and the website's URL","Verify strange requests through a different channel, like a phone call","Turn on MFA so a stolen password alone isn't enough","Use a password manager, which won't autofill on fake sites","Report suspicious emails to your IT team"]],
"Brute Force":["An attack where software automatically tries huge numbers of passwords until one works. Short or common passwords fall quickly.",["Use long passphrases (12+ characters)","Turn on multi-factor authentication","Limit login attempts and lock accounts after repeated failures","Use fail2ban or similar tools to ban attacking IPs","Use SSH keys instead of passwords for servers"]],
"SQL Injection":["The attacker types database commands into a form or URL, and a badly written app runs them. This can reveal, change or delete data.",["Use parameterized queries (prepared statements), never join user input into SQL","Validate and sanitize all input","Give the app's database account only the permissions it needs","Hide detailed database errors from users","Put a WAF in front and keep frameworks updated"]],
"DDoS":["Distributed Denial of Service: thousands of machines flood a server with traffic so real users can't get in.",["Use a CDN or DDoS-protection service","Apply rate limiting and traffic filtering","Design the system to scale up under load","Have a response plan and your ISP's contact ready"]],
"Ransomware":["Malware that locks or encrypts your files and demands payment to unlock them. It often arrives through phishing emails or unpatched servers.",["Keep 3-2-1 backups, with one offline copy, and test restores","Patch systems quickly","Filter email attachments and train users","Use least privilege and network segmentation to limit spread","Get expert help before ever considering payment; there is no guarantee"]],
"Unpatched Software":["Old software that still has a known flaw. Attackers scan the internet for exactly these servers because the exploit is already public.",["Turn on automatic security updates","Keep an inventory of all software you run","Run regular vulnerability scans","Remove software you no longer use","Follow vendor security advisories"]],
"Insider Threats":["A current or former employee, or contractor, who misuses their access, whether by accident or on purpose, and causes a breach.",["Give each person only the access they need (least privilege)","Review who has access on a regular schedule","Remove accounts immediately when someone leaves","Keep audit logs and watch unusual activity","Separate duties so one person can't do everything"]],
"Man-in-the-Middle":["The attacker secretly sits between you and the server, reading or changing the data passing through. Fake public Wi-Fi is a common trap.",["Use HTTPS/TLS with valid certificates, and enable HSTS","Use a VPN on public Wi-Fi","Never ignore browser certificate warnings","Use WPA3 or WPA2 with a strong password on your own Wi-Fi"]],
"Virus":["Malicious code that attaches itself to a file or program and spreads when that file is opened or shared.",["Run up-to-date antivirus or EDR software","Don't open unknown attachments or downloads","Install software only from trusted sources","Keep the OS and apps patched, and keep backups"]],
"Worm":["Malware that copies itself across a network on its own, with no user action needed, often through unpatched services.",["Patch quickly, especially network-facing services","Segment the network and use a firewall","Disable services you don't use","Isolate any infected machine at once"]],
"Trojan":["Harmful software disguised as something useful, like a free tool or a game. Once installed it may steal data or open a backdoor.",["Download only from official sources","Check file names and types before opening","Don't run everyday work as an administrator","Use application allowlisting and antivirus"]],
"Spyware & Keyloggers":["Software that secretly records what you do, such as screens, browsing and every key you type, to steal passwords and personal data.",["Use anti-malware software and keep your OS updated","Turn on MFA so stolen passwords alone don't work","Use a password manager or hardware security key","Review installed programs and browser extensions regularly"]],
"Botnet":["A network of infected computers, phones or smart devices controlled remotely by an attacker, often used for DDoS attacks or spam.",["Change default passwords on routers and IoT devices","Keep device firmware updated","Monitor outgoing traffic for strange connections","Disconnect and clean infected devices"]],
"Cryptojacking":["Malware that secretly uses your server's processing power to mine cryptocurrency for the attacker, slowing everything down and raising your costs.",["Watch for unexplained CPU spikes and slow performance","Use endpoint protection and patch systems","Block known mining-pool domains","Restrict browser scripts and extensions","Set billing alerts on cloud accounts"]],
"1. Detect":["The first stage of incident response: noticing that an attack is happening or has happened, and confirming it's real.",["Check alerts and logs, and decide if it's a real attack or a false alarm","Write down the time, affected systems and what you saw","Tell your manager or incident response team right away","Start a log of every action you take"],"🧭 What to do"],
"2. Contain":["Stopping the attack from spreading and doing more damage, while keeping evidence for later.",["Disconnect affected machines from the network","Disable compromised accounts and block attacker IPs","Preserve logs and copies of affected disks as evidence","Switch to backup systems if needed"],"🧭 What to do"],
"3. Eradicate":["Removing the attacker and everything they left behind, and closing the hole they used to get in.",["Find the root cause of the breach","Remove malware, backdoors and unknown accounts","Patch the vulnerability that was used","Reset passwords and keys, then scan all systems"],"🧭 What to do"],
"4. Recover":["Getting back to normal safely, then learning from what happened so it doesn't repeat.",["Restore from clean, tested backups","Change all passwords and keys","Monitor closely for signs of the attacker returning","Write a lessons-learned report and update your plan","Inform affected people if the law requires it"],"🧭 What to do"]
};
const md=document.getElementById('modal');
if(md){
 const close=()=>md.classList.remove('open');
 document.querySelectorAll('.card').forEach(c=>{
  const t=c.querySelector('h3').textContent.trim();if(!D[t])return;
  c.classList.add('click');c.tabIndex=0;
  c.insertAdjacentHTML('beforeend','<div class="more">Click to learn more →</div>');
  const open=()=>{const d=D[t],ul=document.getElementById('mp');
   document.getElementById('mic').textContent=c.querySelector('.ic').textContent;
   document.getElementById('mt').textContent=t;
   document.getElementById('mm').textContent=d[0];
   document.getElementById('mh').textContent=d[2]||'🛡️ How to protect';
   ul.innerHTML='';d[1].forEach((b,i)=>{const l=document.createElement('li');l.textContent=b;l.style.animationDelay=(0.15+i*0.1)+'s';ul.appendChild(l)});
   md.classList.add('open');md.querySelector('.mbox').scrollTop=0};
  c.addEventListener('click',open);
  c.addEventListener('keydown',e=>{if(e.key==='Enter')open()});
 });
 document.getElementById('mx').onclick=close;
 document.getElementById('mclose').onclick=close;
 md.addEventListener('click',e=>{if(e.target===md)close()});
 addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}

/* Logged-in user chip + real logout (website page) */
const who=document.getElementById('who'),lo=document.getElementById('logout');
if(who)fetch('/api/me',{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(d=>{if(d)who.textContent='👤 '+d.username});
if(lo)lo.addEventListener('click',e=>{e.preventDefault();fetch('/api/logout',{method:'POST',credentials:'same-origin'}).finally(()=>location.href='/login.html')});
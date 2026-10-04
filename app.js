/* =================== helpers =================== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function h(tag,attrs,...kids){const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(v===false||v==null)continue;if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on')&&typeof v==='function')e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>String(s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/[“”„"]/g,' ').replace(/[–—]/g,'-').replace(/[.,!?;:]/g,' ').replace(/\s+/g,' ').trim();
const store={get(k,d){try{const v=localStorage.getItem('cd9:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('cd9:'+k,JSON.stringify(v))}catch(e){}}};
const SPEAK_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>';

/* =================== reading text + line references =================== */
const BLOG_PARAS=[
`Fourteen months ago, I packed two suitcases, said goodbye to my parents in Dayton, Ohio, and took a Greyhound bus to Los Angeles. My mom cried the whole morning. My dad just said, "You'll be back by Christmas." Well, Dad, it's March, and I'm still here.`,
`Let me be honest: life in LA is not like the movies. I share a tiny apartment in North Hollywood with two other girls, and my room is so small that I have to climb over my bed to open the closet. My part of the rent is $900 a month, so I work five nights a week as a waitress in a diner on Ventura Boulevard. The pay is terrible – most of what I earn comes from tips. On a good night, I go home with $120. On a bad night, I go home with sore feet and $40.`,
`During the day, I go to auditions. Last month I went to eleven of them. So far, I've played a dead body in a student film, a "girl in the crowd" in a car commercial and a talking cupcake in an ad for a bakery chain (please don't ask). I didn't get paid for the student film, but I did get a free sandwich and a new line for my résumé.`,
`Rejection is part of the job, everybody says. What they don't tell you is how much it hurts. Last week, I waited three hours in a hallway with forty other girls who all looked exactly like me – same age, same long brown hair, same nervous smile. I was in the room for ninety seconds. The casting director didn't even look up from her phone. When I got back to my car, I sat there and cried for twenty minutes. Then I put on some lipstick and drove to my shift at the diner. The customers don't care about my bad day, and neither does the rent.`,
`My roommate Jess thinks I should give up and go to college. "You're smart, Lucy," she keeps telling me. "You could be a lawyer or a teacher." Maybe she's right. But every time I think about quitting, I remember standing on the stage of my high school theater in Dayton, playing Juliet, and hearing three hundred people go completely silent. I want to feel that again. I'm not doing this to become rich or famous. I'm doing it because acting is the only thing that makes me feel completely alive.`,
`And now the good news: yesterday my agent called. I've got a callback for a supporting role in a new streaming series! It's a small part – a young nurse with six scenes – but it's a real part, with a real name and real lines. I've already read the script four times, and I'm practicing my lines in front of the bathroom mirror while my roommates bang on the door.`,
`I'm trying not to get too excited. I've had callbacks before, and nothing happened. But tonight, while I'm carrying plates of pancakes to strangers, I'll be smiling a little more than usual. Wish me luck! – L.`
];
function wrapParas(paras,width){const lines=[];paras.forEach((p,pi)=>{let cur='',first=true;p.split(/\s+/).forEach(w=>{if(cur&&(cur+' '+w).length>width){lines.push({t:cur,ps:first});first=false;cur=w}else cur=cur?cur+' '+w:w});if(cur)lines.push({t:cur,ps:first})});return lines}
const BLOG_LINES=wrapParas(BLOG_PARAS,58);
function lineOf(lines,phrase){let joined='';const starts=[];lines.forEach(l=>{starts.push(joined.length);joined+=l.t+' '});const i=joined.indexOf(phrase);if(i<0){console.warn('line ref not found:',phrase);return 'l. ?'}const at=pos=>{let n=0;while(n+1<starts.length&&starts[n+1]<=pos)n++;return n+1};const a=at(i),b=at(i+phrase.length-1);return a===b?'l. '+a:'ll. '+a+'–'+b}
const fmt=s=>String(s).replace(/\{L:(.+?)\}/g,(m,p)=>lineOf(BLOG_LINES,p)).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');

/* =================== vocabulary =================== */
/* Vokabeln kommen ausschließlich aus Navigium (data/vokabeln.js, erzeugt von tools/navigium_export.py). */
const VDATA=window.VOKABELN||{buch:'',lektionen:[]};
const WORTART={SUBST:'Nomen',VERB:'Verb',ADJ:'Adjektiv',ADV:'Adverb',PHR:'Wendung',KONJ:'Konjunktion',PRAEP:'Präposition',PRON:'Pronomen'};
const TOPICS=Object.fromEntries(VDATA.lektionen.map(l=>[l.id,'L'+l.lektion+' · '+l.seite]));
const ALLVOC=VDATA.lektionen.flatMap(l=>l.vokabeln.map(v=>({en:v.en,de:v.de.join('; '),deKurz:v.de.slice(0,2).join('; '),wa:v.wortart,topic:l.id})));
const slug=s=>s.toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'');
const vocId=v=>'voc-'+slug(v.en)+'-'+slug(v.wa||'');
const cleanEn=en=>en.replace(/\((AE|BE|infrm|coll|no pl|pl)\)/gi,'').replace(/\s+/g,' ').trim();
function vocVariants(en,wa){const out=new Set();const forms=cleanEn(en).split(',').map(x=>x.trim()).filter(Boolean);if(!forms.length)return [en];
  const m=forms[0].match(/^(.*?)\s*\(([^)]*)\)\s*(.*)$/);
  const heads=m?[(m[1]+' '+m[3]).trim(),(m[1]+' '+m[2]+' '+m[3]).trim()]:[forms[0]];
  heads.forEach(hd=>{const noTo=hd.replace(/^to\s+/,'');const opts=(wa==='VERB'||wa==='PHR')?[hd,noTo,'to '+noTo]:[hd];
    opts.forEach(x=>{out.add(x);if(forms.length>1)out.add([x,...forms.slice(1)].join(', '))})});
  return [...out]}
const traitWords=['ambitious','determined','self-confident','insecure','shy','outgoing','reserved','reliable','hard-working','lazy','selfish','generous','caring','considerate','stubborn','honest','arrogant','modest','vain','sensitive','impatient','curious','creative','cheerful','moody','naive','optimistic','pessimistic','independent','jealous','ruthless','easy-going','resilient','down-to-earth','passionate','vulnerable','brave','self-critical','hopeful','aspiring'];

/* =================== exercises =================== */
const EX={
g1a:{title:'to oder kein to?',type:'mc',keep:true,intro:'Tipp an, ob <i>to</i> in die Lücke gehört (–  = kein to). Du siehst sofort, ob es stimmt und warum.',items:[
{q:"My parents won't let me ___ go to the audition alone.",o:['to','–'],a:1,why:'<b>let</b> + Objekt + Infinitiv <b>ohne</b> to.'},
{q:"Lucy decided ___ move to Los Angeles.",o:['to','–'],a:0,why:'<b>decide</b> + to-Infinitiv.'},
{q:"You should ___ learn your lines by heart.",o:['to','–'],a:1,why:'Nach Modalverben (should) steht der Infinitiv ohne to.'},
{q:"The director made us ___ repeat the scene ten times.",o:['to','–'],a:1,why:'<b>make</b> + Objekt + Infinitiv ohne to („jdn. etwas tun lassen“).'},
{q:"We were made ___ repeat the scene ten times.",o:['to','–'],a:0,why:'Falle! Im <b>Passiv</b> (be made) steht to.'},
{q:"It's not easy ___ find a cheap flat in LA.",o:['to','–'],a:0,why:'Nach Adjektiven (easy) steht to.'},
{q:"You'd better ___ be on time for the shoot.",o:['to','–'],a:1,why:'<b>had better</b> + Infinitiv ohne to.'},
{q:"I'd rather ___ work as a waiter than give up my dream.",o:['to','–'],a:1,why:'<b>would rather</b> + Infinitiv ohne to.'},
{q:"She's too young ___ sign a contract without her parents.",o:['to','–'],a:0,why:'<b>too</b> + Adjektiv + to-Infinitiv.'},
{q:"Nobody knew what ___ do when the camera broke.",o:['to','–'],a:0,why:'Fragewort + to-Infinitiv: what to do, how to do …'},
{q:"I heard the director ___ shout at the actors.",o:['to','–'],a:1,why:'Wahrnehmungsverben (hear, see, watch) + Objekt + Infinitiv ohne to.'},
{q:"He was the first actor ___ win three Oscars in a row.",o:['to','–'],a:0,why:'<b>the first / last / only</b> + to-Infinitiv.'},
{q:"Why not ___ try your luck at the casting?",o:['to','–'],a:1,why:'<b>Why not</b> + Infinitiv ohne to.'},
{q:"She went to acting school ___ improve her skills.",o:['to','–'],a:0,why:'Zweck („um … zu“) → to.'},
{q:"Can you help me ___ carry these cameras?",o:['to','–'],a:[0,1],why:'Nach <b>help</b> ist beides richtig.'},
{q:"The agent wants me ___ send her new photos.",o:['to','–'],a:0,why:'<b>want sb to do sth</b> – nie „want that …“.'},
{q:"Did you ___ see the trailer?",o:['to','–'],a:1,why:'Nach do/does/did steht der Infinitiv ohne to.'},
{q:"Ella is allowed ___ stay on the set until midnight.",o:['to','–'],a:0,why:'<b>be allowed to</b>.'}
]},
g1b:{title:'Setz die richtige Form ein',type:'gap',intro:'Schreib das Verb in Klammern mit oder ohne <i>to</i> in die Lücke. <b>Enter</b> springt zur nächsten Lücke.',items:[
{s:"My boss lets me {{leave::leave}} early for auditions.",why:'let + Objekt + Infinitiv ohne to.'},
{s:"The teacher told us {{to read::read}} the novel extract.",why:'tell sb to do sth.'},
{s:"I'd like {{to work::work}} in the film industry one day.",why:'would like + to.'},
{s:"They saw the stuntman {{jump::jump}} off the roof.",why:'see sb do sth – ohne to.'},
{s:"She must {{practise|practice::practise}} every day.",why:'Modalverb → ohne to.'},
{s:"It was exciting {{to meet::meet}} a real director.",why:'Adjektiv + to.'},
{s:"We don't know where {{to go::go}} after the premiere.",why:'Fragewort + to.'},
{s:"Don't make me {{laugh::laugh}}!",why:'make sb do sth – ohne to.'},
{s:"He saved money {{to buy::buy}} a better camera.",why:'Zweck → to.'},
{s:"You'd better {{not be::not / be}} late tomorrow.",why:'had better not + Infinitiv ohne to.'}
]},
g2s:{title:'Welche Gruppe?',type:'mc',keep:true,cats:['nur -ing','nur to','beides'],intro:'Sortiere die Verben. Das ist die Grundlage für alles andere.',items:[
{q:'enjoy',a:0},{q:'decide',a:1},{q:'avoid',a:0},{q:'hope',a:1},{q:'begin',a:2},{q:'finish',a:0},{q:'refuse',a:1},{q:'love',a:2,why:'Aber: <b>would love</b> + to.'},{q:'suggest',a:0,why:'suggest + -ing (oder suggest that …), nie suggest to.'},{q:'manage',a:1},{q:'keep',a:0},{q:'afford',a:1},{q:'start',a:2},{q:'give up',a:0},{q:'promise',a:1},{q:"can't stand",a:0},{q:'mind',a:0},{q:'prefer',a:2,why:'Aber: <b>would prefer</b> + to.'},{q:'seem',a:1},{q:'look forward to',a:0,why:'to ist hier eine Präposition → -ing.'}
]},
g2a:{title:'Gerund or infinitive?',type:'gap',intro:'Setz das Verb in der richtigen Form ein: <i>-ing</i> oder <i>to + Infinitiv</i>.',items:[
{s:"Lucy enjoys {{acting::act}} in front of an audience.",why:'enjoy + -ing.'},
{s:"She hopes {{to get::get}} the lead role.",why:'hope + to.'},
{s:"Have you finished {{learning::learn}} your lines?",why:'finish + -ing.'},
{s:"He refused {{to wear::wear}} the ridiculous costume.",why:'refuse + to.'},
{s:"I'm looking forward to {{meeting::meet}} the cast.",why:'look forward to + -ing (to = Präposition).'},
{s:"They can't afford {{to pay::pay}} the rent this month.",why:'afford + to.'},
{s:"Would you mind {{closing::close}} the door?",why:'mind + -ing.'},
{s:"She is interested in {{writing::write}} screenplays.",why:'Nach Präpositionen immer -ing.'},
{s:"The actors agreed {{to work::work}} overtime.",why:'agree + to.'},
{s:"Avoid {{looking::look}} directly into the camera.",why:'avoid + -ing.'},
{s:"He managed {{to find::find}} a part-time job.",why:'manage + to.'},
{s:"Instead of {{giving::give}} up, she took more acting classes.",why:'instead of (Präposition) + -ing.'},
{s:"{{Waiting::wait}} for a callback can be really stressful.",why:'-ing-Form als Subjekt am Satzanfang.'},
{s:"I'd like {{to visit::visit}} the Warner Bros. studios.",why:'would like + to.'},
{s:"She started {{crying|to cry::cry}} when she heard the news.",why:'start: beides möglich.'},
{s:"He keeps {{making::make}} the same mistake.",why:'keep + -ing.'},
{s:"We're used to {{working::work}} late.",why:'be used to + -ing (gewohnt sein).'},
{s:"They promised {{to call::call}} me back.",why:'promise + to.'},
{s:"Mark suggested {{going::go}} to the beach after the shoot.",why:'suggest + -ing.'},
{s:"I can't help {{laughing::laugh}} when I see that scene.",why:"can't help + -ing (nicht anders können als)."}
]},
g2b:{title:'Bedeutung entscheidet',type:'mc',intro:'Bei diesen Verben ändert sich die Bedeutung. Lies den ganzen Satz, bevor du wählst.',items:[
{q:"I remember ___ the Hollywood sign for the first time. It was amazing.",o:['seeing','to see'],a:0,why:'Erinnerung an etwas Vergangenes → remember + -ing.'},
{q:"Remember ___ your passport for the trip to LA!",o:['taking','to take'],a:1,why:'An etwas denken, das noch zu tun ist → remember + to.'},
{q:"I'll never forget ___ Tom Hanks at the premiere.",o:['meeting','to meet'],a:0,why:'Vergangenes Erlebnis nicht vergessen → forget + -ing.'},
{q:"Don't forget ___ the director back.",o:['calling','to call'],a:1,why:'Vergessen, etwas zu tun → forget + to.'},
{q:"The tour bus stopped ___ photos of the Walk of Fame.",o:['taking','to take'],a:1,why:'Anhalten, <b>um zu</b> → stop + to.'},
{q:"She stopped ___ fast food when she got the role.",o:['eating','to eat'],a:0,why:'Mit etwas aufhören → stop + -ing.'},
{q:"If you can't sleep before an audition, try ___ some yoga.",o:['doing','to do'],a:0,why:'Etwas ausprobieren → try + -ing.'},
{q:"He tried ___ the camera, but it was too heavy.",o:['lifting','to lift'],a:1,why:'Sich bemühen (und es klappt nicht) → try + to.'},
{q:"We regret ___ you that you didn't get the part.",o:['telling','to tell'],a:1,why:'Formell bedauern, etwas mitteilen zu müssen → regret + to.'},
{q:"Today I regret ___ my acting classes so early.",o:['giving up','to give up'],a:0,why:'Etwas Getanes bereuen → regret + -ing.'},
{q:"After the shoot, the actors went on ___ for hours.",o:['talking','to talk'],a:0,why:'Weitermachen mit derselben Sache → go on + -ing.'},
{q:"After her first small role, she went on ___ in more than fifty films.",o:['acting','to act'],a:1,why:'Danach etwas Neues tun → go on + to.'}
]},
g3a:{title:'Emphatic do',type:'gap',intro:'Betone mit <i>do / does / did</i> + Grundform. Achte auf die Zeit.',items:[
{s:"I know you don't believe me, but I {{did send::send – past}} the email!",why:'Past: did + Grundform (nicht did sent).'},
{s:"She {{does want::want}} to become an actress – she's just shy.",why:'3. Person Singular Präsens: does + Grundform.'},
{s:"{{Do come::come}} to my premiere next week!",why:'Imperativ: Do + Grundform – klingt herzlich-nachdrücklich.'},
{s:"He {{did practise|did practice::practise – past}} a lot before the audition.",why:'did + Grundform.'},
{s:"You {{do look::look}} tired today.",why:'do + Grundform.'},
{s:"Lucy {{did get::get – past}} a free sandwich for the student film.",why:'Genau so steht es in Lucys Blog: "I did get a free sandwich".'},
{s:"The film {{does have::have}} some great special effects, I admit.",why:'does + have.'}
]},
g3b:{title:'Satz umbauen',type:'rewrite',intro:'Hebe den <mark>markierten</mark> Teil hervor. Die Struktur steht rechts; ein Anfang ist im Feld angedeutet.',items:[
{p:"Mia got the lead role.",em:"Mia",task:"It was … who",start:"It was …",a:["It was Mia who got the lead role","It was Mia that got the lead role"],why:'It was + betonter Teil + who/that + Rest.'},
{p:"She met the director in a coffee shop.",em:"in a coffee shop",task:"It was … that",start:"It was …",a:["It was in a coffee shop that she met the director"],why:'Ort betont → It was … that.'},
{p:"Hollywood attracts thousands of dreamers every year.",em:"Hollywood",task:"It is … that",start:"It is …",a:["It is Hollywood that attracts thousands of dreamers every year","It is Hollywood which attracts thousands of dreamers every year","It's Hollywood that attracts thousands of dreamers every year","It's Hollywood which attracts thousands of dreamers every year"],why:'Präsens bleibt Präsens: It is …'},
{p:"I need a big break.",em:"a big break",task:"What … is",start:"What …",a:["What I need is a big break"],why:'What + Subjekt + Verb + is + betonter Teil.'},
{p:"They want fame, not money.",em:"fame",task:"What … is",start:"What …",a:["What they want is fame, not money","What they want is fame and not money"],why:'What they want is …'},
{p:"Lucy hates the waiting.",em:"the waiting",task:"What … is",start:"What …",a:["What Lucy hates is the waiting","What she hates is the waiting"],why:'What Lucy hates is …'},
{p:"The money worries her.",em:"The money",task:"What … is",start:"What …",a:["What worries her is the money"],why:'Hier ist <i>what</i> selbst das Subjekt: What worries her is …'},
{p:"I like your new film.",em:"like",task:"do / does / did",start:"I …",a:["I do like your new film","I really do like your new film"],why:'do + Grundform.'},
{p:"She worked hard for the role.",em:"worked",task:"do / does / did",start:"She …",a:["She did work hard for the role"],why:'Past → did + Grundform (work, nicht worked).'},
{p:"Jake wrote the script.",em:"Jake",task:"Reflexivpronomen",start:"Jake …",a:["Jake wrote the script himself","Jake himself wrote the script"],why:'himself = selbst.'},
{p:"The director called me last night.",em:"last night",task:"It was … that",start:"It was …",a:["It was last night that the director called me"],why:'Zeit betont → It was … that.'},
{p:"Sit down, please.",em:"Sit down",task:"do (Imperativ)",start:"Do …",a:["Do sit down please","Please do sit down","Do sit down"],why:'Do + Imperativ.'}
]},
g3c:{title:'so, such, at all & Co.',type:'mc',intro:'Wähl den passenden Verstärker.',items:[
{q:"It was ___ a great film that we watched it twice.",o:['such','so','very'],a:0,why:'<b>such a</b> + Adjektiv + Nomen.'},
{q:"The film was ___ long that I fell asleep.",o:['so','such','such a'],a:0,why:'<b>so</b> + Adjektiv (ohne Nomen).'},
{q:"I didn't like the sequel ___.",o:['at all','very much not','totally'],a:0,why:'not … <b>at all</b> = überhaupt nicht.'},
{q:"Nobody helped her. She built the whole set ___.",o:['herself','her','by her'],a:0,why:'Reflexivpronomen = selbst.'},
{q:"This is the ___ best film I've ever seen.",o:['very','so','such'],a:0,why:'<b>the very best</b> = der allerbeste.'},
{q:"He was ___ nervous that he forgot his lines.",o:['so','such','such a'],a:0,why:'so + Adjektiv + that.'},
{q:"We had ___ fun at the premiere!",o:['such','so','such a'],a:0,why:'such + unzählbares Nomen (fun) – ohne a.'},
{q:"Did you really write the script ___?",o:['yourself','by yourselfs','you'],a:0,why:'yourself = selbst.'},
{q:"___ she gets is a free sandwich.",o:['All','What all','Everything what'],a:0,why:'<b>All she gets is …</b> = mehr bekommt sie nicht – betont, wie wenig es ist.'}
]},
r1:{title:'Multiple choice',type:'mc',fixed:true,intro:'Wähle jeweils die Antwort, die zum Text passt.',items:[
{q:'Why did Lucy move to Los Angeles?',o:['to become an actress','to go to college','to live with her friend Jess','to work in a diner'],a:0,why:'Sie geht zu Auditions und will spielen; der Diner-Job bezahlt nur die Miete.'},
{q:'How did her father react to her plans?',o:["He didn't think she would stay long.",'He cried the whole morning.','He paid for her bus ticket.','He went to LA with her.'],a:0,why:'"You\'ll be back by Christmas." ({L:You\'ll be back by Christmas}) – geweint hat die Mutter.'},
{q:'Most of the money Lucy earns comes from …',o:['tips','her salary','acting jobs','her parents'],a:0,why:'"most of what I earn comes from tips" ({L:most of what I earn comes from tips})'},
{q:'What happened at last week\'s audition?',o:['The casting director seemed uninterested.','Lucy forgot her lines.','Lucy got the part.','Lucy arrived three hours late.'],a:0,why:'"The casting director didn\'t even look up from her phone." ({L:didn\'t even look up})'},
{q:'What does Lucy say about the new role?',o:["It's small, but it's a real part.","It's the leading role.","It's unpaid.","It's in a cinema film."],a:0,why:'"It\'s a small part […] but it\'s a real part" ({L:It\'s a small part})'},
{q:'How does Lucy feel at the end of the entry?',o:['hopeful but careful','completely sure she will get the role','angry at her roommates','ready to give up'],a:0,why:'"I\'m trying not to get too excited" ({L:trying not to get too excited}), but "I\'ll be smiling" ({L:I\'ll be smiling}).'}
]},
r2:{title:'True, false or not given?',type:'mc',keep:true,fixed:true,cats:['true','false','not given'],intro:'<b>Not given</b> heißt: Der Text sagt dazu nichts. Die Rückmeldung nennt dir die Belegstelle.',items:[
{q:'Lucy has been living in LA for more than a year.',a:0,why:'"Fourteen months ago" ({L:Fourteen months ago})'},
{q:'Lucy has her own apartment.',a:1,why:'"I share a tiny apartment […] with two other girls" ({L:I share a tiny apartment})'},
{q:'Lucy earns more tips on weekends than during the week.',a:2,why:'Sie nennt gute und schlechte Abende, aber nichts zu Wochenenden.'},
{q:'Lucy was paid for her role in the student film.',a:1,why:'"I didn\'t get paid for the student film" ({L:I didn\'t get paid})'},
{q:'Jess is studying to become a lawyer.',a:2,why:'Jess sagt, <i>Lucy</i> könnte Anwältin werden ({L:You could be a lawyer}). Über Jess\' Ausbildung steht nichts im Text.'},
{q:'Lucy once played Juliet at her high school.',a:0,why:'"playing Juliet" ({L:playing Juliet})'},
{q:'This is Lucy\'s first callback.',a:1,why:'"I\'ve had callbacks before" ({L:I\'ve had callbacks before})'},
{q:'Lucy\'s main goal is to become rich and famous.',a:1,why:'"I\'m not doing this to become rich or famous." ({L:I\'m not doing this to become rich})'}
]},
r4:{title:'Words in context',type:'gap',fixed:true,intro:'Finde die englischen Wörter im Text.',items:[
{s:'Kleiderschrank (Abschnitt 2): {{closet}}'},
{s:'Trinkgeld (Abschnitt 2): {{tips|tip}}'},
{s:'Werbespot (Abschnitt 3): {{commercial|ad|a commercial|an ad}}'},
{s:'Flur (Abschnitt 4): {{hallway}}'},
{s:'Schicht (Abschnitt 4): {{shift}}'},
{s:'aufhören, hinschmeißen (Abschnitt 5): {{quitting|quit}}'},
{s:'zweites Vorsprechen (Abschnitt 6): {{callback|a callback}}'},
{s:'Nebenrolle (Abschnitt 6): {{supporting role|a supporting role}}'}
]},
r3:{title:'Open questions',type:'open',intro:'Antworte in ganzen englischen Sätzen und mit Zeilenangabe. Danach vergleichst du mit der Musterlösung und bewertest dich selbst.',items:[
{q:'What does the comment of Lucy\'s father tell you about his attitude towards her plans?',m:'Her father does not take her dream seriously. When she leaves, he only says, "You\'ll be back by Christmas" ({L:You\'ll be back by Christmas}). This shows that he expects her to fail and come home soon.'},
{q:'Describe how Lucy reacts to the rejection at last week\'s audition.',m:'First, she is very hurt: she sits in her car and cries "for twenty minutes" ({L:cried for twenty minutes}). Then she pulls herself together, puts on some lipstick and drives to her shift at the diner ({L:put on some lipstick}). She does not let the rejection stop her.'},
{q:'Explain what Lucy means when she writes "neither does the rent" ({L:neither does the rent}).',m:'She means that her bills have to be paid no matter how she feels. The rent does not care about her bad day, so she has to go to work even when she is sad.'},
{q:'Why does Lucy not give up, although her life in LA is hard?',m:'Acting is her passion. She remembers playing Juliet and hearing "three hundred people go completely silent" ({L:three hundred people go}). She wants to feel that again, because acting is "the only thing that makes [her] feel completely alive" ({L:the only thing that makes me}).'}
]},
l1:{title:'Listening comprehension',type:'mc',fixed:true,intro:'Die Fragen folgen der Reihenfolge des Gesprächs.',items:[
{q:'When did Maya have to be on set?',o:['at 5:30 a.m.','at 11 p.m.','at 7:30 a.m.','at noon'],a:0,why:'"They told me to be here at five thirty this morning."'},
{q:'What did Maya bring?',o:['one blue sweater','three outfits','a nurse\'s uniform','her own breakfast'],a:0,why:'"I only brought one, a blue sweater."'},
{q:'Where is the catering truck?',o:['behind sound stage twelve','next to the parking lot','in the wardrobe tent','behind stage forty-two'],a:0,why:'"The catering truck is behind sound stage twelve."'},
{q:'How long has Jake been working as an extra?',o:['eight years','eighteen years','two years','forty years'],a:0,why:'"Eight years." – 40 ist die Zahl seiner Filme als Kellner.'},
{q:'What was Jake\'s line in one of his speaking roles?',o:['"Your table is ready, sir."','"Action!"','"Welcome to Hollywood."','"Police! Don\'t move!"'],a:0,why:'"I said, \'Your table is ready, sir\', to Brad Pitt\'s stunt double."'},
{q:'How much does an extra earn for a twelve-hour day?',o:['about $200','about $120','about $900','about $40'],a:0,why:'"Extras get about two hundred dollars for a twelve-hour day."'},
{q:'How else does Jake make a living?',o:['He drives for a delivery app.','He works as a waiter.','He teaches acting.','He works for the catering company.'],a:0,why:'"I also drive for a delivery app at night."'},
{q:'Which of these is NOT one of Jake\'s rules?',o:['Always bring your own food.','Be on time.','Be quiet when the red light is on.','Don\'t talk to the stars first.'],a:0,why:'Seine drei Regeln: on time, quiet at the red light, never talk to the stars first.'},
{q:'How would you describe Jake?',o:['experienced and helpful','arrogant and impatient','shy and nervous','bored and unfriendly'],a:0,why:'Er macht das seit acht Jahren und gibt Maya ungefragt Tipps.'}
]},
c1:{title:'Direct or indirect?',type:'mc',keep:true,cats:['direct','indirect'],intro:'Wird die Eigenschaft ausdrücklich genannt (direct) oder musst du sie erschließen (indirect)?',items:[
{q:'"You\'re smart, Lucy," Jess says.',a:0,why:'Eine andere Figur nennt die Eigenschaft (smart).'},
{q:'Lucy works five nights a week and goes to auditions during the day.',a:1,why:'Aus ihrem Handeln schließt du: hard-working.'},
{q:'Tom was a lazy and selfish man.',a:0,why:'Der Erzähler nennt die Eigenschaften direkt.'},
{q:'She put on some lipstick and drove to work.',a:1,why:'Handlung → du schließt auf resilient.'},
{q:'Her room is so small that she has to climb over her bed.',a:1,why:'Umgebung/Lebensumstände zeigen etwas über ihre Situation.'},
{q:'The casting director didn\'t even look up from her phone.',a:1,why:'Verhalten → uninterested, rude.'},
{q:'Everybody in town knew that Mr Grey was the meanest man alive.',a:0,why:'Die Eigenschaft (mean) wird genannt.'},
{q:'Her hands were shaking as she opened the envelope.',a:1,why:'Körperreaktion → nervous.'},
{q:'"He\'s the most reliable cameraman I know," the director said.',a:0,why:'Eine Figur nennt die Eigenschaft (reliable).'},
{q:'He checked his hair in every window he passed.',a:1,why:'Verhalten → vain.'}
]},
c2:{title:'Which trait?',type:'mc',intro:'Welche Eigenschaft zeigt die Textstelle? Genau das ist indirekte Charakterisierung.',items:[
{q:'Marcus snapped his fingers at the young assistant. "Coffee. Now. And not like yesterday\'s."',o:['arrogant','shy','generous','caring'],a:0},
{q:'Even after her twentieth rejection, Nina signed up for the next audition the same evening.',o:['determined','lazy','naive','moody'],a:0},
{q:'Ben gave half of his tips to the new dishwasher, who couldn\'t pay his rent.',o:['generous','selfish','ambitious','vain'],a:0},
{q:'When the director asked who wanted to say a line, Amy looked at the floor and her face went red.',o:['shy','arrogant','outgoing','ruthless'],a:0},
{q:'Leo spent every free minute rewriting his screenplay – even on Christmas Day.',o:['hard-working','lazy','easy-going','pessimistic'],a:0},
{q:'"I\'ll be a star in six months," Kyle said, although he had never taken a single acting class.',o:['naive','modest','reliable','pessimistic'],a:0},
{q:'Sophie always arrived twenty minutes early and never forgot a single line.',o:['reliable','impatient','moody','insecure'],a:0},
{q:'One minute Carla laughed with the crew, the next she threw her script across the room.',o:['moody','down-to-earth','considerate','reserved'],a:0},
{q:'Although he had just won an Oscar, Tom first thanked the cleaners and drivers and called himself "just lucky".',o:['modest','vain','jealous','stubborn'],a:0},
{q:'Mia secretly deleted her friend\'s audition invitation from their shared laptop.',o:['jealous','considerate','honest','cheerful'],a:0},
{q:'"Let me be honest: life in LA is not like the movies." (Lucy, {L:Let me be honest})',o:['honest','arrogant','naive','selfish'],a:0},
{q:'The waitress listened patiently while the old man told her about his grandchildren.',o:['caring','impatient','ruthless','ambitious'],a:0}
]},
c4:{title:'Fehler finden',type:'mc',keep:true,cats:['falsche Zeitform','Behauptung ohne Beleg','Nacherzählung statt Deutung','zu umgangssprachlich','Beleg passt nicht','ungenaues Adjektiv'],intro:'Jeder Satz stammt aus einer Schüler-Charakterisierung von Lucy und hat genau ein Hauptproblem.',items:[
{q:'Lucy was a determined girl who wanted to become an actress.',a:0,why:'Charakterisierungen stehen im <b>simple present</b>: "Lucy is a determined young woman who wants to …"'},
{q:'Lucy is very ambitious and hard-working.',a:1,why:'Jede Eigenschaft braucht einen Textbeleg: "… as she works five nights a week ({L:five nights a week}) and goes to auditions during the day."'},
{q:'First Lucy goes to an audition, then she cries in her car and then she drives to the diner.',a:2,why:'Nur Handlung. Frag dich: Was zeigt das über Lucy? → "Her reaction shows that she is resilient."'},
{q:'Lucy is kinda cool and doesn\'t give up, which is awesome.',a:3,why:'Sachlich schreiben: "Lucy is resilient and does not give up easily."'},
{q:'Lucy is optimistic because she says, "I want to feel that again" ({L:I want to feel that again}).',a:4,why:'Das Zitat zeigt ihre Leidenschaft, nicht Optimismus. Für Optimismus passt: "I\'ll be smiling a little more than usual" ({L:I\'ll be smiling}).'},
{q:'Lucy is a nice and good person ({L:Let me be honest}).',a:5,why:'<i>nice</i> und <i>good</i> sagen nichts. Präziser: "Lucy is honest and self-critical."'}
]},
c3:{title:'Build a paragraph',type:'order',intro:'Tipp die Sätze in der richtigen Reihenfolge an. Antippen eines eingeordneten Satzes nimmt ihn wieder heraus.',parts:[
'To begin with, Lucy comes across as an extremely determined young woman.',
'Although she works five nights a week as a waitress ({L:five nights a week}), she still goes to auditions during the day.',
'This shows that she is willing to make sacrifices for her dream.',
'Furthermore, she does not give up after a rejection: after crying in her car, she "put on some lipstick and drove to [her] shift" ({L:put on some lipstick}).',
'All in all, her behaviour suggests that she will keep fighting for her big break.'
],why:'Aufbau: <b>claim</b> → <b>evidence</b> → <b>explanation</b> → weiterer Beleg (mit Furthermore angeschlossen) → <b>Schlussfolgerung</b>.'},
m1:{title:'Mediation tools',type:'mc',intro:'Wie gibst du diese Stellen auf Englisch wieder?',items:[
{q:'„Komparsen / Statisten“',o:['extras','statists','comparses','supporters'],a:0,why:'extra = Statist/in. <i>Statist</i> gibt es im Englischen so nicht.'},
{q:'„Schauspielergewerkschaft“ – für Ethan am besten:',o:['the actors\' union','the Schauspielergewerkschaft','the actors\' trade club society','the workers\' party'],a:0,why:'Kennst du das Wort nicht: umschreiben – "an organization that protects actors\' rights".'},
{q:'„Leben können die wenigsten davon.“',o:['Very few extras can make a living from it.','The least can live from it.','Living can the fewest of it.','Few extras are living.'],a:0,why:'make a living from sth = davon leben können.'},
{q:'„Zuschläge für Überstunden“',o:['extra money for overtime','additions for over-hours','surcharges for more-time','overtime hits'],a:0,why:'overtime = Überstunden. Einfach umschreiben ist erlaubt und klug.'},
{q:'„Wer Mitglied … ist, verdient etwas mehr.“',o:['Members of the union earn a bit more.','Who is member earns some more.','Members earn more of the union.','Who member is, earns more.'],a:0,why:'Kein wörtliches „Wer … ist“ – formuliere frei.'},
{q:'Welche Info ist für Ethans Frage <b>am wenigsten</b> wichtig?',o:['Dana Reyes is 34 years old.','Extras earn $150–200 a day.','Extras often wait for hours.','Few extras ever become stars.'],a:0,why:'Das Alter der Statistin hilft Ethan nicht. Bei Mediation lässt du so etwas weg.'}
]}
};

/* =================== state: scores & mistakes =================== */
const ITEMS={};
function reg(id,kind,data,meta){ITEMS[id]={id,kind,data,meta:meta||{}}}
const getScore=id=>store.get('scores',{})[id];
function saveScore(id,score,total){const s=store.get('scores',{});const p=s[id];const v=total?score/total:0;s[id]={best:Math.max(p?p.best:0,v),last:v,n:(p?p.n:0)+1};store.set('scores',s);refreshProgress()}
function markItem(id,ok){const w=store.get('wrong',{});if(ok)delete w[id];else w[id]=Date.now();store.set('wrong',w);refreshProgress()}

/* =================== item renderers =================== */
function parseGap(s){const parts=[];let last=0;s.replace(/\{\{(.+?)\}\}/g,(m,inner,idx)=>{parts.push(s.slice(last,idx));const [a,hint]=inner.split('::');parts.push({ans:a.split('|'),hint:hint||''});last=idx+m.length;return m});parts.push(s.slice(last));return parts}

function gapItem(it,id){
  const q=h('div',{class:'q'});const gaps=[];
  parseGap(it.s).forEach(p=>{
    if(typeof p==='string'){q.append(document.createTextNode(p));return}
    const w=Math.max(...p.ans.map(a=>a.length),p.hint.length,4)+2;
    const inp=h('input',{class:'gap',id:id+'-g'+gaps.length,type:'text',autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:p.hint,style:'width:'+w+'ch','aria-label':'Lücke'+(p.hint?' ('+p.hint+')':'')});
    gaps.push({inp,ans:p.ans});q.append(inp);
  });
  const fb=h('div',{class:'fb',hidden:true});
  return{el:h('li',{class:'item'},q,fb),inputs:gaps.map(g=>g.inp),
    check(){let all=true;gaps.forEach(g=>{const ok=g.ans.some(a=>norm(a)===norm(g.inp.value));g.inp.classList.remove('shown');g.inp.classList.toggle('ok',ok);g.inp.classList.toggle('bad',!ok);if(!ok)all=false});
      fb.hidden=false;fb.className='fb '+(all?'ok':'bad');
      fb.innerHTML=all?'✓ Richtig.':'✗ Richtig: <b>'+gaps.map(g=>esc(g.ans[0])).join(' · ')+'</b>'+(it.why?' – '+fmt(it.why):'');return all},
    reveal(){gaps.forEach(g=>{if(!g.inp.classList.contains('ok')){g.inp.value=g.ans[0];g.inp.classList.remove('bad');g.inp.classList.add('shown')}})}};
}

function rewriteItem(it,id){
  const orig=it.em&&it.p.includes(it.em)?esc(it.p).replace(esc(it.em),'<mark>'+esc(it.em)+'</mark>'):esc(it.p);
  const inp=h('input',{class:'gap wide',id:id+'-in',type:'text',autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:it.start||'','aria-label':'Umgebauter Satz'});
  const fb=h('div',{class:'fb',hidden:true});
  return{el:h('li',{class:'item'},h('div',{class:'q',html:'<span class="orig">'+orig+'</span> <span class="task">→ '+esc(it.task)+'</span>'}),inp,fb),inputs:[inp],
    check(){const ok=it.a.some(a=>norm(a)===norm(inp.value));inp.classList.remove('shown');inp.classList.toggle('ok',ok);inp.classList.toggle('bad',!ok);fb.hidden=false;fb.className='fb '+(ok?'ok':'bad');
      fb.innerHTML=ok?'✓ Richtig.':'✗ Lösung: <b>'+esc(it.a[0])+'.</b>'+(it.why?' – '+fmt(it.why):'');return ok},
    reveal(){if(!inp.classList.contains('ok')){inp.value=it.a[0]+'.';inp.classList.remove('bad');inp.classList.add('shown')}}};
}

function mcItem(it,id,{immediate=true,keep=false,cats,onResult}={}){
  const opts=it.o||cats;const idx=opts.map((_,i)=>i);const order=keep?idx:shuffle(idx);
  const correct=Array.isArray(it.a)?it.a:[it.a];
  let chosen=null,locked=false;const btns={};
  const fb=h('div',{class:'fb',hidden:true});
  const mark=()=>{locked=true;for(const k in btns){const i=+k;const b=btns[k];b.disabled=true;if(correct.includes(i))b.classList.add('ok');else if(i===chosen)b.classList.add('bad')}
    const ok=correct.includes(chosen);fb.hidden=false;fb.className='fb '+(ok?'ok':'bad');
    fb.innerHTML=(ok?'✓ ':'✗ ')+(it.why?fmt(it.why):(ok?'Richtig.':'Richtig wäre: <b>'+fmt(opts[correct[0]])+'</b>'));return ok};
  order.forEach(i=>{btns[i]=h('button',{class:'opt',type:'button','aria-pressed':'false',html:fmt(opts[i]),onclick(){if(locked)return;chosen=i;
    if(immediate){const ok=mark();onResult&&onResult(ok)}else{for(const k in btns)btns[k].setAttribute('aria-pressed','false');btns[i].setAttribute('aria-pressed','true')}}})});
  return{el:h('li',{class:'item'},h('div',{class:'q',html:fmt(it.q)}),h('div',{class:'opts'},order.map(i=>btns[i])),fb),check:()=>mark(),reveal(){}};
}

function ctrlFor(id,mode){const I=ITEMS[id];if(!I)return null;
  if(I.kind==='gap')return gapItem(I.data,id+'-'+mode);
  if(I.kind==='rewrite')return rewriteItem(I.data,id+'-'+mode);
  if(I.kind==='mc')return mcItem(I.data,id,{immediate:false,keep:I.meta.keep,cats:I.meta.cats});
  return null}

function enterNav(container,onLast){container.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target.matches('input.gap'))return;e.preventDefault();const all=$$('input.gap',container);const i=all.indexOf(e.target);if(i<all.length-1)all[i+1].focus();else onLast&&onLast()})}

/* =================== exercise card =================== */
const RENDER={
mc(exId,ex,body,foot,done,build){
  const ol=h('ol',{class:'items'});body.append(ol);
  const order=ex.fixed?ex.items.map((_,i)=>i):shuffle(ex.items.map((_,i)=>i));
  let answered=0,right=0;
  order.forEach(i=>{const id=exId+'-'+i;const c=mcItem(ex.items[i],id,{immediate:true,keep:ex.keep,cats:ex.cats,onResult(ok){answered++;if(ok)right++;markItem(id,ok);if(answered===order.length)done(right,order.length)}});ol.append(c.el)});
  foot.append(h('button',{class:'btn ghost',type:'button',onclick:build},ex.fixed?'Zurücksetzen':'Neu mischen'));
},
gap(exId,ex,body,foot,done,build){
  const ol=h('ol',{class:'items'});body.append(ol);const ctrls=[];
  const order=ex.fixed?ex.items.map((_,i)=>i):shuffle(ex.items.map((_,i)=>i));
  order.forEach(i=>{const id=exId+'-'+i;const c=(ex.type==='rewrite'?rewriteItem:gapItem)(ex.items[i],id);ctrls.push({id,c});ol.append(c.el)});
  const check=()=>{let r=0;ctrls.forEach(({id,c})=>{const ok=c.check();if(ok)r++;markItem(id,ok)});done(r,ctrls.length)};
  enterNav(ol,check);
  foot.append(h('button',{class:'btn primary',type:'button',onclick:check},'Prüfen'),h('button',{class:'btn',type:'button',onclick(){ctrls.forEach(({c})=>c.reveal())}},'Lösungen zeigen'),h('button',{class:'btn ghost',type:'button',onclick:build},ex.fixed?'Leeren':'Neu mischen'));
},
order(exId,ex,body,foot,done,build){
  const parts=ex.parts.map((t,i)=>({t,i}));const shuffled=shuffle(parts);const chosen=[];let checked=false;
  const pool=h('div',{class:'pool'}),built=h('ol',{class:'built'}),fb=h('div',{class:'fb',hidden:true});
  const render=()=>{pool.innerHTML='';built.innerHTML='';
    shuffled.filter(p=>!chosen.includes(p)).forEach(p=>pool.append(h('button',{class:'piece',type:'button',html:fmt(p.t),onclick(){if(checked)return;chosen.push(p);render()}})));
    chosen.forEach((p,k)=>built.append(h('li',{},h('button',{class:'piece',type:'button',html:fmt(p.t),onclick(){if(checked)return;chosen.splice(k,1);render()}}))))};
  render();
  body.append(h('div',{class:'label-sm'},'Sätze'),pool,h('div',{class:'label-sm'},'Dein Absatz'),built,fb);
  foot.append(h('button',{class:'btn primary',type:'button',onclick(){
    if(chosen.length<parts.length){fb.hidden=false;fb.className='fb';fb.textContent='Ordne zuerst alle Sätze ein.';return}
    checked=true;let r=0;$$('.piece',built).forEach((b,k)=>{const ok=chosen[k].i===k;if(ok)r++;b.classList.add(ok?'ok':'bad')});
    fb.hidden=false;fb.className='fb '+(r===parts.length?'ok':'bad');fb.innerHTML=(r===parts.length?'✓ Perfekt. ':'✗ '+r+' von '+parts.length+' an der richtigen Stelle. ')+fmt(ex.why);
    markItem(exId+'-0',r===parts.length);done(r,parts.length)}},'Prüfen'),
    h('button',{class:'btn',type:'button',onclick(){chosen.length=0;parts.forEach(p=>chosen.push(p));checked=false;render();$$('.piece',built).forEach(b=>b.classList.add('ok'));checked=true;fb.hidden=false;fb.className='fb';fb.innerHTML=fmt(ex.why)}},'Lösung zeigen'),
    h('button',{class:'btn ghost',type:'button',onclick:build},'Neu mischen'));
},
open(exId,ex,body,foot,done,build){
  const ol=h('ol',{class:'items'});body.append(ol);let graded=0,right=0;
  ex.items.forEach((it,i)=>{
    const key='open-'+exId+'-'+i;
    const ta=h('textarea',{class:'pad short',id:key,'aria-label':'Deine Antwort'});ta.value=store.get(key,'');ta.addEventListener('input',()=>store.set(key,ta.value));
    const model=h('div',{class:'model',hidden:true,html:'<b>Musterlösung:</b> '+fmt(it.m)});
    const grade=h('div',{class:'row',hidden:true,style:'margin-top:8px'},h('span',{class:'muted'},'Hattest du das Wesentliche?'),
      h('button',{class:'btn',type:'button',onclick(){g(true)}},'Ja'),h('button',{class:'btn ghost',type:'button',onclick(){g(false)}},'Noch nicht'));
    let done1=false;const g=ok=>{if(done1)return;done1=true;graded++;if(ok)right++;grade.hidden=true;if(graded===ex.items.length)done(right,ex.items.length)};
    ol.append(h('li',{class:'item'},h('div',{class:'q',html:fmt(it.q)}),ta,h('div',{class:'row',style:'margin-top:8px'},h('button',{class:'btn',type:'button',onclick(){model.hidden=false;grade.hidden=done1;this.disabled=true}},'Musterlösung zeigen')),model,grade));
  });
  foot.append(h('button',{class:'btn ghost',type:'button',onclick:build},'Bewertung zurücksetzen'));
}
};
RENDER.rewrite=RENDER.gap;
const KIND_LABEL={mc:'Auswahl',gap:'Lückentext',rewrite:'Umformen',order:'Reihenfolge',open:'Offene Fragen'};

function buildExercise(exId,ex){
  ex.items&&ex.items.forEach((it,i)=>reg(exId+'-'+i,ex.type==='rewrite'?'rewrite':ex.type,it,{keep:ex.keep,cats:ex.cats,title:ex.title}));
  const badge=h('span',{class:'badge'});
  const body=h('div'),summary=h('p',{class:'summary',role:'status'}),foot=h('div',{class:'row foot'});
  const card=h('section',{class:'ex',id:'ex-'+exId},
    h('div',{class:'ex-head'},h('div',{},h('div',{class:'kicker'},KIND_LABEL[ex.type]),h('h3',{},ex.title)),badge),
    ex.intro?h('p',{class:'ex-intro',html:fmt(ex.intro)}):null,body,summary,foot);
  const setBadge=()=>{const s=getScore(exId);badge.textContent=s?'Bestwert '+Math.round(s.best*100)+' %':'noch offen';badge.className='badge'+(s&&s.best>=.8?' good':'')};
  const done=(r,t)=>{saveScore(exId,r,t);setBadge();summary.textContent=r+' von '+t+' richtig'+(r===t?' – sitzt!':' – die Fehler liegen jetzt im Fehlertrainer.')};
  const build=()=>{body.innerHTML='';foot.innerHTML='';summary.textContent='';RENDER[ex.type](exId,ex,body,foot,done,build)};
  setBadge();build();return card;
}

/* =================== vocab tools =================== */
let vocTopic=store.get('vocTopic','all');
const vocPool=()=>vocTopic==='all'?ALLVOC:ALLVOC.filter(v=>v.topic===vocTopic);
const tts={ok:'speechSynthesis' in window,voices:[]};
function loadVoices(){try{tts.voices=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang))}catch(e){tts.voices=[]}}
if(tts.ok){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices)}catch(e){}}
function pickVoice(i){const us=tts.voices.filter(v=>/en[-_]US/i.test(v.lang));const pool=us.length>1?us:tts.voices;return pool.length?pool[i%pool.length]:null}
function say(text,{voice=0,pitch=1,rate=.95,onend}={}){if(!tts.ok){onend&&onend();return}
  try{const u=new SpeechSynthesisUtterance(text);u.lang='en-US';const v=pickVoice(voice);if(v)u.voice=v;u.pitch=pitch;u.rate=rate;if(onend){u.onend=onend;u.onerror=e=>{if(e.error!=='interrupted'&&e.error!=='canceled')onend()}}speechSynthesis.speak(u)}catch(e){onend&&onend()}}
const speakBtn=text=>tts.ok?h('button',{class:'speak',type:'button','aria-label':'Aussprache anhören: '+text,html:SPEAK_ICON,onclick(e){e.stopPropagation();speechSynthesis.cancel();say(cleanEn(text).replace(/\(([^)]*)\)/g,'$1').replace(/\bsb\b/g,'somebody').replace(/\bsth\b/g,'something').replace(/,/g,', '),{rate:.85})}}):null;

function buildVocab(){
  const chips=$('#topic-chips');const tools=$('#voc-tools');
  const topics=[['all','Alle'],...Object.entries(TOPICS)];
  if(vocTopic!=='all'&&!TOPICS[vocTopic])vocTopic='all';
  const drawChips=()=>{chips.innerHTML='';topics.forEach(([k,l])=>chips.append(h('button',{class:'chip',type:'button','aria-pressed':String(k===vocTopic),onclick(){vocTopic=k;store.set('vocTopic',k);drawChips();drawTools()}},l+' ('+(k==='all'?ALLVOC.length:ALLVOC.filter(v=>v.topic===k).length)+')')))};
  ALLVOC.forEach(v=>reg(vocId(v),'gap',{s:v.de+' ('+(WORTART[v.wa]||v.wa||'')+') → {{'+vocVariants(v.en,v.wa).join('|')+'}}',why:'Navigium: <i>'+esc(v.en)+'</i>'},{title:'Vokabeln '+VDATA.buch}));

  function exCard(id,kind,title,intro){const badge=h('span',{class:'badge'});const s=getScore(id);badge.textContent=s?'Bestwert '+Math.round(s.best*100)+' %':'noch offen';if(s&&s.best>=.8)badge.classList.add('good');
    const card=h('section',{class:'ex'},h('div',{class:'ex-head'},h('div',{},h('div',{class:'kicker'},kind),h('h3',{},title)),badge),h('p',{class:'ex-intro',html:intro}));card.badge=badge;card.refresh=()=>{const s=getScore(id);badge.textContent=s?'Bestwert '+Math.round(s.best*100)+' %':'noch offen';badge.className='badge'+(s&&s.best>=.8?' good':'')};return card}

  // flashcards
  function flash(){const card=exCard('voc-flash','Schritt 1 · Karteikarten','Learn','Tipp die Karte zum Umdrehen. „Kann ich“ legt sie weg, „Nochmal“ schiebt sie nach hinten.');
    let deck=shuffle(vocPool()),flipped=false,first=deck.length;
    const box=h('div');card.append(box);
    const draw=()=>{box.innerHTML='';
      if(!deck.length){box.append(h('div',{class:'fb ok'},'✓ Stapel geschafft – alle '+first+' Karten. Weiter mit dem Zuordnen.'),h('div',{class:'row foot'},h('button',{class:'btn',type:'button',onclick(){deck=shuffle(vocPool());first=deck.length;draw()}},'Stapel neu mischen')));saveScore('voc-flash',1,1);card.refresh();return}
      const v=deck[0];
      const face=h('button',{class:'flash',type:'button','aria-label':'Karte umdrehen',onclick(){flipped=!flipped;draw()}},
        flipped?[h('div',{class:'de'},v.de),h('div',{class:'w',style:'font-size:24px'},v.en),h('div',{class:'exs'},(WORTART[v.wa]||'')+' · '+TOPICS[v.topic])]:[h('div',{class:'w'},v.en),h('div',{class:'muted',style:'font-size:14px'},'antippen für die Bedeutung')]);
      box.append(face,h('div',{class:'row foot',style:'justify-content:space-between'},
        h('div',{class:'row'},h('button',{class:'btn primary',type:'button',onclick(){deck.shift();flipped=false;draw()}},'Kann ich'),h('button',{class:'btn',type:'button',onclick(){deck.push(deck.shift());flipped=false;draw()}},'Nochmal'),speakBtn(v.en)),
        h('span',{class:'counter muted'},'noch '+deck.length+' von '+first)))};
    draw();return card}

  // match game
  function match(){const card=exCard('voc-match','Schritt 2 · Zuordnen','Match','Tipp ein englisches Wort und dann die passende Übersetzung. Sechs Paare pro Runde.');
    const box=h('div');card.append(box);
    const round=()=>{box.innerHTML='';const set=shuffle(vocPool()).slice(0,6);let sel=null,found=0,miss=0;
      const status=h('p',{class:'summary',role:'status'});
      const L=set.map(v=>h('button',{class:'tile',type:'button','aria-pressed':'false',onclick(){pick(this,v,'en')}},v.en));
      const R=shuffle(set).map(v=>h('button',{class:'tile',type:'button','aria-pressed':'false',onclick(){pick(this,v,'de')}},v.deKurz));
      function pick(el,v,side){if(el.classList.contains('ok'))return;
        if(!sel||sel.side===side){if(sel)sel.el.setAttribute('aria-pressed','false');sel={el,v,side};el.setAttribute('aria-pressed','true');return}
        if(sel.v===v){[sel.el,el].forEach(b=>{b.classList.add('ok');b.setAttribute('aria-pressed','false');b.disabled=true});found++;sel=null;
          if(found===set.length){const sc=set.length/(set.length+miss);saveScore('voc-match',Math.round(sc*100),100);card.refresh();status.textContent=miss?'Alle gefunden, '+miss+' Fehlversuch'+(miss>1?'e':'')+'.':'Alle gefunden, ohne Fehler!'}}
        else{miss++;const a=sel.el;[a,el].forEach(b=>{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad')});a.setAttribute('aria-pressed','false');sel=null;setTimeout(()=>{a.classList.remove('bad');el.classList.remove('bad')},400)}}
      const grid=h('div',{class:'match'});L.forEach((b,i)=>{grid.append(b,R[i])});
      box.append(grid,status,h('div',{class:'row foot'},h('button',{class:'btn',type:'button',onclick:round},'Neue Runde')))};
    round();return card}

  // spelling
  function spell(){const card=exCard('voc-spell','Schritt 3 · Rechtschreibung','Write it','Schreib das englische Wort. Bei Verben ist „to“ freiwillig. Zehn Wörter pro Runde.');
    const box=h('div');card.append(box);
    const round=()=>{box.innerHTML='';const set=shuffle(vocPool()).slice(0,10);const ol=h('ol',{class:'items'});const ctrls=[];const status=h('p',{class:'summary',role:'status'});
      set.forEach(v=>{const id=vocId(v);const c=gapItem(ITEMS[id].data,id);ctrls.push({id,c});ol.append(c.el)});
      const check=()=>{let r=0;ctrls.forEach(({id,c})=>{const ok=c.check();if(ok)r++;markItem(id,ok)});saveScore('voc-spell',r,ctrls.length);card.refresh();status.textContent=r+' von '+ctrls.length+' richtig geschrieben.'};
      enterNav(ol,check);
      box.append(ol,status,h('div',{class:'row foot'},h('button',{class:'btn primary',type:'button',onclick:check},'Prüfen'),h('button',{class:'btn',type:'button',onclick(){ctrls.forEach(({c})=>c.reveal())}},'Lösungen zeigen'),h('button',{class:'btn ghost',type:'button',onclick:round},'Neue Runde')))};
    round();return card}

  const drawTools=()=>{tools.innerHTML='';tools.append(flash(),match(),spell())};
  drawChips();drawTools();

  const list=$('#voc-list');
  VDATA.lektionen.forEach(l=>{list.append(h('h4',{style:'margin-top:14px'},VDATA.buch+' · Lektion '+l.lektion+' · '+l.seite),h('div',{class:'tbl-wrap voc-list'},h('table',{},h('tr',{},h('th',{},'English'),h('th',{},'Deutsch'),h('th',{},'Wortart')),l.vokabeln.map(v=>h('tr',{},h('td',{},h('span',{class:'row',style:'gap:6px;flex-wrap:nowrap'},speakBtn(v.en),h('b',{},v.en))),h('td',{},v.de.join('; ')),h('td',{class:'muted'},WORTART[v.wortart]||v.wortart||''))))))});
  $('#voc-source').textContent=VDATA.lektionen.length?VDATA.buch+' · '+VDATA.lektionen.map(l=>l.seite).join(', ')+' · '+ALLVOC.length+' Wörter aus deinem Navigium (Stand '+VDATA.stand.split('-').reverse().join('.')+')':'Keine Vokabeldaten gefunden – tools/navigium_export.py ausführen.';
}

/* =================== reading text =================== */
function buildBlog(){const d=$('#blog');
  d.append(h('div',{class:'doc-head'},'lucy-in-la.blog · Tuesday, March 14'),h('div',{class:'doc-title'},'Waiting for my big break'));
  BLOG_LINES.forEach((l,i)=>d.append(h('div',{class:'ln'+(l.ps&&i?' ps':'')},h('span',{class:'n'},(i+1)%5===0?String(i+1):''),h('span',{},l.t))));
}

/* =================== listening =================== */
const DIALOGUE=[
{who:'MAYA',t:"Excuse me, is this the line for the extras? I'm supposed to be in the hospital scene."},
{who:'JAKE',t:"You're in the right place. I'm Jake. First day?"},
{who:'MAYA',t:"Is it that obvious? I'm Maya. I got the call last night at eleven o'clock. They told me to be here at five thirty this morning."},
{who:'JAKE',t:"Welcome to Hollywood. Did they tell you to bring three different outfits?"},
{who:'MAYA',t:"Three? I only brought one, a blue sweater."},
{who:'JAKE',t:"Don't worry. Wardrobe will probably give you a nurse's uniform anyway. Have you had breakfast? The catering truck is behind sound stage twelve. The pancakes are terrible, but the coffee is free."},
{who:'MAYA',t:"Thanks! So, how long have you been doing this?"},
{who:'JAKE',t:"Eight years. I've been a police officer, a zombie, a soldier, and a waiter in about forty films. You've probably seen the back of my head a hundred times."},
{who:'MAYA',t:"Do you ever get speaking roles?"},
{who:'JAKE',t:"Twice. Once I said, 'Your table is ready, sir', to Brad Pitt's stunt double. My mother still tells everybody about it."},
{who:'MAYA',t:"That's amazing! And can you live on it?"},
{who:'JAKE',t:"Not really. Extras get about two hundred dollars for a twelve-hour day. I also drive for a delivery app at night. But I love being on set. Where else do you get paid to watch movies being made?"},
{who:'MAYA',t:"My parents think I'm crazy."},
{who:'JAKE',t:"Mine too. Here's my advice: be on time, be quiet when the red light is on, and never, ever talk to the stars unless they talk to you first."},
{who:'ASSISTANT',t:"Background actors for scene forty-two, to stage twelve, please!"},
{who:'JAKE',t:"That's us. Come on, Nurse Maya."}
];
const VOICE={MAYA:{voice:1,pitch:1.15},JAKE:{voice:0,pitch:.85},ASSISTANT:{voice:2,pitch:1}};
function buildListening(){
  const sc=$('#script');sc.append(h('div',{class:'slug'},'EXT. STUDIO LOT – SOUND STAGE 12 – EARLY MORNING'));
  const blocks=DIALOGUE.map(l=>{const b=h('div',{class:'blk'},h('div',{class:'cue'},l.who),h('div',{},l.t));sc.append(b);return b});
  let playing=false,idx=0,plays=store.get('plays',0);
  const stat=$('#play-stat'),playBtn=$('#play-btn');
  const upd=()=>{stat.textContent=plays+'× gehört';playBtn.textContent=playing?'▶ läuft …':'▶ Abspielen'};upd();
  if(!tts.ok){const n=$('#tts-note');n.hidden=false;n.textContent='Dein Browser kann hier nicht vorlesen. Öffne das Transkript unten und lies das Gespräch stattdessen.';playBtn.disabled=true;$('#stop-btn').disabled=true;return}
  const clear=()=>blocks.forEach(b=>b.classList.remove('now'));
  const next=()=>{if(!playing)return;if(idx>=DIALOGUE.length){playing=false;clear();plays++;store.set('plays',plays);upd();return}
    const l=DIALOGUE[idx];clear();blocks[idx].classList.add('now');
    say(l.t,{...VOICE[l.who],rate:+$('#rate').value,onend(){idx++;setTimeout(next,450)}})};
  playBtn.addEventListener('click',()=>{if(playing)return;speechSynthesis.cancel();loadVoices();
    if(!tts.voices.length){const n=$('#tts-note');n.hidden=false;n.textContent='Keine englische Stimme gefunden – es wird die Standardstimme deines Browsers benutzt. Falls nichts zu hören ist, nutze das Transkript.'}
    playing=true;idx=0;upd();next()});
  $('#stop-btn').addEventListener('click',()=>{playing=false;speechSynthesis.cancel();clear();upd()});
}

/* =================== writing pads =================== */
const LINKERS=['first of all','to begin with','furthermore','moreover','in addition','however','although','even though','on the one hand','on the other hand','all in all','to sum up','overall','for example','for instance','this shows','this suggests','this proves','which shows','which suggests','which proves','is underlined by','comes across as','seems to be','appears to be','this becomes clear'];
const CHAR_MODEL=`In her blog entry "Waiting for My Big Break", Lucy, a 19-year-old aspiring actress from Dayton, Ohio, writes about her life in Los Angeles. She comes across as a determined but also vulnerable young woman.

Lucy's living conditions are far from glamorous. She shares "a tiny apartment" with two other girls ({L:a tiny apartment}) and works "five nights a week as a waitress" ({L:five nights a week}) to pay her rent. This shows that she does not have much money.

First of all, Lucy is extremely determined. Although she earns very little, she goes to many auditions – "eleven of them" in just one month ({L:eleven of them}). Her determination is underlined by the way she reacts to rejection: after crying in her car, she "put on some lipstick and drove to [her] shift" ({L:put on some lipstick}). This proves that she is resilient and does not let disappointment stop her.

Moreover, Lucy seems to be honest and has a good sense of humour. She openly admits that "life in LA is not like the movies" ({L:life in LA is not like the movies}) and makes fun of her strange roles, such as "a talking cupcake" ({L:a talking cupcake}). Her humour helps her to cope with her difficult situation.

Furthermore, Lucy is passionate rather than greedy. She makes clear that she is "not doing this to become rich or famous" ({L:not doing this to become rich}), but because acting makes her "feel completely alive" ({L:feel completely alive}).

All in all, Lucy is a hard-working, resilient and passionate young woman. Even though she is "trying not to get too excited" ({L:trying not to get too excited}), she remains hopeful, which suggests that she will not give up her dream easily.`;
const MED_MODEL=`Hi Ethan,

Thanks for your email! I've found a German article about working as an extra in Hollywood, so here are the most important facts.

About 50,000 people in LA are registered as extras, so there is a lot of competition. For a day of up to twelve hours, you usually get between $150 and $200. Members of the actors' union earn a bit more, for example extra money for overtime. Very few extras can make a living from it, so most of them have a second job, e.g. as waiters or drivers.

Be prepared to wait a lot! Extras often sit in tents next to the set for hours before they are in front of the camera for just a few minutes. Still, many people love the job because they are part of film history.

However, experts say that hardly any extras become stars, and in crowd scenes, extras are more and more often replaced by computer-generated characters.

Good luck – and send me a photo from the set!

Best wishes,
[your name]`;
const MED_POINTS=['ca. 50.000 registrierte Statisten (viel Konkurrenz)','150–200 $ für bis zu 12 Stunden','Gewerkschaftsmitglieder verdienen etwas mehr','die meisten brauchen einen zweiten Job','viel Warten, nur wenige Minuten vor der Kamera','warum viele den Job trotzdem lieben','vom Statisten zum Star: sehr selten','Computerfiguren ersetzen Statisten in Massenszenen','Anrede, Bezug auf Ethans Frage, Gruß am Ende','in eigenen Worten statt Wort für Wort'];

function wordCount(t){return (t.trim().match(/[A-Za-zÀ-ÿ'’-]+/g)||[]).length}
function buildPad(rootSel,key,opts){
  const root=$(rootSel);const ta=h('textarea',{class:'pad',id:key,'aria-label':'Dein Text',placeholder:opts.placeholder});ta.value=store.get(key,'');
  const counter=h('span',{class:'counter'});const checks=h('ul',{class:'checks'});
  const model=h('div',{class:'model',hidden:true,html:fmt(esc(opts.model))});
  const badge=$('#'+key+'-badge');const setBadge=()=>{const s=getScore(key);badge.textContent=s?'mit Muster verglichen':'noch offen';badge.className='badge'+(s?' good':'')};setBadge();
  const analyse=()=>{store.set(key,ta.value);const t=ta.value;const wc=wordCount(t);counter.textContent=wc+' Wörter (Ziel '+opts.range[0]+'–'+opts.range[1]+')';checks.innerHTML='';
    opts.checks(t,wc).forEach(([ok,label])=>checks.append(h('li',{class:ok?'yes':'no'},h('span',{class:'st'},ok?'✓':'!'),h('span',{html:label}))))};
  ta.addEventListener('input',analyse);analyse();
  root.append(ta,h('div',{class:'row',style:'justify-content:space-between;margin-top:8px'},counter),h('div',{class:'label-sm'},'Live-Prüfliste'),checks);
  if(opts.extra)root.append(opts.extra);
  root.append(h('div',{class:'row foot'},h('button',{class:'btn primary',type:'button',onclick(){model.hidden=!model.hidden;this.textContent=model.hidden?'Musterlösung zeigen':'Musterlösung ausblenden';if(!model.hidden){saveScore(key,1,1);setBadge()}}},'Musterlösung zeigen')),h('div',{style:'margin-top:12px'},model));
}
function buildPads(){
  buildPad('#pad-char-body','pad-char',{range:[250,300],placeholder:'In her blog entry "Waiting for My Big Break", Lucy, …',model:CHAR_MODEL,checks(t,wc){
    const low=' '+t.toLowerCase().replace(/[’]/g,"'")+' ';
    const traits=traitWords.filter(w=>new RegExp('\\b'+w.replace('-','\\-')+'\\b').test(low));
    const refs=(t.match(/\(\s*ll?\.\s*\d+/gi)||[]).length;
    const quotes=(t.match(/["“”]/g)||[]).length/2|0;
    const links=LINKERS.filter(p=>low.includes(p));
    const paras=t.split(/\n\s*\n/).filter(p=>p.trim()).length;
    const past=(low.match(/\b(was|were|had|wanted|did|felt|seemed)\b/g)||[]).length;
    const vague=(low.match(/\b(nice|good|bad|cool|kinda|awesome)\b/g)||[]).length;
    const opinion=(low.match(/\b(i think|in my opinion)\b/g)||[]).length;
    return [
      [wc>=250,'Umfang: '+wc+' von mind. 250 Wörtern'],
      [paras>=4,'Absätze: '+paras+' (Einleitung, mehrere Hauptteil-Absätze, Schluss → mind. 4)'],
      [traits.length>=4,'Charakter-Adjektive aus der Wortliste: '+(traits.length?traits.join(', '):'noch keine')+' (mind. 4)'],
      [refs>=4,'Belege mit Zeilenangabe (l. 12): '+refs+' (mind. 4)'],
      [links.length>=5,'Verknüpfungs- und Deutungsphrasen: '+links.length+(links.length?' – '+links.slice(0,6).join(', ')+(links.length>6?' …':''):'')+' (mind. 5)'],
      [past<=3,past<=3?'Zeitform: sieht nach simple present aus':'Zeitform: '+past+'× was/were/had/… – schreib im <b>simple present</b> (außer in Zitaten)'],
      [vague===0,vague?'Ungenaue Wörter (nice, good, bad, cool …): '+vague+'× – ersetze sie durch präzise Adjektive':'Keine ungenauen Wörter wie nice/good/bad'],
      [opinion<=1,opinion<=1?'„I think“/„in my opinion“ sparsam eingesetzt':'„I think“/„in my opinion“: '+opinion+'× – zu oft, belege lieber mit dem Text']
    ]}});
  const cl=h('div',{class:'check-list',style:'margin-top:12px'},h('div',{class:'label-sm',style:'margin-top:0'},'Selbstcheck: Was steht in deiner E-Mail?'));
  const ticked=store.get('med-ticks',{});
  MED_POINTS.forEach((p,i)=>{const cb=h('input',{type:'checkbox',id:'medp-'+i});cb.checked=!!ticked[i];cb.addEventListener('change',()=>{const t=store.get('med-ticks',{});t[i]=cb.checked;store.set('med-ticks',t)});cl.append(h('label',{for:'medp-'+i},cb,h('span',{},p)))});
  buildPad('#pad-med-body','pad-med',{range:[130,170],placeholder:'Hi Ethan,\n\n…',model:MED_MODEL,extra:cl,checks(t,wc){
    const low=t.toLowerCase();
    return [
      [wc>=120&&wc<=190,'Umfang: '+wc+' Wörter (etwa 150)'],
      [/^\s*(hi|hello|dear|hey)\b/i.test(t),'Anrede am Anfang (Hi Ethan, / Dear Ethan,)'],
      [/(best wishes|love|take care|see you|cheers|bye|yours|regards)/i.test(low),'Grußformel am Ende'],
      [/(\$|dollar)/i.test(low),'Bezahlung genannt'],
      [/(wait)/i.test(low),'Warten erwähnt'],
      [!/(statist|komparse|gewerkschaft)/i.test(low),'Keine deutschen Wörter übernommen']
    ]}});
}

/* =================== overview & nav =================== */
const SECTIONS=[
 {id:'start',label:'Überblick',grp:'Start'},
 {id:'vocab',label:'Wortschatz',grp:'Sprachliche Mittel',ex:['voc-flash','voc-match','voc-spell']},
 {id:'inf',label:'Infinitive: to?',ex:['g1a','g1b']},
 {id:'ger',label:'Gerund or infinitive',ex:['g2s','g2a','g2b']},
 {id:'emph',label:'Adding emphasis',ex:['g3a','g3b','g3c']},
 {id:'read',label:'Leseverstehen',grp:'Kompetenzen',ex:['r1','r2','r4','r3']},
 {id:'listen',label:'Hörverstehen',ex:['l1']},
 {id:'char',label:'Charakterisierung',ex:['c1','c2','c4','c3','pad-char']},
 {id:'med',label:'Sprachmittlung',ex:['m1','pad-med']},
 {id:'test',label:'Probearbeit',grp:'Prüfen',ex:['test']},
 {id:'review',label:'Fehlertrainer'}
];
const secPct=s=>{if(!s.ex)return null;const sc=store.get('scores',{});return Math.round(100*s.ex.reduce((a,id)=>a+(sc[id]?sc[id].best:0),0)/s.ex.length)};
function buildNav(){const nav=$('#nav');SECTIONS.forEach(s=>{if(s.grp)nav.append(h('div',{class:'grp'},s.grp));
  nav.append(h('button',{class:'nav',type:'button','data-nav':s.id,onclick(){go(s.id)}},h('span',{},s.label),h('span',{class:'pct'}),s.ex?h('span',{class:'bar'},h('i')):null))})}
function refreshProgress(){
  const wrongN=Object.keys(store.get('wrong',{})).filter(id=>ITEMS[id]).length;
  SECTIONS.forEach(s=>{const b=$('[data-nav="'+s.id+'"]');if(!b)return;const p=secPct(s);
    if(s.id==='review')$('.pct',b).textContent=wrongN?String(wrongN):'';else if(p!=null){$('.pct',b).textContent=p+' %';$('.bar i',b).style.width=p+'%'}});
  const prog=$('#prog');if(!prog)return;prog.innerHTML='';
  SECTIONS.filter(s=>s.ex).forEach(s=>{const p=secPct(s);prog.append(h('button',{class:'prog-row',type:'button',onclick(){go(s.id)}},h('span',{},s.label),h('span',{class:'pct'},p+' %'),h('span',{class:'bar'},h('i',{style:'width:'+p+'%'}))))});
  prog.append(h('button',{class:'prog-row',type:'button',onclick(){go('review')}},h('span',{},'Fehlertrainer: offene Fehler'),h('span',{class:'pct'},String(wrongN))));
}
const PLAN=['Vokabeln Greenline 5, Lektion 1: Karteikarten, Zuordnen, Rechtschreibung','Grammatik: Infinitiv mit / ohne to','Grammatik: Gerund oder Infinitiv – inkl. remember/stop/try','Grammatik: Adding emphasis','Leseverstehen: Lucys Blog mit allen Aufgaben','Charakterisierung: Theorie + vier Übungen','Charakterisierung von Lucy schreiben und mit Muster vergleichen','Hörverstehen oder Sprachmittlung – je nachdem, was drankommt','Probearbeit: mind. 80 %','Fehlertrainer leer machen'];
function buildPlan(){const box=$('#plan');const st=store.get('plan',{});PLAN.forEach((p,i)=>{const cb=h('input',{type:'checkbox',id:'plan-'+i});cb.checked=!!st[i];cb.addEventListener('change',()=>{const s=store.get('plan',{});s[i]=cb.checked;store.set('plan',s)});box.append(h('label',{for:'plan-'+i},cb,h('span',{},p)))})}

function go(id){if(!SECTIONS.some(s=>s.id===id))id='start';
  $$('[data-sec]').forEach(s=>s.hidden=s.dataset.sec!==id);
  $$('[data-nav]').forEach(b=>{if(b.dataset.nav===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const cur=$('[data-nav="'+id+'"]');if(cur&&cur.scrollIntoView&&window.innerWidth<880)cur.scrollIntoView({block:'nearest',inline:'center'});
  if(id==='review')renderReview();
  if(location.hash!=='#'+id){try{history.replaceState(null,'','#'+id)}catch(e){}}
  store.set('sec',id);window.scrollTo(0,0)}

/* =================== review (mistake trainer) =================== */
function renderReview(){const box=$('#review-box');box.innerHTML='';
  const ids=Object.keys(store.get('wrong',{})).filter(id=>ITEMS[id]).slice(0,30);
  if(!ids.length){box.append(h('div',{class:'rule'},h('div',{class:'tag'},'Leer'),'Gerade keine offenen Fehler. Mach eine Übung oder die Probearbeit – was du falsch hast, taucht hier auf.'));return}
  const ol=h('ol',{class:'items'});const ctrls=[];
  ids.forEach(id=>{const c=ctrlFor(id,'rv');if(!c)return;const meta=ITEMS[id].meta;c.el.prepend(h('div',{class:'src'},meta.title||''));ctrls.push({id,c});ol.append(c.el)});
  const status=h('p',{class:'summary',role:'status'});
  const check=()=>{let r=0;ctrls.forEach(({id,c})=>{const ok=c.check();if(ok)r++;markItem(id,ok)});status.textContent=r+' von '+ctrls.length+' richtig – die richtigen sind aus der Liste raus.'};
  enterNav(ol,check);
  box.append(h('section',{class:'ex'},h('div',{class:'ex-head'},h('div',{},h('div',{class:'kicker'},'Wiederholung'),h('h3',{},ids.length+' offene Fehler')),h('span',{class:'badge'},'max. 30 pro Runde')),ol,status,
    h('div',{class:'row foot'},h('button',{class:'btn primary',type:'button',onclick:check},'Prüfen'),h('button',{class:'btn',type:'button',onclick:renderReview},'Liste aktualisieren'))));
}

/* =================== mock test =================== */
let testTimer=null;
function noteFor(p){return p>=.92?['1','sehr gut']:p>=.81?['2','gut']:p>=.67?['3','befriedigend']:p>=.5?['4','ausreichend']:p>=.3?['5','mangelhaft']:['6','ungenügend']}
function buildTest(){const box=$('#test-box');box.innerHTML='';clearInterval(testTimer);
  const pick=(exId,n)=>shuffle(EX[exId].items.map((_,i)=>exId+'-'+i)).slice(0,n);
  const partA=[...pick('g1a',4),...pick('g1b',2),...pick('g2s',2),...pick('g2a',4),...pick('g2b',3),...pick('g3a',2),...pick('g3b',2),...pick('g3c',1)];
  const partB=shuffle(ALLVOC).slice(0,5).map(vocId);
  const ctrls=[];
  const mk=(ids,title,hint)=>{const ol=h('ol',{class:'items'});ids.forEach(id=>{const c=ctrlFor(id,'t');ctrls.push({id,c});ol.append(c.el)});return h('section',{class:'ex'},h('div',{class:'part-h'},title),h('p',{class:'ex-intro'},hint),ol)};
  const t0=Date.now();const timer=$('#test-timer');
  testTimer=setInterval(()=>{const s=(Date.now()-t0)/1000|0;timer.textContent=String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);timer.textContent='00:00';
  const result=h('div');
  const submit=h('button',{class:'btn primary',type:'button',onclick(){clearInterval(testTimer);let r=0;ctrls.forEach(({id,c})=>{const ok=c.check();if(ok)r++;markItem(id,ok)});
    saveScore('test',r,ctrls.length);const p=r/ctrls.length;const [n,w]=noteFor(p);submit.disabled=true;
    result.innerHTML='';result.append(h('div',{class:'result'},h('div',{class:'row',style:'justify-content:space-between;align-items:flex-end'},h('div',{},h('div',{class:'kicker',style:'color:inherit;opacity:.8'},'Ergebnis'),h('div',{class:'big'},r+' / '+ctrls.length)),h('div',{style:'text-align:right'},h('div',{class:'big'},n),h('div',{},w))),
      h('p',{style:'margin:10px 0 0;opacity:.85;font-size:14px'},'Grobe Orientierung (Zeit: '+timer.textContent+'). Eure Lehrkraft kann anders gewichten. Die Fehler stehen jetzt im Fehlertrainer; die Erklärungen siehst du unter jeder Aufgabe.')));
    result.scrollIntoView({behavior:'smooth',block:'center'})}},'Abgeben');
  const a=mk(partA,'Teil A · Grammatik','Infinitiv, Gerund, Emphasis. Bei Auswahlaufgaben erst wählen – bewertet wird beim Abgeben.');
  const b=mk(partB,'Teil B · Wortschatz','Schreib das englische Wort.');
  box.append(a,b,h('div',{class:'row foot'},submit),result);
  enterNav(box,null);
}

/* =================== boot =================== */
function boot(){
  buildNav();buildBlog();
  $$('[data-ex]').forEach(el=>{const id=el.dataset.ex;el.replaceWith(buildExercise(id,EX[id]))});
  buildVocab();buildListening();buildPads();buildPlan();
  $('#test-new').addEventListener('click',buildTest);
  $$('.rule,.lead').forEach(el=>{if(el.innerHTML.includes('{L:'))el.innerHTML=fmt(el.innerHTML)});
  refreshProgress();
  const start=(location.hash||'').slice(1)||store.get('sec','start');go(start);
  window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
}
boot();

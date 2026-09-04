const fs = require('fs');

// ====== Helpers ======
const Q = [];
const seen = new Set();

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  let c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}
function esc(s) { return String(s).replace(/'/g, "''"); }

function mk(correct, wrongs) {
  let opts = [correct];
  for (let w of wrongs) {
    if (w !== correct && !opts.includes(w)) opts.push(w);
  }
  while (opts.length < 4) {
    let v = String(ri(1, 99));
    if (!opts.includes(v)) opts.push(v);
  }
  opts = opts.slice(0, 4);
  let sh = shuffle(opts);
  let idx = sh.indexOf(correct);
  let ans = 'ABCD'[idx];
  let formatted = sh.map((o, i) => `${'ABCD'[i]}. ${o}`);
  return { o: JSON.stringify(formatted), a: ans };
}

// mk with labeled options (used when distractors are pre-formatted full strings)
function mkRaw(correct, wrongs) {
  return mk(correct, wrongs);
}

function add(ch, t, q, o, a, e, d) {
  // Dedup by question + options so stems that legitimately repeat
  // (e.g. "Which sentence is grammatically correct?") with different
  // option sets are still kept as distinct questions.
  let key = q + '||' + o;
  if (seen.has(key)) return;
  seen.add(key);
  Q.push({ ch, t, q, o, a, e, d });
}

// ============================================================
// WORD BANK  (520+ 考研核心词汇 with meaning / synonym / antonym)
// m = meaning, s = synonyms, a = antonyms
// ============================================================
const WB = [
  {w:'abandon',m:'to give up completely',s:['desert','forsake','relinquish'],a:['retain','keep','maintain']},
  {w:'absorb',m:'to take in or soak up',s:['soak up','assimilate','ingest'],a:['emit','release','exude']},
  {w:'abstract',m:'existing as an idea but not concrete',s:['theoretical','conceptual'],a:['concrete','specific']},
  {w:'abundant',m:'existing in large quantities',s:['plentiful','ample','copious'],a:['scarce','sparse','rare']},
  {w:'accelerate',m:'to increase speed',s:['quicken','hasten','expedite'],a:['decelerate','slow down','retard']},
  {w:'accommodate',m:'to provide room or adapt to',s:['lodge','adapt','adjust'],a:['displace','discommode']},
  {w:'accomplish',m:'to succeed in completing',s:['achieve','complete','fulfill'],a:['fail','fall short']},
  {w:'accumulate',m:'to gather or build up over time',s:['amass','collect','hoard'],a:['disperse','dissipate','scatter']},
  {w:'accurate',m:'correct in all details',s:['precise','exact','correct'],a:['inaccurate','imprecise','faulty']},
  {w:'achieve',m:'to reach a goal through effort',s:['accomplish','attain','realize'],a:['fail','miss']},
  {w:'acknowledge',m:'to admit or recognize',s:['admit','concede','recognize'],a:['deny','dispute','repudiate']},
  {w:'acquire',m:'to gain or come to have',s:['obtain','gain','procure'],a:['lose','forfeit','relinquish']},
  {w:'adapt',m:'to adjust to new conditions',s:['adjust','accommodate','modify'],a:['keep','preserve','retain']},
  {w:'adequate',m:'enough for a purpose',s:['sufficient','ample','enough'],a:['inadequate','insufficient','deficient']},
  {w:'adjust',m:'to change slightly to fit',s:['adapt','modify','alter'],a:['keep','maintain','preserve']},
  {w:'administer',m:'to manage or apply',s:['manage','direct','execute'],a:['neglect','ignore']},
  {w:'advocate',m:'to publicly support',s:['support','endorse','champion'],a:['oppose','resist','condemn']},
  {w:'allocate',m:'to distribute for a purpose',s:['assign','allot','distribute'],a:['withhold','retain']},
  {w:'alter',m:'to change in character',s:['change','modify','transform'],a:['keep','preserve','maintain']},
  {w:'ambiguous',m:'open to more than one meaning',s:['vague','unclear','equivocal'],a:['clear','explicit','unambiguous']},
  {w:'analyze',m:'to examine in detail',s:['examine','study','evaluate'],a:['ignore','overlook']},
  {w:'anticipate',m:'to expect or foresee',s:['expect','foresee','await'],a:['doubt','question']},
  {w:'apparent',m:'clearly seen or understood',s:['obvious','evident','clear'],a:['obscure','hidden','unclear']},
  {w:'appeal',m:'a strong request or attraction',s:['request','plea','attraction'],a:['repulsion','disinterest']},
  {w:'appropriate',m:'suitable for a purpose',s:['suitable','fitting','proper'],a:['unsuitable','inappropriate','improper']},
  {w:'approximate',m:'close to but not exact',s:['rough','estimated','close'],a:['exact','precise','accurate']},
  {w:'arbitrary',m:'based on random choice',s:['random','capricious','unreasonable'],a:['reasoned','systematic','planned']},
  {w:'assemble',m:'to gather together',s:['gather','convene','collect'],a:['disperse','disband','dissolve']},
  {w:'assess',m:'to evaluate or estimate',s:['evaluate','appraise','estimate'],a:['ignore','neglect']},
  {w:'assign',m:'to allocate a task',s:['allocate','allot','appoint'],a:['revoke','withdraw']},
  {w:'assist',m:'to help',s:['help','aid','support'],a:['hinder','obstruct','impede']},
  {w:'associate',m:'to connect in mind',s:['connect','link','relate'],a:['separate','disconnect','dissociate']},
  {w:'assume',m:'to suppose without proof',s:['suppose','presume','believe'],a:['prove','verify','confirm']},
  {w:'assure',m:'to make certain or confident',s:['guarantee','convince','pledge'],a:['alarm','unsettle']},
  {w:'attain',m:'to succeed in achieving',s:['achieve','reach','accomplish'],a:['fail','lose']},
  {w:'attribute',m:'to ascribe a cause',s:['ascribe','credit','impute'],a:['detach','disconnect']},
  {w:'authentic',m:'genuine and real',s:['genuine','real','true'],a:['fake','false','counterfeit']},
  {w:'authorize',m:'to give official permission',s:['permit','sanction','approve'],a:['forbid','prohibit','veto']},
  {w:'automatic',m:'working by itself',s:['self-acting','involuntary','mechanical'],a:['manual','deliberate','voluntary']},
  {w:'autonomous',m:'self-governing',s:['independent','self-governing','sovereign'],a:['dependent','subject','controlled']},
  {w:'available',m:'able to be used or obtained',s:['accessible','obtainable','ready'],a:['unavailable','inaccessible']},
  {w:'aware',m:'having knowledge of',s:['conscious','mindful','cognizant'],a:['unaware','ignorant','oblivious']},
  {w:'beneficial',m:'producing good results',s:['helpful','advantageous','favorable'],a:['harmful','detrimental','adverse']},
  {w:'capable',m:'having ability',s:['able','competent','skilled'],a:['incapable','unable','incompetent']},
  {w:'cease',m:'to bring to an end',s:['stop','halt','quit'],a:['start','begin','commence']},
  {w:'circumstance',m:'a condition or fact',s:['condition','situation','factor'],a:[]},
  {w:'coherent',m:'logical and consistent',s:['logical','consistent','rational'],a:['illogical','incoherent','disjointed']},
  {w:'coincide',m:'to happen at the same time',s:['concur','synchronize','agree'],a:['differ','clash','diverge']},
  {w:'commence',m:'to begin',s:['begin','start','initiate'],a:['end','conclude','cease']},
  {w:'compatible',m:'able to exist together',s:['consistent','harmonious','agreeable'],a:['incompatible','conflicting']},
  {w:'compensate',m:'to make up for',s:['reimburse','repay','make amends'],a:['penalize','deprive']},
  {w:'compile',m:'to assemble into a list',s:['assemble','collect','gather'],a:['disperse','scatter']},
  {w:'complement',m:'to complete or enhance',s:['complete','enhance','supplement'],a:['spoil','mar','impair']},
  {w:'comply',m:'to act in accordance',s:['obey','conform','yield'],a:['resist','disobey','defy']},
  {w:'comprehensive',m:'complete and broad',s:['thorough','complete','extensive'],a:['partial','incomplete','limited']},
  {w:'comprise',m:'to consist of',s:['include','contain','consist of'],a:['exclude','omit']},
  {w:'conceive',m:'to form an idea',s:['imagine','envision','devise'],a:['misunderstand','overlook']},
  {w:'conclude',m:'to bring to an end',s:['end','finish','terminate'],a:['begin','start','commence']},
  {w:'concrete',m:'definite and specific',s:['specific','definite','tangible'],a:['abstract','vague','general']},
  {w:'conduct',m:'to carry out or behavior',s:['behavior','carry out','manage'],a:[]},
  {w:'confine',m:'to keep within limits',s:['restrict','limit','restrain'],a:['free','release','liberate']},
  {w:'confirm',m:'to establish the truth of',s:['verify','corroborate','validate'],a:['contradict','refute','disprove']},
  {w:'conflict',m:'a serious disagreement',s:['clash','dispute','struggle'],a:['harmony','agreement','peace']},
  {w:'conform',m:'to comply with rules',s:['comply','obey','accord'],a:['disobey','deviate','rebel']},
  {w:'confront',m:'to face a difficulty',s:['face','encounter','tackle'],a:['avoid','evade','sidestep']},
  {w:'conserve',m:'to protect from loss',s:['preserve','save','protect'],a:['waste','squander','deplete']},
  {w:'considerable',m:'large in amount',s:['substantial','significant','ample'],a:['small','minor','insignificant']},
  {w:'consistent',m:'acting the same way',s:['steady','uniform','coherent'],a:['inconsistent','erratic','variable']},
  {w:'constitute',m:'to make up or form',s:['compose','form','comprise'],a:['dissolve','dismantle']},
  {w:'construct',m:'to build or create',s:['build','erect','assemble'],a:['demolish','destroy','dismantle']},
  {w:'consume',m:'to use up or eat',s:['use up','devour','exhaust'],a:['conserve','save','preserve']},
  {w:'contemporary',m:'of the present time',s:['modern','current','present-day'],a:['ancient','outdated','old-fashioned']},
  {w:'contradict',m:'to say the opposite',s:['oppose','deny','refute'],a:['confirm','agree','support']},
  {w:'contribute',m:'to give to a common cause',s:['donate','provide','supply'],a:['withdraw','withhold','take']},
  {w:'controversy',m:'a public dispute',s:['dispute','argument','debate'],a:['agreement','accord','consensus']},
  {w:'convey',m:'to communicate or transport',s:['communicate','transmit','express'],a:['conceal','withhold','hide']},
  {w:'convince',m:'to persuade firmly',s:['persuade','assure','satisfy'],a:['dissuade','deter','discourage']},
  {w:'correspond',m:'to match or communicate',s:['match','agree','communicate'],a:['differ','clash','contradict']},
  {w:'crucial',m:'extremely important',s:['vital','essential','critical'],a:['trivial','minor','insignificant']},
  {w:'cumulative',m:'increasing by addition',s:['accumulative','additive','growing'],a:['reducing','decreasing']},
  {w:'debate',m:'a formal discussion',s:['discussion','argument','dispute'],a:['agreement','consensus']},
  {w:'decline',m:'to decrease or refuse',s:['decrease','drop','refuse'],a:['increase','rise','accept']},
  {w:'deduce',m:'to infer logically',s:['infer','conclude','derive'],a:['guess','speculate']},
  {w:'define',m:'to state the meaning',s:['explain','describe','specify'],a:['obscure','confuse']},
  {w:'delegate',m:'to entrust to another',s:['assign','entrust','appoint'],a:['retain','withhold']},
  {w:'deliberate',m:'done on purpose',s:['intentional','planned','purposeful'],a:['accidental','unintentional','random']},
  {w:'demonstrate',m:'to show clearly',s:['show','display','illustrate'],a:['conceal','hide','mask']},
  {w:'depict',m:'to represent in art',s:['portray','illustrate','describe'],a:['distort','misrepresent']},
  {w:'derive',m:'to obtain from a source',s:['obtain','draw','extract'],a:['give','provide','bestow']},
  {w:'detect',m:'to discover or notice',s:['discover','notice','perceive'],a:['miss','overlook','ignore']},
  {w:'deter',m:'to discourage from action',s:['discourage','dissuade','hinder'],a:['encourage','urge','promote']},
  {w:'determine',m:'to decide firmly',s:['decide','resolve','establish'],a:['hesitate','waiver']},
  {w:'diminish',m:'to make smaller',s:['decrease','reduce','shrink'],a:['increase','enlarge','expand']},
  {w:'discard',m:'to throw away',s:['dispose of','reject','dump'],a:['keep','retain','preserve']},
  {w:'disclose',m:'to make known',s:['reveal','uncover','expose'],a:['conceal','hide','cover']},
  {w:'dispute',m:'a disagreement or argument',s:['argument','conflict','controversy'],a:['agreement','harmony','accord']},
  {w:'distinct',m:'clearly different',s:['different','separate','clear'],a:['similar','identical','indistinct']},
  {w:'distribute',m:'to give out',s:['dispense','hand out','allocate'],a:['collect','gather','hoard']},
  {w:'divert',m:'to turn aside',s:['redirect','deflect','distract'],a:['direct','focus','concentrate']},
  {w:'dominant',m:'most important or powerful',s:['predominant','superior','ruling'],a:['subordinate','inferior','weak']},
  {w:'draft',m:'a preliminary version',s:['sketch','outline','preliminary'],a:['final','finished']},
  {w:'duration',m:'the length of time',s:['length','span','period'],a:[]},
  {w:'dwell',m:'to live or stay',s:['reside','inhabit','linger'],a:['leave','depart','vacate']},
  {w:'elaborate',m:'detailed and complex',s:['detailed','complex','intricate'],a:['simple','plain','basic']},
  {w:'eligible',m:'qualified to participate',s:['qualified','suitable','entitled'],a:['ineligible','unqualified','disqualified']},
  {w:'eliminate',m:'to remove completely',s:['remove','eradicate','delete'],a:['add','include','retain']},
  {w:'emerge',m:'to come into view',s:['appear','surface','arise'],a:['disappear','vanish','submerge']},
  {w:'emphasize',m:'to give special importance',s:['highlight','stress','underline'],a:['downplay','minimize','understate']},
  {w:'endorse',m:'to declare approval',s:['approve','support','back'],a:['oppose','reject','condemn']},
  {w:'enhance',m:'to improve the quality',s:['improve','boost','augment'],a:['diminish','impair','worsen']},
  {w:'enormous',m:'very large in size',s:['huge','immense','massive'],a:['tiny','small','minute']},
  {w:'ensure',m:'to make certain',s:['guarantee','secure','assure'],a:['endanger','jeopardize','risk']},
  {w:'equivalent',m:'equal in value',s:['equal','identical','comparable'],a:['different','unequal','dissimilar']},
  {w:'erode',m:'to wear away gradually',s:['wear away','corrode','deteriorate'],a:['build up','strengthen','reinforce']},
  {w:'essential',m:'absolutely necessary',s:['vital','crucial','indispensable'],a:['unnecessary','dispensable','trivial']},
  {w:'establish',m:'to set up firmly',s:['set up','found','institute'],a:['abolish','dismantle','destroy']},
  {w:'evaluate',m:'to judge the value',s:['assess','appraise','judge'],a:['ignore','neglect']},
  {w:'evident',m:'plainly seen',s:['obvious','apparent','clear'],a:['obscure','hidden','unclear']},
  {w:'evolve',m:'to develop gradually',s:['develop','unfold','progress'],a:['regress','decline','stagnate']},
  {w:'exaggerate',m:'to overstate',s:['overstate','magnify','amplify'],a:['understate','minimize','downplay']},
  {w:'exceed',m:'to go beyond',s:['surpass','transcend','overtop'],a:['fall short','lag','trail']},
  {w:'exclude',m:'to keep out',s:['omit','bar','ban'],a:['include','admit','incorporate']},
  {w:'exhibit',m:'to show publicly',s:['display','show','demonstrate'],a:['conceal','hide','suppress']},
  {w:'expand',m:'to grow larger',s:['enlarge','extend','grow'],a:['shrink','contract','reduce']},
  {w:'explicit',m:'stated clearly',s:['clear','definite','unambiguous'],a:['implicit','vague','ambiguous']},
  {w:'exploit',m:'to make use of',s:['utilize','harness','leverage'],a:['neglect','waste','ignore']},
  {w:'expose',m:'to uncover or reveal',s:['reveal','uncover','disclose'],a:['conceal','hide','cover']},
  {w:'extend',m:'to make longer',s:['lengthen','stretch','prolong'],a:['shorten','shrink','reduce']},
  {w:'exterior',m:'the outer part',s:['outside','surface','outer'],a:['interior','inside','inner']},
  {w:'external',m:'on the outside',s:['outer','exterior','outside'],a:['internal','inner','inside']},
  {w:'facilitate',m:'to make easier',s:['ease','simplify','assist'],a:['hinder','hamper','impede']},
  {w:'feasible',m:'possible to do',s:['possible','viable','practical'],a:['impossible','unviable','impractical']},
  {w:'fluctuate',m:'to rise and fall',s:['vary','oscillate','waver'],a:['stabilize','remain','hold']},
  {w:'focus',m:'to concentrate attention',s:['concentrate','center','fixate'],a:['scatter','disperse','diffuse']},
  {w:'formulate',m:'to create or devise',s:['devise','create','express'],a:['destroy','dismantle']},
  {w:'function',m:'a purpose or role',s:['role','purpose','duty'],a:[]},
  {w:'fundamental',m:'forming a base',s:['basic','essential','primary'],a:['secondary','peripheral','minor']},
  {w:'generate',m:'to produce or create',s:['produce','create','yield'],a:['destroy','consume','eliminate']},
  {w:'genuine',m:'truly what it seems',s:['authentic','real','true'],a:['fake','false','artificial']},
  {w:'guarantee',m:'a formal assurance',s:['warranty','pledge','assurance'],a:['risk','uncertainty']},
  {w:'halt',m:'to stop moving',s:['stop','pause','cease'],a:['start','resume','continue']},
  {w:'hence',m:'as a result',s:['therefore','thus','consequently'],a:[]},
  {w:'highlight',m:'to draw attention to',s:['emphasize','stress','spotlight'],a:['downplay','minimize','obscure']},
  {w:'identical',m:'exactly the same',s:['same','matching','indistinguishable'],a:['different','distinct','dissimilar']},
  {w:'identify',m:'to recognize or establish',s:['recognize','distinguish','spot'],a:['confuse','mistake','overlook']},
  {w:'ignore',m:'to refuse to notice',s:['disregard','overlook','neglect'],a:['notice','heed','attend']},
  {w:'immense',m:'extremely large',s:['huge','vast','enormous'],a:['tiny','small','minute']},
  {w:'impact',m:'a marked effect',s:['effect','influence','consequence'],a:[]},
  {w:'implement',m:'to put into effect',s:['execute','carry out','apply'],a:['cancel','abandon','withdraw']},
  {w:'imply',m:'to suggest without saying',s:['suggest','hint','insinuate'],a:['state','declare','express']},
  {w:'impose',m:'to force upon',s:['inflict','levy','enforce'],a:['remove','lift','withdraw']},
  {w:'incentive',m:'something that motivates',s:['motivation','stimulus','encouragement'],a:['deterrent','discouragement']},
  {w:'incorporate',m:'to include as part',s:['include','integrate','absorb'],a:['exclude','remove','separate']},
  {w:'indicate',m:'to point out or show',s:['show','point out','signify'],a:['conceal','hide','mask']},
  {w:'indispensable',m:'absolutely necessary',s:['essential','vital','crucial'],a:['dispensable','unnecessary','trivial']},
  {w:'induce',m:'to bring about',s:['cause','prompt','bring about'],a:['prevent','deter','stop']},
  {w:'inevitable',m:'certain to happen',s:['unavoidable','certain','inescapable'],a:['avoidable','uncertain','preventable']},
  {w:'influence',m:'the power to affect',s:['effect','sway','impact'],a:[]},
  {w:'inherit',m:'to receive from ancestors',s:['receive','acquire','obtain'],a:['forfeit','lose','relinquish']},
  {w:'initial',m:'at the beginning',s:['first','opening','original'],a:['final','last','concluding']},
  {w:'initiate',m:'to begin or start',s:['begin','start','launch'],a:['end','conclude','terminate']},
  {w:'innovate',m:'to introduce new ideas',s:['invent','pioneer','modernize'],a:['imitate','copy','stagnate']},
  {w:'insert',m:'to put in',s:['place','put','inject'],a:['remove','extract','withdraw']},
  {w:'inspect',m:'to examine closely',s:['examine','scrutinize','check'],a:['ignore','overlook','miss']},
  {w:'inspire',m:'to fill with confidence',s:['encourage','motivate','stimulate'],a:['discourage','dissuade','dishearten']},
  {w:'install',m:'to set up for use',s:['set up','fit','equip'],a:['remove','uninstall','dismantle']},
  {w:'instinct',m:'innate behavior',s:['intuition','impulse','innate'],a:['reasoning','deliberation']},
  {w:'integrate',m:'to combine parts',s:['combine','unite','merge'],a:['separate','divide','disintegrate']},
  {w:'intense',m:'very strong',s:['strong','fierce','extreme'],a:['mild','weak','gentle']},
  {w:'interfere',m:'to meddle in affairs',s:['meddle','intrude','intervene'],a:['assist','help','cooperate']},
  {w:'interpret',m:'to explain the meaning',s:['explain','translate','decode'],a:['confuse','distort']},
  {w:'intervene',m:'to come between',s:['interfere','mediate','step in'],a:['withdraw','avoid','ignore']},
  {w:'investigate',m:'to examine carefully',s:['examine','probe','explore'],a:['ignore','disregard']},
  {w:'involve',m:'to include as part',s:['include','entail','implicate'],a:['exclude','omit','leave out']},
  {w:'isolate',m:'to set apart',s:['separate','seclude','quarantine'],a:['combine','unite','integrate']},
  {w:'justify',m:'to show to be right',s:['defend','vindicate','warrant'],a:['condemn','blame','indict']},
  {w:'launch',m:'to start or set in motion',s:['start','begin','initiate'],a:['end','stop','halt']},
  {w:'legitimate',m:'conforming to law',s:['legal','lawful','valid'],a:['illegal','unlawful','invalid']},
  {w:'liable',m:'responsible by law',s:['responsible','accountable','answerable'],a:['immune','exempt']},
  {w:'likewise',m:'in the same way',s:['similarly','also','moreover'],a:[]},
  {w:'link',m:'a connection',s:['connection','tie','bond'],a:['break','sever','disconnect']},
  {w:'literal',m:'taking words in their basic sense',s:['exact','factual','verbatim'],a:['figurative','metaphorical']},
  {w:'maintain',m:'to keep in existence',s:['keep','preserve','sustain'],a:['abandon','neglect','drop']},
  {w:'manipulate',m:'to handle or control',s:['control','handle','influence'],a:['release','let go']},
  {w:'manual',m:'done by hand',s:['handbook','hand-operated','physical'],a:['automatic','mechanized']},
  {w:'margin',m:'the edge or border',s:['edge','border','brim'],a:['center','middle','core']},
  {w:'mature',m:'fully developed',s:['grown','ripe','adult'],a:['immature','green','unripe']},
  {w:'maximize',m:'to make as large as possible',s:['increase','boost','amplify'],a:['minimize','reduce','decrease']},
  {w:'mechanism',m:'a system of parts',s:['system','process','device'],a:[]},
  {w:'modify',m:'to make small changes',s:['alter','adjust','adapt'],a:['keep','preserve','maintain']},
  {w:'monitor',m:'to watch closely',s:['watch','observe','track'],a:['ignore','neglect','overlook']},
  {w:'motivate',m:'to provide a reason',s:['inspire','encourage','stimulate'],a:['discourage','deter','dishearten']},
  {w:'negotiate',m:'to discuss to reach agreement',s:['bargain','discuss','mediate'],a:['dictate','impose','demand']},
  {w:'neutral',m:'not taking sides',s:['impartial','unbiased','objective'],a:['biased','partial','prejudiced']},
  {w:'nominal',m:'in name only',s:['token','symbolic','minimal'],a:['real','substantial','actual']},
  {w:'notion',m:'a conception or idea',s:['idea','concept','belief'],a:['fact','reality']},
  {w:'objective',m:'a goal or aim',s:['goal','aim','target'],a:[]},
  {w:'obligation',m:'a binding commitment',s:['duty','commitment','responsibility'],a:['option','choice','freedom']},
  {w:'obscure',m:'not clearly known',s:['unclear','vague','dim'],a:['clear','obvious','evident']},
  {w:'obstacle',m:'a thing that blocks',s:['barrier','hindrance','block'],a:['help','aid','advantage']},
  {w:'obtain',m:'to come to have',s:['acquire','get','gain'],a:['lose','forfeit','relinquish']},
  {w:'obvious',m:'easy to see or understand',s:['clear','evident','apparent'],a:['obscure','hidden','unclear']},
  {w:'occupy',m:'to take up space',s:['fill','inhabit','engage'],a:['vacate','empty','leave']},
  {w:'occur',m:'to happen',s:['happen','take place','arise'],a:['cease','stop','end']},
  {w:'operate',m:'to function or control',s:['run','work','manage'],a:['stop','halt','shut down']},
  {w:'oppose',m:'to be against',s:['resist','contest','object'],a:['support','favor','endorse']},
  {w:'opt',m:'to choose',s:['choose','select','pick'],a:['reject','decline','refuse']},
  {w:'origin',m:'the point where something begins',s:['source','root','beginning'],a:['end','conclusion','finish']},
  {w:'outcome',m:'a final result',s:['result','consequence','effect'],a:['cause','origin','source']},
  {w:'overcome',m:'to defeat or prevail',s:['defeat','conquer','surmount'],a:['surrender','yield','succumb']},
  {w:'participate',m:'to take part',s:['join','partake','engage'],a:['withdraw','quit','boycott']},
  {w:'perceive',m:'to become aware of',s:['notice','discern','observe'],a:['miss','overlook','ignore']},
  {w:'persist',m:'to continue firmly',s:['endure','persevere','continue'],a:['quit','stop','yield']},
  {w:'phenomenon',m:'an observable fact',s:['occurrence','event','fact'],a:[]},
  {w:'pioneer',m:'a person who explores',s:['innovator','trailblazer','founder'],a:['follower','imitator']},
  {w:'portion',m:'a part of a whole',s:['part','share','segment'],a:['whole','entirety','total']},
  {w:'possess',m:'to have or own',s:['own','have','hold'],a:['lack','forfeit','lose']},
  {w:'potential',m:'possible but not yet actual',s:['possible','latent','prospective'],a:['actual','real','current']},
  {w:'predominant',m:'most common or powerful',s:['dominant','prevailing','main'],a:['minor','subordinate','weak']},
  {w:'preserve',m:'to keep safe',s:['protect','conserve','maintain'],a:['destroy','ruin','discard']},
  {w:'prevail',m:'to prove more powerful',s:['triumph','predominate','win'],a:['fail','lose','surrender']},
  {w:'primary',m:'first in importance',s:['chief','principal','main'],a:['secondary','minor','subordinate']},
  {w:'principle',m:'a fundamental truth',s:['rule','law','truth'],a:[]},
  {w:'priority',m:'a thing regarded as more important',s:['precedence','preference','primacy'],a:['afterthought','triviality']},
  {w:'procedure',m:'an established way',s:['process','method','routine'],a:[]},
  {w:'proclaim',m:'to announce publicly',s:['announce','declare','broadcast'],a:['conceal','hide','suppress']},
  {w:'prolong',m:'to extend the duration',s:['extend','lengthen','draw out'],a:['shorten','cut','curtail']},
  {w:'promote',m:'to advance or encourage',s:['advance','boost','further'],a:['hinder','impede','demote']},
  {w:'propose',m:'to put forward an idea',s:['suggest','offer','present'],a:['withdraw','retract','cancel']},
  {w:'prospect',m:'an expectation of success',s:['outlook','expectation','chance'],a:['hopelessness','despair']},
  {w:'pursue',m:'to follow or chase',s:['chase','follow','seek'],a:['flee','abandon','evade']},
  {w:'qualify',m:'to become entitled',s:['entitle','license','certify'],a:['disqualify','exclude']},
  {w:'quote',m:'to repeat exactly',s:['cite','recite','repeat'],a:['paraphrase','summarize']},
  {w:'radical',m:'relating to the root',s:['fundamental','extreme','thorough'],a:['moderate','superficial','conservative']},
  {w:'random',m:'without a pattern',s:['chance','arbitrary','haphazard'],a:['planned','systematic','deliberate']},
  {w:'rational',m:'based on reason',s:['logical','reasonable','sensible'],a:['irrational','unreasonable','absurd']},
  {w:'readily',m:'without hesitation',s:['easily','willingly','promptly'],a:['reluctantly','hardly']},
  {w:'reckon',m:'to consider or calculate',s:['calculate','count','consider'],a:['guess','ignore']},
  {w:'recognize',m:'to identify from before',s:['identify','acknowledge','distinguish'],a:['mistake','overlook','ignore']},
  {w:'recommend',m:'to suggest as good',s:['suggest','advise','endorse'],a:['discourage','dissuade','oppose']},
  {w:'recover',m:'to get back',s:['regain','retrieve','recuperate'],a:['lose','forfeit','surrender']},
  {w:'reduce',m:'to make smaller',s:['decrease','diminish','lessen'],a:['increase','enlarge','expand']},
  {w:'reform',m:'to improve by change',s:['improve','revise','rectify'],a:['ruin','corrupt','worsen']},
  {w:'refute',m:'to prove wrong',s:['disprove','contradict','rebut'],a:['confirm','prove','verify']},
  {w:'regulate',m:'to control by rule',s:['control','govern','manage'],a:['free','release','unleash']},
  {w:'reinforce',m:'to strengthen',s:['strengthen','bolster','support'],a:['weaken','undermine','debilitate']},
  {w:'reject',m:'to refuse to accept',s:['refuse','decline','turn down'],a:['accept','adopt','embrace']},
  {w:'release',m:'to set free',s:['free','liberate','discharge'],a:['capture','detain','confine']},
  {w:'relevant',m:'closely connected',s:['pertinent','related','applicable'],a:['irrelevant','unrelated','inapplicable']},
  {w:'reluctant',m:'unwilling and hesitant',s:['unwilling','hesitant','averse'],a:['willing','eager','keen']},
  {w:'rely',m:'to depend on',s:['depend','count','trust'],a:['distrust','doubt','disbelieve']},
  {w:'remain',m:'to continue to exist',s:['stay','linger','abide'],a:['leave','depart','vanish']},
  {w:'remark',m:'to say or comment',s:['comment','observe','say'],a:['silence','quiet']},
  {w:'remedy',m:'a cure or solution',s:['cure','treatment','solution'],a:['ailment','problem','cause']},
  {w:'remove',m:'to take away',s:['take away','eliminate','delete'],a:['add','insert','place']},
  {w:'replace',m:'to put in place of',s:['substitute','exchange','swap'],a:['keep','retain','preserve']},
  {w:'represent',m:'to stand for',s:['symbolize','stand for','depict'],a:['misrepresent','distort']},
  {w:'require',m:'to need',s:['need','demand','necessitate'],a:['forgo','waive','drop']},
  {w:'resemble',m:'to look like',s:['look like','mirror','echo'],a:['differ','contrast','diverge']},
  {w:'resolve',m:'to settle a problem',s:['settle','solve','decide'],a:['postpone','evade','ignore']},
  {w:'respond',m:'to reply',s:['reply','answer','react'],a:['ignore','silent','question']},
  {w:'restrict',m:'to limit',s:['limit','confine','restrain'],a:['free','release','liberate']},
  {w:'retain',m:'to keep possession of',s:['keep','hold','preserve'],a:['lose','release','discard']},
  {w:'reveal',m:'to make known',s:['disclose','uncover','expose'],a:['conceal','hide','cover']},
  {w:'reverse',m:'to turn around',s:['invert','turn','overturn'],a:['maintain','keep','preserve']},
  {w:'revise',m:'to change to improve',s:['modify','amend','alter'],a:['keep','retain','preserve']},
  {w:'revolution',m:'a complete change',s:['upheaval','transformation','overturn'],a:['stability','status quo']},
  {w:'rigid',m:'not flexible',s:['stiff','inflexible','firm'],a:['flexible','pliable','loose']},
  {w:'safeguard',m:'to protect from harm',s:['protect','defend','shield'],a:['endanger','jeopardize','expose']},
  {w:'scatter',m:'to throw in various directions',s:['disperse','strew','spread'],a:['gather','collect','concentrate']},
  {w:'scope',m:'the extent of coverage',s:['range','extent','reach'],a:[]},
  {w:'secure',m:'safe and fixed',s:['safe','protected','firm'],a:['unsafe','vulnerable','loose']},
  {w:'sequence',m:'a particular order',s:['order','series','succession'],a:['disorder','jumble','chaos']},
  {w:'shift',m:'to change position',s:['move','transfer','change'],a:['stay','remain','hold']},
  {w:'significant',m:'large or important',s:['important','notable','substantial'],a:['insignificant','trivial','minor']},
  {w:'similar',m:'resembling without being identical',s:['alike','comparable','akin'],a:['different','dissimilar','unlike']},
  {w:'simultaneous',m:'happening at the same time',s:['concurrent','synchronized','coincident'],a:['successive','sequential','staggered']},
  {w:'sole',m:'being the only one',s:['single','only','lone'],a:['multiple','shared','joint']},
  {w:'solely',m:'only; exclusively',s:['only','exclusively','purely'],a:['jointly','partly','shared']},
  {w:'source',m:'where something comes from',s:['origin','root','beginning'],a:['end','result','outcome']},
  {w:'specific',m:'clearly defined',s:['precise','exact','particular'],a:['general','vague','broad']},
  {w:'stable',m:'firm and not changing',s:['steady','firm','secure'],a:['unstable','volatile','shaky']},
  {w:'stimulate',m:'to encourage activity',s:['encourage','spur','activate'],a:['discourage','deter','depress']},
  {w:'strategy',m:'a plan to achieve a goal',s:['plan','tactic','approach'],a:['improvisation','guesswork']},
  {w:'stress',m:'pressure or emphasis',s:['pressure','strain','emphasis'],a:['relief','ease','calm']},
  {w:'subordinate',m:'lower in rank',s:['inferior','junior','secondary'],a:['superior','senior','dominant']},
  {w:'subsequent',m:'following in time',s:['following','later','ensuing'],a:['prior','previous','earlier']},
  {w:'substance',m:'a particular kind of matter',s:['material','matter','content'],a:[]},
  {w:'substantial',m:'of considerable amount',s:['considerable','large','significant'],a:['small','minor','insignificant']},
  {w:'sufficient',m:'enough for a purpose',s:['enough','adequate','ample'],a:['insufficient','inadequate','deficient']},
  {w:'summarize',m:'to give a brief account',s:['outline','condense','brief'],a:['expand','elaborate','detail']},
  {w:'supplement',m:'to add to complete',s:['complement','augment','add'],a:['reduce','decrease','subtract']},
  {w:'suppress',m:'to put down by force',s:['quell','repress','subdue'],a:['encourage','foster','incite']},
  {w:'surplus',m:'more than is needed',s:['excess','extra','surplus'],a:['deficit','shortage','lack']},
  {w:'survey',m:'to examine or overview',s:['review','examine','poll'],a:['ignore','overlook']},
  {w:'survive',m:'to continue to live',s:['endure','live','last'],a:['perish','die','succumb']},
  {w:'suspect',m:'to believe possible',s:['doubt','mistrust','guess'],a:['trust','believe','confirm']},
  {w:'sustain',m:'to keep going',s:['maintain','support','uphold'],a:['drop','abandon','end']},
  {w:'symbol',m:'a mark signifying something',s:['sign','mark','emblem'],a:[]},
  {w:'tackle',m:'to deal with a task',s:['handle','address','confront'],a:['avoid','evade','ignore']},
  {w:'tedious',m:'boring and long',s:['boring','tiresome','dull'],a:['exciting','interesting','lively']},
  {w:'temporary',m:'lasting only a short time',s:['brief','short-lived','transient'],a:['permanent','lasting','enduring']},
  {w:'tendency',m:'an inclination',s:['inclination','leaning','trend'],a:['aversion','reluctance']},
  {w:'terminate',m:'to bring to an end',s:['end','conclude','stop'],a:['begin','start','commence']},
  {w:'testimony',m:'a formal statement',s:['evidence','statement','declaration'],a:['denial','contradiction']},
  {w:'theory',m:'a reasoned explanation',s:['hypothesis','explanation','idea'],a:['fact','practice','reality']},
  {w:'trace',m:'to find by evidence',s:['track','follow','locate'],a:['lose','misplace','abandon']},
  {w:'tradition',m:'a long-established custom',s:['custom','practice','heritage'],a:['innovation','novelty','change']},
  {w:'transfer',m:'to move from one place to another',s:['move','shift','relocate'],a:['keep','retain','hold']},
  {w:'transform',m:'to change completely',s:['change','convert','alter'],a:['keep','preserve','maintain']},
  {w:'transmit',m:'to pass on or broadcast',s:['send','convey','broadcast'],a:['receive','keep','withhold']},
  {w:'transparent',m:'allowing light to pass through',s:['clear','see-through','translucent'],a:['opaque','cloudy','murky']},
  {w:'tremendous',m:'very great in amount',s:['huge','enormous','immense'],a:['tiny','small','minute']},
  {w:'trend',m:'a general direction',s:['tendency','direction','movement'],a:['randomness','stability']},
  {w:'trigger',m:'to cause to happen',s:['cause','prompt','spark'],a:['prevent','stop','halt']},
  {w:'ultimate',m:'final or most extreme',s:['final','last','eventual'],a:['first','initial','beginning']},
  {w:'undergo',m:'to experience or endure',s:['experience','endure','suffer'],a:['avoid','evade','escape']},
  {w:'underline',m:'to emphasize',s:['emphasize','highlight','stress'],a:['downplay','minimize','obscure']},
  {w:'undermine',m:'to weaken gradually',s:['weaken','sabotage','subvert'],a:['strengthen','bolster','reinforce']},
  {w:'undertake',m:'to commit to a task',s:['commit','begin','tackle'],a:['abandon','quit','drop']},
  {w:'uniform',m:'not varying',s:['consistent','constant','even'],a:['varied','uneven','irregular']},
  {w:'unique',m:'being the only one of its kind',s:['sole','exclusive','distinctive'],a:['common','ordinary','typical']},
  {w:'unprecedented',m:'never done before',s:['novel','unparalleled','groundbreaking'],a:['usual','common','typical']},
  {w:'utilize',m:'to make practical use of',s:['use','employ','apply'],a:['waste','ignore','neglect']},
  {w:'valid',m:'based on truth or reason',s:['legitimate','sound','lawful'],a:['invalid','unsound','void']},
  {w:'vary',m:'to differ or change',s:['differ','change','fluctuate'],a:['stay','remain','conform']},
  {w:'vehicle',m:'a means of transport',s:['transport','conveyance','car'],a:[]},
  {w:'verify',m:'to make sure of',s:['confirm','check','validate'],a:['disprove','contradict','refute']},
  {w:'viable',m:'able to work successfully',s:['feasible','workable','practical'],a:['unviable','impossible','impractical']},
  {w:'violate',m:'to break a rule',s:['break','breach','infringe'],a:['obey','observe','respect']},
  {w:'virtual',m:'almost real or computer-based',s:['near','effectively','simulated'],a:['actual','real','physical']},
  {w:'visible',m:'able to be seen',s:['perceptible','observable','noticeable'],a:['invisible','hidden','unseen']},
  {w:'vital',m:'absolutely necessary',s:['essential','crucial','indispensable'],a:['trivial','unnecessary','optional']},
  {w:'volume',m:'the amount of space',s:['capacity','bulk','amount'],a:[]},
  {w:'voluntary',m:'done by free choice',s:['willing','freely','optional'],a:['compulsory','forced','mandatory']},
  {w:'warrant',m:'to justify or authorize',s:['justify','deserve','authorize'],a:['disprove','refute','deny']},
  {w:'widespread',m:'found over a large area',s:['extensive','broad','prevalent'],a:['rare','limited','localized']},
  {w:'withstand',m:'to resist or endure',s:['endure','resist','survive'],a:['yield','succumb','surrender']},
  {w:'yield',m:'to produce or give way',s:['produce','surrender','give'],a:['resist','withstand','hold']},
  {w:'absence',m:'the state of being away',s:['lack','shortage','unavailability'],a:['presence','attendance']},
  {w:'accumulate',m:'to gather over time',s:['amass','collect','hoard'],a:['disperse','scatter','dissipate']},
  {w:'acute',m:'sharp or severe',s:['severe','intense','sharp'],a:['mild','dull','chronic']},
  {w:'adequate',m:'enough for a purpose',s:['sufficient','ample'],a:['insufficient','deficient']},
  {w:'adjacent',m:'next to or adjoining',s:['neighboring','adjoining','beside'],a:['distant','far','remote']},
  {w:'adverse',m:'unfavorable or harmful',s:['unfavorable','hostile','harmful'],a:['favorable','beneficial','friendly']},
  {w:'agitate',m:'to stir up or disturb',s:['disturb','stir','incite'],a:['calm','soothe','pacify']},
  {w:'alleviate',m:'to make less severe',s:['ease','relieve','mitigate'],a:['worsen','aggravate','intensify']},
  {w:'ambiguous',m:'open to multiple meanings',s:['vague','equivocal'],a:['clear','explicit']},
  {w:'ample',m:'more than enough',s:['plentiful','abundant','sufficient'],a:['scarce','insufficient','meager']},
  {w:'arouse',m:'to awaken or stir up',s:['awaken','stir','excite'],a:['calm','quiet','soothe']},
  {w:'ascend',m:'to go up',s:['climb','rise','mount'],a:['descend','drop','fall']},
  {w:'ascribe',m:'to attribute to a cause',s:['attribute','credit','impute'],a:['deny','disclaim']},
  {w:'assert',m:'to state confidently',s:['declare','state','affirm'],a:['deny','contradict','retract']},
  {w:'barrier',m:'an obstacle that blocks',s:['obstacle','block','hindrance'],a:['aid','help','opening']},
  {w:'beneath',m:'below or under',s:['under','below','underneath'],a:['above','over','upon']},
  {w:'besides',m:'in addition to',s:['moreover','also','furthermore'],a:[]},
  {w:'beyond',m:'farther than',s:['past','outside','exceeding'],a:['within','inside']},
  {w:'boost',m:'to increase or improve',s:['increase','lift','raise'],a:['decrease','lower','reduce']},
  {w:'breed',m:'to produce offspring',s:['raise','reproduce','rear'],a:['sterilize','extinguish']},
  {w:'bulk',m:'a large mass',s:['mass','size','volume'],a:['fraction','portion','bit']},
  {w:'candid',m:'honest and direct',s:['honest','frank','outspoken'],a:['deceitful','guarded','evasive']},
  {w:'cease',m:'to stop',s:['stop','quit','halt'],a:['start','begin','commence']},
  {w:'chronic',m:'lasting a long time',s:['lingering','persistent','long-term'],a:['acute','brief','temporary']},
  {w:'clarity',m:'clearness',s:['clearness','lucidity','transparency'],a:['obscurity','vagueness','confusion']},
  {w:'compel',m:'to force or oblige',s:['force','coerce','oblige'],a:['free','release','liberate']},
  {w:'compulsory',m:'required by rule',s:['mandatory','obligatory','required'],a:['optional','voluntary','elective']},
  {w:'conceal',m:'to keep from being seen',s:['hide','cover','mask'],a:['reveal','expose','uncover']},
  {w:'condemn',m:'to express disapproval',s:['censure','denounce','criticize'],a:['praise','commend','approve']},
  {w:'contend',m:'to compete or argue',s:['compete','argue','assert'],a:['concede','yield','agree']},
  {w:'convey',m:'to communicate',s:['communicate','transmit','convey'],a:['withhold','conceal']},
  {w:'corrode',m:'to destroy gradually',s:['erode','rust','wear away'],a:['preserve','protect','strengthen']},
  {w:'customary',m:'according to custom',s:['usual','traditional','habitual'],a:['unusual','novel','rare']},
  {w:'deficiency',m:'a lack or shortage',s:['lack','shortage','deficit'],a:['abundance','surplus','excess']},
  {w:'definite',m:'clearly defined',s:['clear','specific','precise'],a:['vague','indefinite','unclear']},
  {w:'deprive',m:'to take away from',s:['strip','dispossess','rob'],a:['provide','give','supply']},
  {w:'descend',m:'to go down',s:['drop','fall','decline'],a:['ascend','rise','climb']},
  {w:'detain',m:'to keep from proceeding',s:['hold','arrest','delay'],a:['release','free','liberate']},
  {w:'devise',m:'to plan or invent',s:['invent','design','contrive'],a:['copy','imitate']},
  {w:'disperse',m:'to spread in different directions',s:['scatter','diffuse','dissipate'],a:['gather','collect','concentrate']},
  {w:'dispose',m:'to get rid of',s:['discard','dump','arrange'],a:['keep','retain','preserve']},
  {w:'elevate',m:'to lift up',s:['raise','lift','promote'],a:['lower','demote','drop']},
  {w:'embrace',m:'to accept willingly',s:['accept','adopt','welcome'],a:['reject','spurn','repel']},
  {w:'endure',m:'to suffer patiently',s:['bear','tolerate','withstand'],a:['quit','yield','surrender']},
  {w:'enrich',m:'to make richer',s:['improve','enhance','fortify'],a:['deplete','impoverish','drain']},
  {w:'exhaust',m:'to use up completely',s:['drain','deplete','consume'],a:['replenish','restore','conserve']},
  {w:'extract',m:'to pull out',s:['remove','draw','pull'],a:['insert','add','embed']},
  {w:'flourish',m:'to grow vigorously',s:['thrive','prosper','grow'],a:['decline','wither','fail']},
  {w:'foremost',m:'most prominent',s:['leading','first','chief'],a:['last','least','minor']},
  {w:'furnish',m:'to provide or equip',s:['provide','supply','equip'],a:['strip','remove','deprive']},
  {w:'grim',m:'serious and gloomy',s:['gloomy','somber','stern'],a:['cheerful','bright','merry']},
  {w:'grasp',m:'to hold firmly',s:['grip','clutch','seize'],a:['release','let go','drop']},
  {w:'hamper',m:'to hinder or impede',s:['hinder','impede','obstruct'],a:['help','assist','facilitate']},
  {w:'hinder',m:'to obstruct progress',s:['impede','obstruct','hamper'],a:['help','assist','facilitate']},
  {w:'hypothesis',m:'a proposed explanation',s:['theory','assumption','premise'],a:['fact','certainty','proof']},
  {w:'imminent',m:'about to happen',s:['impending','near','forthcoming'],a:['distant','remote','unlikely']},
  {w:'impart',m:'to give or share',s:['give','convey','transmit'],a:['withhold','keep','conceal']},
  {w:'incline',m:'to tend toward',s:['tend','lean','dispose'],a:['disinclined','averse']},
  {w:'induce',m:'to bring about',s:['cause','prompt','persuade'],a:['prevent','deter']},
  {w:'inherent',m:'existing as a natural part',s:['innate','intrinsic','essential'],a:['acquired','extrinsic','external']},
  {w:'intent',m:'a firm purpose',s:['purpose','aim','intention'],a:['hesitation','uncertainty']},
  {w:'intricate',m:'very complicated',s:['complex','complicated','elaborate'],a:['simple','plain','straightforward']},
  {w:'jeopardize',m:'to put at risk',s:['endanger','risk','threaten'],a:['protect','safeguard','secure']},
  {w:'linger',m:'to stay longer than needed',s:['wait','remain','loiter'],a:['leave','depart','hurry']},
  {w:'lucid',m:'easy to understand',s:['clear','clear-sighted','coherent'],a:['obscure','confused','murky']},
  {w:'magnitude',m:'great size or extent',s:['size','extent','importance'],a:['smallness','triviality']},
  {w:'manifest',m:'clear to the eye',s:['evident','obvious','clear'],a:['hidden','obscure','concealed']},
  {w:'merit',m:'the quality of being good',s:['value','worth','excellence'],a:['fault','demerit','flaw']},
  {w:'meticulous',m:'very careful',s:['careful','thorough','precise'],a:['careless','sloppy','negligent']},
  {w:'mitigate',m:'to make less severe',s:['alleviate','ease','lessen'],a:['worsen','aggravate','intensify']},
  {w:'notable',m:'worthy of attention',s:['remarkable','striking','eminent'],a:['ordinary','unremarkable','obscure']},
  {w:'notorious',m:'famous for something bad',s:['infamous','disreputable'],a:['respected','honored','esteemed']},
  {w:'obtain',m:'to get or acquire',s:['acquire','gain','procure'],a:['lose','forfeit']},
  {w:'opponent',m:'a person who competes',s:['rival','adversary','challenger'],a:['ally','supporter','partner']},
  {w:'optimum',m:'best or most favorable',s:['best','ideal','prime'],a:['worst','poorest']},
  {w:'plunge',m:'to fall quickly',s:['dive','drop','descend'],a:['rise','ascend','climb']},
  {w:'ponder',m:'to think carefully',s:['contemplate','reflect','consider'],a:['disregard','ignore','dismiss']},
  {w:'prevalent',m:'widespread',s:['common','widespread','ubiquitous'],a:['rare','uncommon','scarce']},
  {w:'profound',m:'very deep or intense',s:['deep','intense','thorough'],a:['shallow','superficial','trivial']},
  {w:'prohibit',m:'to forbid',s:['forbid','ban','outlaw'],a:['allow','permit','authorize']},
  {w:'prone',m:'likely to suffer',s:['liable','apt','inclined'],a:['unlikely','resistant']},
  {w:'propel',m:'to drive forward',s:['push','drive','thrust'],a:['pull','stop','restrain']},
  {w:'provoke',m:'to make angry',s:['anger','incite','annoy'],a:['soothe','calm','pacify']},
  {w:'reluctant',m:'unwilling',s:['unwilling','hesitant'],a:['willing','eager']},
  {w:'render',m:'to provide or cause',s:['provide','make','cause'],a:['withhold','take']},
  {w:'retrieve',m:'to get back',s:['recover','regain','fetch'],a:['lose','drop','abandon']},
  {w:'robust',m:'strong and healthy',s:['sturdy','strong','vigorous'],a:['weak','frail','delicate']},
  {w:'saturate',m:'to soak completely',s:['soak','drench','permeate'],a:['dry','drain','dehydrate']},
  {w:'scarce',m:'in short supply',s:['rare','insufficient','sparse'],a:['abundant','plentiful','common']},
  {w:'scrutinize',m:'to examine closely',s:['inspect','examine','analyze'],a:['skim','glance','ignore']},
  {w:'slack',m:'not tight or active',s:['loose','lax','lazy'],a:['tight','taut','diligent']},
  {w:'soar',m:'to rise high',s:['rise','ascend','climb'],a:['plunge','fall','drop']},
  {w:'sophisticated',m:'highly developed',s:['advanced','complex','refined'],a:['simple','crude','basic']},
  {w:'spur',m:'to encourage',s:['urge','stimulate','prompt'],a:['deter','discourage','hinder']},
  {w:'stability',m:'the state of being steady',s:['steadiness','firmness','balance'],a:['instability','unsteadiness']},
  {w:'stark',m:'severe or bare',s:['bare','severe','harsh'],a:['soft','mild','ornate']},
  {w:'steep',m:'rising sharply',s:['abrupt','sharp','high'],a:['gradual','gentle','low']},
  {w:'stifle',m:'to suppress',s:['suppress','smother','repress'],a:['encourage','foster','kindle']},
  {w:'striking',m:'attracting attention',s:['remarkable','notable','conspicuous'],a:['ordinary','unremarkable','plain']},
  {w:'tenacious',m:'holding firmly',s:['persistent','determined','stubborn'],a:['yielding','weak','irresolute']},
  {w:'thrive',m:'to grow well',s:['flourish','prosper','grow'],a:['wither','decline','fail']},
  {w:'torment',m:'severe suffering',s:['agony','torture','anguish'],a:['comfort','relief','ease']},
  {w:'tranquil',m:'calm and peaceful',s:['calm','peaceful','serene'],a:['agitated','turbulent','restless']},
  {w:'trivial',m:'of little importance',s:['minor','insignificant','petty'],a:['important','significant','vital']},
  {w:'turbulent',m:'disturbed and unstable',s:['agitated','stormy','unruly'],a:['calm','peaceful','tranquil']},
  {w:'verdict',m:'a formal decision',s:['decision','judgment','conclusion'],a:['uncertainty','doubt']},
  {w:'vivid',m:'bright and intense',s:['bright','vibrant','graphic'],a:['dull','pale','faint']},
  {w:'weary',m:'tired or exhausted',s:['tired','exhausted','fatigued'],a:['energetic','fresh','lively']},
  {w:'wither',m:'to dry up and decline',s:['shrivel','fade','decline'],a:['flourish','thrive','grow']},
  {w:'abstain',m:'to hold back from',s:['refrain','forbear','desist'],a:['indulge','partake','consume']},
  {w:'absurd',m:'utterly unreasonable',s:['ridiculous','preposterous','ludicrous'],a:['reasonable','sensible','rational']},
  {w:'abundant',m:'in large supply',s:['plentiful','ample'],a:['scarce','sparse']},
  {w:'accommodate',m:'to provide for',s:['lodge','adapt'],a:['displace','inconvenience']},
  {w:'accord',m:'agreement or harmony',s:['agreement','harmony','consent'],a:['discord','disagreement','conflict']},
  {w:'accumulate',m:'to build up',s:['amass','collect'],a:['disperse','scatter']},
  {w:'adequate',m:'sufficient',s:['enough','sufficient'],a:['insufficient','deficient']},
  {w:'adjacent',m:'nearby',s:['neighboring','adjoining'],a:['distant','remote']},
  {w:'advent',m:'the arrival of',s:['arrival','coming','approach'],a:['departure','exit','departure']},
  {w:'adverse',m:'unfavorable',s:['unfavorable','hostile'],a:['favorable','beneficial']},
  {w:'agony',m:'extreme pain',s:['torment','anguish','suffering'],a:['comfort','relief','ease']},
  {w:'allegiance',m:'loyalty',s:['loyalty','devotion','fidelity'],a:['betrayal','treachery','disloyalty']},
  {w:'allocate',m:'to distribute',s:['assign','allot'],a:['withhold','retain']},
  {w:'allude',m:'to refer indirectly',s:['hint','imply','suggest'],a:['state','declare','express']},
  {w:'ambiguous',m:'unclear',s:['vague','equivocal'],a:['clear','explicit']},
  {w:'analogy',m:'a comparison',s:['comparison','parallel','similarity'],a:['difference','contrast']},
  {w:'anomaly',m:'a deviation from the rule',s:['irregularity','abnormality','exception'],a:['norm','standard','regularity']},
  {w:'anonymous',m:'without a name',s:['unnamed','nameless','incognito'],a:['named','identified','known']},
  {w:'apathy',m:'lack of feeling',s:['indifference','unconcern','lethargy'],a:['enthusiasm','eagerness','concern']},
  {w:'appease',m:'to calm or satisfy',s:['pacify','placate','mollify'],a:['provoke','anger','irritate']},
  {w:'ardent',m:'showing strong feeling',s:['passionate','fervent','eager'],a:['indifferent','apathetic','cool']},
  {w:'arrogant',m:'having an exaggerated sense of importance',s:['haughty','conceited','proud'],a:['humble','modest','meek']},
  {w:'ascend',m:'to go up',s:['climb','rise'],a:['descend','fall']},
  {w:'astound',m:'to surprise greatly',s:['amaze','astonish','shock'],a:['expect','anticipate']},
  {w:'austere',m:'severe or strict',s:['strict','stern','severe'],a:['lenient','mild','indulgent']},
  {w:'authentic',m:'genuine',s:['genuine','real'],a:['fake','false']},
  {w:'barren',m:'unable to produce',s:['infertile','desolate','unproductive'],a:['fertile','productive','lush']},
  {w:'benevolent',m:'kind and generous',s:['kind','generous','charitable'],a:['malevolent','cruel','mean']},
  {w:'bewilder',m:'to confuse',s:['confuse','baffle','perplex'],a:['clarify','enlighten','explain']},
  {w:'boast',m:'to brag',s:['brag','show off','exaggerate'],a:['belittle','minimize','deprecate']},
  {w:'breach',m:'a violation',s:['violation','break','gap'],a:['observance','compliance','repair']},
  {w:'brevity',m:'shortness',s:['conciseness','brevity','terseness'],a:['lengthiness','verbosity','prolixity']},
  {w:'brisk',m:'quick and active',s:['lively','quick','spry'],a:['sluggish','slow','lethargic']},
  {w:'brutal',m:'cruelly violent',s:['savage','cruel','vicious'],a:['gentle','kind','mild']},
  {w:'bulk',m:'a large mass',s:['mass','size'],a:['fraction','portion']},
  {w:'capable',m:'able',s:['able','competent'],a:['incapable','unable']},
  {w:'captive',m:'held prisoner',s:['prisoner','confined','captive'],a:['free','liberated','independent']},
  {w:'cautious',m:'careful',s:['careful','wary','prudent'],a:['reckless','careless','rash']},
  {w:'censor',m:'to suppress objectionable parts',s:['suppress','expurgate','ban'],a:['permit','allow','approve']},
  {w:'chaste',m:'morally pure',s:['pure','virtuous','modest'],a:['impure','licentious','indecent']},
  {w:'coincide',m:'to happen together',s:['concur','synchronize'],a:['differ','clash']},
  {w:'collide',m:'to crash together',s:['crash','smash','clash'],a:['miss','avoid','separate']},
  {w:'commemorate',m:'to honor the memory of',s:['honor','memorialize','celebrate'],a:['forget','ignore','neglect']},
  {w:'compact',m:'closely packed',s:['condensed','compressed','dense'],a:['loose','scattered','expanded']},
  {w:'comply',m:'to obey',s:['obey','conform'],a:['disobey','resist']},
  {w:'conceal',m:'to hide',s:['hide','cover'],a:['reveal','expose']},
  {w:'concise',m:'short and clear',s:['brief','terse','succinct'],a:['lengthy','verbose','prolix']},
  {w:'confer',m:'to discuss or grant',s:['consult','discuss','bestow'],a:['withdraw','refuse','retract']},
  {w:'conform',m:'to comply',s:['comply','obey'],a:['disobey','deviate']},
  {w:'confront',m:'to face boldly',s:['face','encounter'],a:['avoid','evade']},
  {w:'congenial',m:'pleasant and agreeable',s:['agreeable','pleasant','compatible'],a:['disagreeable','unpleasant','hostile']},
  {w:'conscientious',m:'thorough and careful',s:['diligent','meticulous','careful'],a:['careless','negligent','sloppy']},
  {w:'consensus',m:'general agreement',s:['agreement','accord','unanimity'],a:['disagreement','division','discord']},
  {w:'contempt',m:'disdain',s:['scorn','disdain','disgust'],a:['respect','esteem','admiration']},
  {w:'controversy',m:'a dispute',s:['dispute','debate'],a:['agreement','consensus']},
  {w:'copious',m:'abundant',s:['abundant','plentiful','profuse'],a:['scarce','meager','sparse']},
  {w:'corroborate',m:'to confirm with evidence',s:['confirm','verify','support'],a:['contradict','refute','disprove']},
  {w:'credible',m:'believable',s:['believable','plausible','trustworthy'],a:['incredible','implausible','dubious']},
  {w:'culminate',m:'to reach a climax',s:['climax','conclude','end'],a:['begin','start','commence']},
  {w:'curtail',m:'to cut short',s:['shorten','reduce','cut'],a:['extend','lengthen','expand']},
  {w:'dearth',m:'a scarcity',s:['scarcity','lack','shortage'],a:['abundance','plenty','surplus']},
  {w:'debris',m:'scattered fragments',s:['rubble','wreckage','fragments'],a:[]},
  {w:'deceit',m:'the act of misleading',s:['deception','dishonesty','fraud'],a:['honesty','truth','sincerity']},
  {w:'defer',m:'to put off',s:['postpone','delay','suspend'],a:['advance','expedite','hasten']},
  {w:'defiance',m:'open resistance',s:['resistance','rebellion','defiance'],a:['compliance','submission','obedience']},
  {w:'deficient',m:'lacking',s:['insufficient','inadequate','lacking'],a:['sufficient','adequate','abundant']},
  {w:'deluge',m:'a great flood',s:['flood','inundation','torrent'],a:['drought','dryness','scarcity']},
  {w:'demonstrate',m:'to show',s:['show','display'],a:['conceal','hide']},
  {w:'deplete',m:'to use up',s:['exhaust','drain','consume'],a:['replenish','restore','fill']},
  {w:'deprive',m:'to take away',s:['strip','rob','dispossess'],a:['provide','give','supply']},
  {w:'desolate',m:'empty and sad',s:['barren','deserted','bleak'],a:['populated','lively','cheerful']},
  {w:'destined',m:'bound for a certain fate',s:['fated','doomed','bound'],a:['free','unbound','random']},
  {w:'deteriorate',m:'to become worse',s:['worsen','decline','degrade'],a:['improve','recover','mend']},
  {w:'devise',m:'to invent',s:['invent','design','contrive'],a:['copy','imitate']},
  {w:'diffuse',m:'spread over a wide area',s:['spread','disperse','scatter'],a:['concentrate','gather','focus']},
  {w:'diligent',m:'hardworking',s:['industrious','hardworking','assiduous'],a:['lazy','idle','indolent']},
  {w:'discard',m:'to throw away',s:['dispose of','reject','junk'],a:['keep','retain','preserve']},
  {w:'disclose',m:'to reveal',s:['reveal','uncover','expose'],a:['conceal','hide','cover']},
  {w:'discrepancy',m:'a lack of compatibility',s:['difference','disparity','inconsistency'],a:['agreement','consistency','harmony']},
  {w:'disdain',m:'to scorn',s:['scorn','despise','contemn'],a:['respect','admire','esteem']},
  {w:'dismantle',m:'to take apart',s:['disassemble','take apart','demolish'],a:['assemble','construct','build']},
  {w:'disperse',m:'to scatter',s:['scatter','diffuse','disseminate'],a:['gather','collect','assemble']},
  {w:'disrupt',m:'to interrupt',s:['interrupt','disturb','upset'],a:['order','calm','stabilize']},
  {w:'distort',m:'to twist out of shape',s:['deform','twist','misrepresent'],a:['straighten','accurate','represent']},
  {w:'divert',m:'to redirect',s:['redirect','deflect','distract'],a:['direct','focus','concentrate']},
  {w:'doctrine',m:'a set of beliefs',s:['teaching','belief','creed'],a:['heresy','dissent','unbelief']},
  {w:'dormant',m:'inactive',s:['inactive','sleeping','latent'],a:['active','awake','busy']},
  {w:'dubious',m:'doubtful',s:['doubtful','questionable','uncertain'],a:['certain','sure','confident']}
];

// Index helpers
const MEANINGS = WB.map(x => x.m);
const WORDS = WB.map(x => x.w);
// Build a quick synonym/antonym pool
const SYN_POOL = WB.filter(x => x.s && x.s.length);
const ANT_POOL = WB.filter(x => x.a && x.a.length);

function randMeaning(exclude) {
  let m;
  let tries = 0;
  do { m = pick(MEANINGS); tries++; } while (m === exclude && tries < 50);
  return m;
}
function randWord(exclude) {
  let w; let tries = 0;
  do { w = pick(WORDS); tries++; } while (exclude.includes(w) && tries < 50);
  return w;
}

// ============================================================
// MODULE 1: 词汇 Vocabulary (350 questions)
// ============================================================
function genVocab() {
  const ch = '词汇';

  // 1a. Word meaning (cycle through word bank) -> 200
  let order = shuffle([...WB]);
  let countMeaning = 0;
  for (let i = 0; i < order.length && countMeaning < 200; i++) {
    let e = order[i];
    let d = ri(1, 3);
    let wrongs = [];
    while (wrongs.length < 3) {
      let w = randMeaning(e.m);
      if (!wrongs.includes(w)) wrongs.push(w);
    }
    let { o, a } = mk(e.m, wrongs);
    add(ch, 'single', `The word "${e.w}" most nearly means:`, o, a, `"${e.w}" 意为 ${e.m}。`, d);
    countMeaning++;
  }

  // 1b. Synonym (closest in meaning) -> 90
  let synOrder = shuffle([...SYN_POOL]);
  let countSyn = 0;
  for (let i = 0; i < synOrder.length && countSyn < 90; i++) {
    let e = synOrder[i];
    if (!e.s || e.s.length === 0) continue;
    let correct = pick(e.s);
    let wrongs = [];
    let guard = new Set(e.s);
    while (wrongs.length < 3) {
      let w = randWord([...guard, correct]);
      if (!wrongs.includes(w) && !guard.has(w)) wrongs.push(w);
    }
    let d = ri(2, 3);
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Which of the following is closest in meaning to "${e.w}"?`, o, a, `"${correct}" 与 "${e.w}" 意义最接近。`, d);
    countSyn++;
  }

  // 1c. Antonym (opposite of) -> 50
  let antOrder = shuffle([...ANT_POOL]);
  let countAnt = 0;
  for (let i = 0; i < antOrder.length && countAnt < 50; i++) {
    let e = antOrder[i];
    if (!e.a || e.a.length === 0) continue;
    let correct = pick(e.a);
    let wrongs = [];
    let guard = new Set(e.a);
    while (wrongs.length < 3) {
      let w = randWord([...guard, correct]);
      if (!wrongs.includes(w) && !guard.has(w)) wrongs.push(w);
    }
    let d = ri(2, 3);
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Which of the following is the opposite of "${e.w}"?`, o, a, `"${correct}" 是 "${e.w}" 的反义词。`, d);
    countAnt++;
  }

  // 1d. Word formation (prefix / suffix / root) -> curated 10
  const wfData = [
    {q:'The prefix "un-" in "unusual" means:',c:'not',w:['again','before','very'],e:'un- 表示否定，意为 not。'},
    {q:'The prefix "re-" in "rebuild" means:',c:'again',w:['not','against','between'],e:'re- 表示 again（再）。'},
    {q:'The prefix "pre-" in "preview" means:',c:'before',w:['after','against','not'],e:'pre- 表示 before（在……之前）。'},
    {q:'The prefix "mis-" in "misunderstand" means:',c:'wrongly',w:['again','very','before'],e:'mis- 表示 wrongly（错误地）。'},
    {q:'The suffix "-able" in "readable" means:',c:'capable of being',w:['without','full of','one who'],e:'-able 表示 capable of being（能够……的）。'},
    {q:'The suffix "-less" in "careless" means:',c:'without',w:['full of','capable of','one who'],e:'-less 表示 without（没有）。'},
    {q:'The suffix "-er" in "teacher" means:',c:'one who does',w:['without','state of','full of'],e:'-er 表示 one who does（做……的人）。'},
    {q:'The suffix "-tion" in "education" means:',c:'the act or state of',w:['one who does','without','capable of'],e:'-tion 构成名词，表示 the act or state of。'},
    {q:'The root "dict" in "predict" relates to:',c:'saying or speaking',w:['writing','carrying','leading'],e:'词根 dict 意为 say/speak（说）。'},
    {q:'The root "port" in "transport" relates to:',c:'carrying',w:['writing','seeing','saying'],e:'词根 port 意为 carry（搬运）。'}
  ];
  wfData.forEach(d => {
    let { o, a } = mk(d.c, d.w);
    add(ch, 'single', d.q, o, a, d.e, 2);
  });
}

// ====== (more modules appended below) ======

// ============================================================
// MODULE 2: 语法 Grammar (200+ questions)
// ============================================================
function genGrammar() {
  const ch = '语法';

  // ---- 2a. Tense (templated, 32) ----
  const fpVerbs = [['work','worked'],['study','studied'],['live','lived'],['teach','taught'],['write','written'],['manage','managed'],['serve','served'],['design','designed']];
  const fpSubj = ['she','he','the company','Professor Lee','they','Maria','the team','Mr. Brown'];
  const fpTime = ['December','year','summer','June','spring','month','autumn','term'];
  const fpNum = ['five','ten','three','seven','six','eight','four','twelve'];
  const fpPlace = ['here','there','at the firm','in Beijing','abroad','in the lab','with us','on the project'];
  for (let i = 0; i < 8; i++) {
    let [base, pp] = fpVerbs[i];
    let subj = fpSubj[i];
    let correct = `will have ${pp}`;
    let wrongs = [`has ${pp}`, `will ${base}`, `${base}s`];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Choose the correct tense: By next ${fpTime[i]}, ${subj} ___ ${fpPlace[i]} for ${fpNum[i]} years.`, o, a, `By next + 时间段，表示到将来某时为止完成的事，用将来完成时 will have + 过去分词。`, 2);
  }

  // past continuous (8)
  const pcData = [['I','was','cook','cooked','cooking'],['he','was','read','read','reading'],['she','was','watch','watched','watching'],['they','were','clean','cleaned','cleaning'],['we','were','study','studied','studying'],['John','was','paint','painted','painting'],['Mary','was','type','typed','typing'],['the children','were','play','played','playing']];
  for (let i = 0; i < 8; i++) {
    let [subj, be, base, past, ing] = pcData[i];
    let correct = `${be} ${ing}`;
    let wrongs = [past, `is ${ing}`, `${base}s`];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Choose the correct tense: When the lights went out, ${subj} ___ dinner.`, o, a, `表示过去某时刻正在进行的动作，用过去进行时 ${be} + doing。`, 1);
  }

  // present perfect (8)
  const ppData = [['She','finish','finished','three reports'],['He','visit','visited','five countries'],['They','complete','completed','the project'],['Maria','write','written','two novels'],['We','repair','repaired','six machines'],['The team','win','won','four matches'],['He','read','read','ten books'],['She','collect','collected','many stamps']];
  for (let i = 0; i < 8; i++) {
    let [subj, base, past, obj] = ppData[i];
    let has = (subj === 'They' || subj === 'We' || subj === 'The team') ? 'have' : 'has';
    let correct = `${has} ${past}`;
    let wrongs = [`${base}s`, `had ${past}`, `is ${base}ing`];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Choose the correct tense: ${subj} ___ ${obj} so far.`, o, a, `"so far" 常与现在完成时连用：${has} + 过去分词。`, 1);
  }

  // past perfect (8)
  const pastpData = [['the show','end','ended'],['the train','leave','left'],['the meeting','finish','finished'],['the guests','arrive','arrived'],['the rain','stop','stopped'],['the play','begin','begun'],['the cake','disappear','disappeared'],['the sun','set','set']];
  for (let i = 0; i < 8; i++) {
    let [subj, base, past] = pastpData[i];
    let be = (subj === 'the guests') ? 'had' : 'had';
    let correct = `had ${past}`;
    let wrongs = [`has ${past}`, `${base}d`, `was ${base}ing`];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Choose the correct tense: By the time we arrived, ${subj} ___ already.`, o, a, `"by the time + 过去时" 主句用过去完成时 had + 过去分词。`, 2);
  }

  // ---- 2b. Prepositions (curated, 32) ----
  const prepData = [
    ['He is interested ___ music.','in',['at','on','to'],"固定搭配 be interested in。"],
    ['She is good ___ math.','at',['in','for','on'],"be good at 擅长。"],
    ['The child is afraid ___ the dark.','of',['from','at','with'],"be afraid of 害怕。"],
    ['Hangzhou is famous ___ West Lake.','for',['of','with','by'],"be famous for 因……著名。"],
    ['She is proud ___ her son.','of',['for','at','in'],"be proud of 为……自豪。"],
    ['He is capable ___ doing the job.','of',['for','at','to'],"be capable of 能够。"],
    ['The man was found guilty ___ the crime.','of',['for','with','at'],"be guilty of 有……罪。"],
    ['I am tired ___ doing the same thing.','of',['from','with','for'],"be tired of 厌倦。"],
    ['The hall was full ___ people.','of',['with','by','from'],"be full of 充满。"],
    ['We are short ___ funds.','of',['in','with','for'],"be short of 缺少。"],
    ['Are you aware ___ the problem?','of',['about','on','to'],"be aware of 意识到。"],
    ['She is keen ___ tennis.','on',['at','in','for'],"be keen on 热衷于。"],
    ['Children depend ___ their parents.','on',['of','in','at'],"depend on 依赖。"],
    ['You can rely ___ me.','on',['in','at','of'],"rely on 依靠。"],
    ['Please concentrate ___ your work.','on',['at','in','to'],"concentrate on 专注。"],
    ['He insisted ___ paying the bill.','on',['about','for','at'],"insist on 坚持。"],
    ['She succeeded ___ passing the exam.','in',['at','on','for'],"succeed in 在……成功。"],
    ['Many people participated ___ the survey.','in',['at','on','for'],"participate in 参加。"],
    ['Water consists ___ hydrogen and oxygen.','of',['in','with','from'],"consist of 由……组成。"],
    ['They complained ___ the noise.','about',['on','for','at'],"complain about 抱怨。"],
    ['I look forward ___ hearing from you.','to',['for','at','on'],"look forward to + doing。"],
    ['She objected ___ the proposal.','to',['against','for','on'],"object to 反对。"],
    ['He is used ___ getting up early.','to',['for','at','in'],"be used to + doing 习惯于。"],
    ['Instead ___ giving up, he tried again.','of',['for','to','from'],"instead of 而不是。"],
    ['The book belongs ___ the library.','to',['of','for','with'],"belong to 属于。"],
    ['Please apply ___ the job in writing.','for',['to','on','at'],"apply for 申请。"],
    ['We must protect children ___ harm.','from',['of','against','to'],"protect from 保护免受。"],
    ['The medicine will cure you ___ your cough.','of',['from','for','off'],"cure sb of sth 治愈。"],
    ['He was accused ___ theft.','of',['for','with','at'],"be accused of 被控告。"],
    ['Can you translate this ___ English?','into',['to','in','for'],"translate into 译成。"],
    ['The result ___ his carelessness.','from',['of','in','for'],"result from 起因于。"],
    ['His failure resulted ___ his laziness.','from',['in','to','of'],"result from 由……导致。"]
  ];
  prepData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Fill in the blank: ${q}`, o, a, e, 1);
  });

  // ---- 2c. Conjunctions (curated, 28) ----
  const conjData = [
    ['___ it was raining, we went out for a walk.','Although',['Because','Since','Unless'],"让步状语从句用 Although 尽管。"],
    ['He worked hard ___ he could pass the exam.','so that',['in order','because','although'],"so that 以便，表目的。"],
    ['___ you study hard, you will fail the exam.','Unless',['Because','Although','If'],"Unless = if not 除非。"],
    ['I will go ___ the weather is fine.','provided that',['even though','as if','unless'],"provided that 只要，表条件。"],
    ['He was tired, ___ he kept working.','yet',['so','because','since'],"yet 然而，表转折。"],
    ['She speaks English ___ she speaks French.','and',['but','or','so'],"and 表并列。"],
    ['Hurry up, ___ you will miss the bus.','or',['and','but','so'],"or 否则。"],
    ['___ he is poor, he is honest.','Although',['Because','Since','When'],"Although 尽管。"],
    ['I did not go out ___ it was too cold.','because',['although','unless','so that'],"because 因为。"],
    ['___ I was ill, I did not go to school.','Since',['Although','Unless','So that'],"Since 既然/因为。"],
    ['Take an umbrella ___ it rains.','in case',['because','although','unless'],"in case 以防。"],
    ['___ you call me, I will come.','If',['Although','Unless','Since'],"If 如果。"],
    ['He left early ___ he could catch the train.','so that',['because','although','unless'],"so that 以便。"],
    ['___ the rain, the match continued.','Despite',['Although','Because','Since'],"Despite + 名词，尽管。"],
    ['I like tea ___ my brother likes coffee.','while',['because','so','unless'],"while 而，表对比。"],
    ['___ you try, you will never succeed.','Unless',['If','Because','Although'],"Unless 除非。"],
    ['He spoke quietly ___ no one could hear.','so that',['because','although','unless'],"so that 以便。"],
    ['___ the cost, the plan is good.','In spite of',['Although','Because','Since'],"In spite of + 名词。"],
    ['You can stay here ___ you keep quiet.','as long as',['even though','as if','unless'],"as long as 只要。"],
    ['___ I know, he is honest.','As far as',['As soon as','As long as','As well as'],"As far as I know 据我所知。"],
    ['___ he had no money, he could not buy it.','Since',['Although','Unless','So that'],"Since 既然。"],
    ['The book is interesting, ___ it is too long.','but',['and','so','or'],"but 但是，表转折。"],
    ['___ you are here, please help me.','Since',['Although','Unless','So that'],"Since 既然。"],
    ['He ran fast ___ he might catch the train.','so that',['because','although','unless'],"so that 以便。"],
    ['___ the weather was bad, we canceled the trip.','Because',['Although','Unless','If'],"Because 因为。"],
    ['I will wait ___ you come back.','until',['because','although','unless'],"until 直到。"],
    ['She sings ___ she dances.','as well as',['as soon as','as long as','as far as'],"as well as 也，并列。"],
    ['___ I arrived, the phone rang.','As soon as',['As far as','As long as','As well as'],"As soon as 一……就。"]
  ];
  conjData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Choose the best conjunction: ${q}`, o, a, e, 2);
  });

  // ---- 2d. Articles (curated, 28) ----
  const artData = [
    ['___ sun rises in ___ east.','The, the',['A, the','The, a','A, a'],"独一无二事物用 the，方位前用 the。"],
    ['He is ___ honest man.','an',['a','the','no'],"honest 中 h 不发音，以元音音素开头用 an。"],
    ['She is ___ university student.','a',['an','the','no'],"university 以辅音音素 /j/ 开头用 a。"],
    ['I saw ___ elephant at the zoo.','an',['a','the','no'],"elephant 以元音音素开头用 an。"],
    ['___ apple a day keeps the doctor away.','An',['A','The','No'],"apple 元音开头用 An。"],
    ['He plays ___ piano very well.','the',['a','an','no'],"乐器前用 the。"],
    ['She has ___ umbrella.','an',['a','the','no'],"umbrella 元音开头用 an。"],
    ['___ Nile is the longest river in Africa.','The',['A','An','No'],"河流名前用 the。"],
    ['I bought ___ book and ___ pen. ___ book is interesting.','a, a, The',['the, a, A','a, the, The','an, a, The'],"首次提到用 a/an，再次提到用 the。"],
    ['She is ___ best player on the team.','the',['a','an','no'],"最高级前用 the。"],
    ['He is ___ MBA student.','an',['a','the','no'],"M 发音 /em/ 以元音开头用 an。"],
    ['___ Himalayas are the highest mountains.','The',['A','An','No'],"山脉名复数前用 the。"],
    ['I love ___ music.','no article',['a','an','the'],"music 为不可数名词泛指，零冠词。"],
    ['She is ___ doctor.','a',['an','the','no'],"职业单数可数用 a。"],
    ['___ Smiths are coming to dinner.','The',['A','An','No'],"姓氏复数前用 the 表一家人。"],
    ['He goes to ___ school every day.','no article',['a','an','the'],"go to school 表上学，零冠词。"],
    ['He was sent to ___ prison for theft.','no article',['a','an','the'],"go to prison 表入狱（用途），零冠词。"],
    ['___ Earth goes around ___ Sun.','The, the',['A, a','The, a','A, the'],"独一无二天体用 the。"],
    ['I have ___ one-hour lunch break.','a',['an','the','no'],"one-hour 以辅音 /w/ 开头用 a。"],
    ['She is ___ European citizen.','a',['an','the','no'],"European 以辅音音素 /j/ 开头用 a。"],
    ['He is reading ___ Bible.','the',['a','an','no'],"圣经等独一文档前用 the。"],
    ['___ rich are not always happy.','The',['A','An','No'],"the + 形容词表一类人。"],
    ['I bought ___ pair of shoes.','a',['an','the','no'],"pair 以辅音开头用 a。"],
    ['He is ___ MP (Member of Parliament).','an',['a','the','no'],"M 发音 /em/ 元音开头用 an。"],
    ['___ life is short.','No article',['A','An','The'],"抽象名词泛指用零冠词。"],
    ['She hit him in ___ face.','the',['a','an','no'],"hit sb in the face 固定结构。"],
    ['We live in ___ United States.','the',['a','an','no'],"由普通名词构成的国名全称前用 the。"],
    ['He is ___ taller of the two brothers.','the',['a','an','no'],"the + 比较级 of the two。"]
  ];
  artData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Choose the correct article: ${q}`, o, a, e, 2);
  });

  // ---- 2e. Relative clauses (curated, 24) ----
  const relData = [
    ['The man ___ you met yesterday is my teacher.','whom',['which','whose','when'],"先行词为人作宾语用 whom。"],
    ['This is the book ___ I bought last week.','that',['who','whose','when'],"先行词为物用 that/which。"],
    ['The girl ___ hair is long is my sister.','whose',['who','which','whom'],"表所属关系用 whose。"],
    ['I remember the day ___ we first met.','when',['which','who','whose'],"先行词为时间在从句中作状语用 when。"],
    ['This is the city ___ I was born.','where',['which','who','whose'],"先行词为地点作状语用 where。"],
    ['The reason ___ he left is unknown.','why',['which','who','whose'],"先行词为 reason 用 why。"],
    ['The teacher ___ teaches us English is very kind.','who',['which','whose','whom'],"先行词为人作主语用 who。"],
    ['The car ___ engine broke down is mine.','whose',['which','who','whom'],"表所属用 whose。"],
    ['He is the boy ___ won the prize.','who',['which','whose','whom'],"人作主语用 who。"],
    ['The house ___ we live is very old.','where',['which','who','whose'],"地点作状语用 where（= in which）。"],
    ['I will never forget the day ___ I graduated.','when',['which','who','whose'],"时间作状语用 when。"],
    ['The novel ___ you lent me is fascinating.','that',['who','whose','when'],"物作宾语用 that。"],
    ['She is the woman ___ I saw at the party.','whom',['which','whose','when'],"人作宾语用 whom。"],
    ['This is the school ___ I studied for three years.','where',['which','who','whose'],"地点作状语用 where。"],
    ['The man ___ car was stolen is my neighbor.','whose',['who','which','whom'],"所属关系用 whose。"],
    ['Do you know the reason ___ he was late?','why',['which','who','whose'],"reason 用 why。"],
    ['The students ___ work hard will succeed.','who',['which','whose','whom'],"人作主语用 who。"],
    ['I visited the museum ___ displays ancient art.','which',['who','whose','when'],"物作主语用 which。"],
    ['The moment ___ he entered, everyone cheered.','when',['which','who','whose'],"时间作状语用 when。"],
    ['Anyone ___ wants to join should sign up here.','who',['which','whose','whom'],"人作主语用 who。"],
    ['The book the cover ___ is red is mine.','of which',['whose','which','who'],"of which 表所属（物）。"],
    ['This is the village ___ Shakespeare was born.','where',['which','who','whose'],"地点作状语用 where。"],
    ['He is the only one of the students who ___ passed.','has',['have','is','are'],"the only one 作主语，从句谓语用单数 has。"],
    ['I have a friend ___ father is a pilot.','whose',['who','which','whom'],"所属关系用 whose。"]
  ];
  relData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Which word correctly completes the sentence: ${q}`, o, a, e, 2);
  });

  // ---- 2f. Passive voice (templated + curated, 24) ----
  const passData = [
    ['They built the bridge in 1990.','The bridge was built in 1990.',['The bridge is built in 1990.','The bridge built in 1990.','The bridge has built in 1990.'],"一般过去时被动 was/were + 过去分词。"],
    ['People speak English all over the world.','English is spoken all over the world.',['English speaks all over the world.','English was spoken all over the world.','English is speaking all over the world.'],"一般现在时被动 is/am/are + 过去分词。"],
    ['Someone has stolen my bike.','My bike has been stolen.',['My bike was stolen.','My bike is stolen.','My bike stole.'],"现在完成时被动 has/have been + 过去分词。"],
    ['They are building a new school.','A new school is being built.',['A new school is built.','A new school was being built.','A new school builds.'],"现在进行时被动 is/am/are being + 过去分词。"],
    ['We will finish the project next week.','The project will be finished next week.',['The project will finish next week.','The project is finished next week.','The project was finished next week.'],"一般将来时被动 will be + 过去分词。"],
    ['They had completed the work before noon.','The work had been completed before noon.',['The work has been completed before noon.','The work was completed before noon.','The work had completed before noon.'],"过去完成时被动 had been + 过去分词。"],
    ['They cancel the meeting every year.','The meeting is cancelled every year.',['The meeting cancels every year.','The meeting was cancelled every year.','The meeting is canceling every year.'],"一般现在时被动。"],
    ['They were repairing the road.','The road was being repaired.',['The road was repaired.','The road is being repaired.','The road repaired.'],"过去进行时被动 was/were being + 过去分词。"],
    ['People can use this tool freely.','This tool can be used freely.',['This tool can used freely.','This tool is can used freely.','This tool can be use freely.'],"情态动词被动 can be + 过去分词。"],
    ['They have published the results.','The results have been published.',['The results have published.','The results were published.','The results are published.'],"现在完成时被动。"],
    ['They will invite fifty guests.','Fifty guests will be invited.',['Fifty guests will invite.','Fifty guests are invited.','Fifty guests were invited.'],"将来时被动。"],
    ['They clean the rooms daily.','The rooms are cleaned daily.',['The rooms clean daily.','The rooms were cleaned daily.','The rooms are cleaning daily.'],"一般现在时被动。"],
    ['They are testing the new system.','The new system is being tested.',['The new system is tested.','The new system was being tested.','The new system tests.'],"现在进行时被动。"],
    ['They wrote the report yesterday.','The report was written yesterday.',['The report is written yesterday.','The report wrote yesterday.','The report has written yesterday.'],"一般过去时被动。"],
    ['They must do the task carefully.','The task must be done carefully.',['The task must done carefully.','The task must be do carefully.','The task must doing carefully.'],"情态被动 must be + 过去分词。"],
    ['They had shipped the goods.','The goods had been shipped.',['The goods have been shipped.','The goods were shipped.','The goods had shipped.'],"过去完成时被动。"],
    ['They will hold the conference in May.','The conference will be held in May.',['The conference will hold in May.','The conference is held in May.','The conference was held in May.'],"将来时被动。"],
    ['They are developing the software.','The software is being developed.',['The software is developed.','The software was being developed.','The software develops.'],"现在进行时被动。"],
    ['They have awarded him a scholarship.','He has been awarded a scholarship.',['He has awarded a scholarship.','He was awarded a scholarship.','He is awarded a scholarship.'],"双宾被动。"],
    ['They expect us to attend.','We are expected to attend.',['We expect to attend.','We were expected to attend.','We are expecting to attend.'],"宾补结构被动。"],
    ['They found the lost child.','The lost child was found.',['The lost child is found.','The lost child found.','The lost child has found.'],"一般过去时被动。"],
    ['They will announce the winner soon.','The winner will be announced soon.',['The winner will announce soon.','The winner is announced soon.','The winner was announced soon.'],"将来时被动。"],
    ['They make these shoes in Italy.','These shoes are made in Italy.',['These shoes make in Italy.','These shoes were made in Italy.','These shoes are making in Italy.'],"一般现在时被动。"],
    ['They should complete the form.','The form should be completed.',['The form should complete.','The form is should completed.','The form should completed.'],"情态被动。"]
  ];
  passData.forEach(d => {
    let [stem, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Choose the correct passive form of: "${stem}"`, o, a, e, 2);
  });

  // ---- 2g. Subjunctive mood (curated, 22) ----
  const subData = [
    ['If I ___ you, I would accept the offer.','were',['was','am','be'],"虚拟语气与现在事实相反，be 用 were。"],
    ['If I ___ a millionaire, I would travel the world.','were',['was','am','is'],"与现在事实相反用 were。"],
    ['I wish I ___ taller.','were',['was','am','be'],"wish 后与现在相反用 were。"],
    ['If he ___ harder, he would have passed.','had studied',['studied','studies','would study'],"与过去事实相反用 had + 过去分词。"],
    ['If she had left earlier, she ___ the train.','would have caught',['would catch','caught','had caught'],"主句与过去相反用 would have + 过去分词。"],
    ['It is essential that he ___ on time.','be',['is','was','were'],"essential that + 主语 + (should) + 动词原形。"],
    ['The teacher insisted that every student ___ the homework.','complete',['completes','completed','completing'],"insist that + (should) + 原形。"],
    ['I suggest that he ___ a doctor.','see',['sees','saw','seeing'],"suggest that + (should) + 原形。"],
    ['It is important that she ___ the truth.','know',['knows','knew','knowing'],"important that + (should) + 原形。"],
    ['He ordered that the work ___ at once.','be started',['is started','was started','starting'],"order that + (should) + 原形被动。"],
    ['If I ___ known, I would have helped.','had',['have','was','did'],"与过去相反条件句用 had + 过去分词。"],
    ['Were I ___ you, I would not do that.','in',['at','on','for'],"倒装虚拟 Were I you = If I were you。"],
    ['Had he ___ the truth, he would have spoken.','known',['know','knows','knowing'],"倒装 Had he known = If he had known。"],
    ['It is necessary that the report ___ finished today.','be',['is','was','being'],"necessary that + (should) + 原形。"],
    ['I wish I ___ how to swim.','knew',['know','knows','had known'],"wish 与现在相反用过去式。"],
    ['She talks as if she ___ everything.','knew',['knows','know','had known'],"as if 与现在相反用过去式。"],
    ['If it ___ rain tomorrow, we would stay home.','were to',['will','would','is to'],"与将来相反可用 were to + 动词原形。"],
    ['The committee recommended that the plan ___ adopted.','be',['is','was','being'],"recommend that + (should) + 原形。"],
    ['I would rather you ___ now.','left',['leave','leaving','to leave'],"would rather + 从句用过去式表现在。"],
    ['It is high time we ___ home.','went',['go','going','goes'],"It is high time + 过去式。"],
    ['If only I ___ younger!','were',['was','am','be'],"If only 与现在相反用 were。"],
    ['The law requires that everyone ___ a seat belt.','wear',['wears','wore','wearing'],"require that + (should) + 原形。"]
  ];
  subData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Choose the correct form: ${q}`, o, a, e, 3);
  });

  // ---- 2h. Inversion (curated, 16) ----
  const invData = [
    ['Not only ___ late, but also he forgot the tickets.','was he',['he was','he is','is he'],"Not only 置于句首引起部分倒装。"],
    ['Never ___ such a beautiful sunset.','have I seen',['I have seen','I saw','did I saw'],"Never 置于句首倒装。"],
    ['Hardly ___ when the phone rang.','had I arrived',['I had arrived','I arrived','did I arrive'],"Hardly...when 倒装。"],
    ['Seldom ___ to the cinema these days.','does he go',['he goes','he does go','goes he'],"Seldom 置于句首倒装。"],
    ['Little ___ that he was being watched.','did he know',['he knew','he did know','knew he'],"Little 置于句首倒装。"],
    ['No sooner ___ than the bell rang.','had he sat down',['he had sat down','he sat down','did he sat down'],"No sooner...than 倒装。"],
    ['Only by working hard ___ your goals.','can you achieve',['you can achieve','you achieve','achieve you'],"Only + 状语置于句首倒装。"],
    ['Only when he arrived ___ the truth.','did we learn',['we learned','we did learn','learned we'],"Only when 倒装。"],
    ['Not until midnight ___ the report.','did he finish',['he finished','he did finish','finished he'],"Not until 倒装。"],
    ['Under no circumstances ___ the door.','should you open',['you should open','you open','open you'],"Under no circumstances 倒装。"],
    ['Never before ___ such an exhibition.','had I visited',['I had visited','I visited','did I visited'],"Never before 倒装。"],
    ['Rarely ___ a more talented musician.','have I seen',['I have seen','I saw','did I saw'],"Rarely 倒装。"],
    ['So difficult ___ that few passed the exam.','was the test',['the test was','the test is','is the test'],"So + 形容词置首倒装。"],
    ['Not only ___ English, but also French.','does she speak',['she speaks','she does speak','speaks she'],"Not only 倒装。"],
    ['At no time ___ the rules.','did he break',['he broke','he did break','broke he'],"At no time 倒装。"],
    ['Only in this way ___ the problem.','can we solve',['we can solve','we solve','solve we'],"Only in this way 倒装。"]
  ];
  invData.forEach(d => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', `Complete the inverted sentence: ${q}`, o, a, e, 3);
  });

  // ---- 2i. Non-finite verbs (templated, 16) ----
  const gerundVerbs = [
    ['enjoy','swimming'],['avoid','making'],['finish','reading'],['mind','opening'],
    ['suggest','going'],['consider','changing'],['postpone','doing'],['deny','taking']
  ];
  gerundVerbs.forEach((g, i) => {
    let [verb, word] = g;
    let correct = word;
    let wrongs = [`to ${word.replace(/ing$/,'')}`, word.replace(/ing$/,''), `${word.replace(/ing$/,'')}s`];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Fill in the blank: I ${verb} ___ every morning.`, o, a, `${verb} 后接动名词（-ing 形式）。`, 2);
  });
  const infVerbs = [
    ['decided','go'],['want','stay'],['hope','travel'],['agreed','help'],
    ['plan','visit'],['refused','cooperate'],['learn','drive'],['promised','come']
  ];
  infVerbs.forEach(g => {
    let [verb, word] = g;
    let correct = `to ${word}`;
    let wrongs = [`${word}ing`, `${word}s`, word.replace(/e$/,'')+'ed'];
    let { o, a } = mk(correct, wrongs);
    add(ch, 'single', `Fill in the blank: He ${verb} ___ tomorrow.`, o, a, `${verb} 后接不定式 to do。`, 2);
  });
}

// ============================================================
// MODULE 3: 完形填空 Cloze (150 questions)
// ============================================================
function genCloze() {
  const ch = '完形填空';

  // ---- 3a. Logic / transition words (90) ----
  const logicData = [
    ['It was raining heavily; ___, we decided to go hiking.','however',['therefore','moreover','besides'],"前后转折，用 however 然而。"],
    ['The test was difficult; ___, most students passed.','nevertheless',['therefore','consequently','besides'],"困难与通过形成转折，用 nevertheless。"],
    ['He is rich; ___, he is not happy.','however',['therefore','moreover','thus'],"富有与不快乐转折。"],
    ['She was exhausted; ___, she finished the marathon.','nevertheless',['therefore','hence','moreover'],"疲惫仍完成，转折。"],
    ['The movie was three hours long; ___, it was exciting.','nevertheless',['therefore','consequently','besides'],"转折：长但精彩。"],
    ['He worked hard; ___, he did not succeed.','however',['therefore','thus','moreover'],"努力但未成功，转折。"],
    ['The food was expensive; ___, it was delicious.','however',['therefore','thus','moreover'],"贵但好吃，转折。"],
    ['She is young; ___, she is very capable.','nevertheless',['therefore','consequently','hence'],"年轻但能干，转折。"],
    ['The plan is risky; ___, it could be very profitable.','however',['therefore','thus','moreover'],"转折。"],
    ['He is not lazy; ___, he is one of the most diligent students.','on the contrary',['however','therefore','moreover'],"not lazy 后接 on the contrary 进一步强调相反。"],
    ['Tom is outgoing; ___, his brother is shy.','in contrast',['therefore','moreover','consequently'],"两人性格对比。"],
    ['City life is fast-paced; ___, country life is relaxed.','in contrast',['therefore','moreover','thus'],"对比。"],
    ['The first model was cheap; ___, the second was quite expensive.','in contrast',['therefore','moreover','consequently'],"对比。"],
    ['She did not give up; ___, she tried even harder.','instead',['therefore','moreover','thus'],"用 instead 表示相反的做法。"],
    ['He overslept; ___, he missed the bus.','therefore',['however','moreover','besides'],"因果：因此。"],
    ['The roads were icy; ___, many accidents occurred.','consequently',['however','moreover','besides'],"因果：结果。"],
    ['She practiced daily; ___, her skills improved greatly.','as a result',['however','moreover','nevertheless'],"因果。"],
    ['The company lost money; ___, it had to lay off workers.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['There was a power cut; ___, the meeting was canceled.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['He studied hard; ___, he got a high score.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The demand increased; ___, prices rose.','as a result',['however','moreover','nevertheless'],"因果。"],
    ['It snowed heavily; ___, schools were closed.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['She forgot the password; ___, she could not log in.','thus',['however','moreover','nevertheless'],"因果：thus 因此。"],
    ['The team trained hard; ___, they won the championship.','as a result',['however','moreover','nevertheless'],"因果。"],
    ['The hotel was comfortable; ___, it was near the beach.','moreover',['however','therefore','nevertheless'],"并列补充。"],
    ['The book is well-written; ___, it is affordable.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['He speaks French; ___, he knows German.','in addition',['however','therefore','nevertheless'],"并列补充。"],
    ['The car is fast; ___, it is fuel-efficient.','moreover',['however','therefore','nevertheless'],"并列补充。"],
    ['She is intelligent; ___, she is hardworking.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['The job offers a good salary; ___, it provides health insurance.','in addition',['however','therefore','nevertheless'],"并列补充。"],
    ['The lecture was informative; ___, it was entertaining.','moreover',['however','therefore','nevertheless'],"并列补充。"],
    ['The phone is durable; ___, it is waterproof.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['We need money; ___, we need time.','in addition',['however','therefore','nevertheless'],"并列补充。"],
    ['The film was funny; ___, it had a strong message.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['Hurry up; ___, you will miss the train.','otherwise',['however','therefore','moreover'],"otherwise 否则。"],
    ['Wear a coat; ___, you will catch a cold.','otherwise',['however','therefore','moreover'],"otherwise。"],
    ['Study hard; ___, you will fail the exam.','otherwise',['however','therefore','moreover'],"otherwise。"],
    ['Drive carefully; ___, you might have an accident.','otherwise',['however','therefore','moreover'],"otherwise。"],
    ['Book early; ___, the tickets will sell out.','otherwise',['however','therefore','moreover'],"otherwise。"],
    ['She was cooking; ___, her husband was reading.','meanwhile',['however','therefore','moreover'],"meanwhile 同时。"],
    ['The storm passed; ___, the sun came out.','subsequently',['however','moreover','nevertheless'],"subsequently 随后。"],
    ['He kept trying; ___, he succeeded.','eventually',['however','moreover','nevertheless'],"eventually 最终。"],
    ['The evidence is clear; ___, the conclusion is obvious.','thus',['however','moreover','nevertheless'],"thus 因此。"],
    ['He was the only candidate; ___, he got the job.','hence',['however','moreover','nevertheless'],"hence 因此。"],
    ['The soup was cold; ___, it was tasteless.','moreover',['however','therefore','nevertheless'],"两个缺点并列，用 moreover。"],
    ['She was ill; ___, she went to work.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The project is complex; ___, it is feasible.','however',['therefore','thus','moreover'],"转折。"],
    ['Prices have risen; ___, demand has fallen.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['Demand has fallen; ___, prices may drop.','as a result',['however','moreover','nevertheless'],"因果。"],
    ['He apologized; ___, she forgave him.','subsequently',['however','moreover','nevertheless'],"随后。"],
    ['The bridge is old; ___, it must be repaired.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The evidence is weak; ___, the case was dismissed.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['She loves music; ___, she dislikes painting.','in contrast',['therefore','moreover','consequently'],"对比。"],
    ['He is wealthy; ___, he lives simply.','however',['therefore','thus','moreover'],"转折。"],
    ['I was busy; ___, I could not attend.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The car broke down; ___, we were late.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['The weather improved; ___, we set sail.','subsequently',['however','moreover','nevertheless'],"随后。"],
    ['The rule is strict; ___, everyone must obey it.','therefore',['however','moreover','nevertheless'],"因此。"],
    ['The shop closed down; ___, many lost their jobs.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['The book is short; ___, it is profound.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['He was tired; ___, he could not sleep.','however',['therefore','thus','moreover'],"转折：累却睡不着。"],
    ['The plan is simple; ___, it is effective.','moreover',['however','therefore','nevertheless'],"并列补充：简单且有效。"],
    ['She was nervous; ___, she performed well.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The road is narrow; ___, it is dangerous.','moreover',['however','therefore','nevertheless'],"并列：窄且危险。"],
    ['He was late; ___, he forgot his books.','furthermore',['however','therefore','nevertheless'],"并列补充（都是负面）。"],
    ['The offer is attractive; ___, I will accept it.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The service was slow; ___, the food was cold.','moreover',['however','therefore','nevertheless'],"并列补充（都是负面）。"],
    ['She practiced hard; ___, she won the prize.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['The map was unclear; ___, we got lost.','hence',['however','moreover','nevertheless'],"因果。"],
    ['He is kind; ___, he is generous.','moreover',['however','therefore','nevertheless'],"并列补充。"],
    ['The task was urgent; ___, we worked overnight.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The film is popular; ___, tickets are sold out.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['She was unhappy; ___, she resigned.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['He is young; ___, he lacks experience.','consequently',['however','moreover','nevertheless'],"因果：年轻因此缺乏经验。"],
    ['The product is reliable; ___, it carries a warranty.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['The traffic was heavy; ___, we arrived on time.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The climate is harsh; ___, few people live there.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['He saved diligently; ___, he bought a car.','eventually',['however','moreover','nevertheless'],"最终。"],
    ['The instructions were vague; ___, mistakes were made.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['She speaks softly; ___, everyone can hear her.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The data is limited; ___, the conclusion is tentative.','hence',['however','moreover','nevertheless'],"因果。"],
    ['He was injured; ___, he continued the race.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The museum is free; ___, it is closed on Mondays.','however',['therefore','thus','moreover'],"转折。"],
    ['Prices are low; ___, quality is high.','nevertheless',['therefore','thus','moreover'],"转折：低价却高质量。"],
    ['The exam was postponed; ___, students had more time to prepare.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['He lacks experience; ___, he is very creative.','however',['therefore','thus','moreover'],"转折。"],
    ['The team was divided; ___, the project failed.','consequently',['however','moreover','nevertheless'],"因果。"],
    ['She was praised; ___, she remained modest.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['The law is new; ___, few people understand it.','therefore',['however','moreover','nevertheless'],"因果。"],
    ['The engine is powerful; ___, it is efficient.','furthermore',['however','therefore','nevertheless'],"并列补充。"],
    ['The journey is long; ___, it is worthwhile.','nevertheless',['therefore','thus','moreover'],"转折。"],
    ['He disagreed; ___, he did not argue.','nevertheless',['therefore','thus','moreover'],"转折：虽不同意但没争辩。"]
  ];
  logicData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let diff = idx % 3 === 0 ? 1 : (idx % 3 === 1 ? 2 : 3);
    let { o, a } = mk(c, w);
    add(ch, 'single', `Cloze: ${q}`, o, a, e, diff);
  });

  // ---- 3b. Context vocabulary (60) ----
  const ctxData = [
    ['After hearing the sad news, her face turned ___ with grief.','pale',['red','tanned','bright'],"悲伤使脸色苍白 pale。"],
    ['The professor gave such an ___ lecture that no one fell asleep.','engaging',['boring','dull','tiring'],"让人不困的讲座应是 engaging 引人入胜的。"],
    ['The criminal made a ___ escape from the prison.','daring',['timid','cautious','cowardly'],"越狱应是大胆的 daring。"],
    ['She gave a ___ smile when she heard the good news.','broad',['narrow','faint','weak'],"开心的笑是 broad smile 灿烂的笑。"],
    ['The witness gave a ___ account of the accident, leaving out no detail.','thorough',['brief','vague','partial'],"不遗漏细节是 thorough 详尽的。"],
    ['His remarks were so ___ that everyone felt uncomfortable.','offensive',['polite','pleasant','kind'],"让人不舒服的是 offensive 冒犯的。"],
    ['The new policy had a ___ impact on the economy.','profound',['shallow','slight','trivial'],"深远影响是 profound。"],
    ['The detective examined the crime scene with ___ attention.','meticulous',['careless','casual','rough'],"仔细关注是 meticulous。"],
    ['Despite the failure, she remained ___ about the future.','optimistic',['pessimistic','hopeless','gloomy'],"对未来保持乐观 optimistic。"],
    ['The old building was in a ___ state after the earthquake.','ruined',['perfect','new','pristine'],"震后是残破的 ruined。"],
    ['The teacher was ___ with students who repeatedly broke the rules.','strict',['lenient','soft','easy'],"对违纪学生严厉 strict。"],
    ['His explanation was so ___ that even a child could understand it.','clear',['complex','confusing','vague'],"孩子能懂的是 clear。"],
    ['The athlete showed ___ determination to win the gold medal.','fierce',['weak','mild','faint'],"强烈决心 fierce。"],
    ['The river overflowed and ___ the entire valley.','submerged',['drained','dried','emptied'],"洪水淹没是 submerge。"],
    ['She has a ___ memory and never forgets a name.','remarkable',['poor','terrible','weak'],"好记性 remarkable。"],
    ['The company adopted a ___ approach to reduce costs.','drastic',['mild','gentle','slight'],"大幅削减成本用 drastic 激烈的。"],
    ['The crowd grew ___ as the singer failed to appear.','restless',['calm','peaceful','content'],"歌手不出场观众焦躁 restless。"],
    ['His argument was ___; no one could find a flaw in it.','flawless',['weak','faulty','broken'],"无懈可击 flawless。"],
    ['The nurse was ___ with the patients, always patient and kind.','gentle',['rough','harsh','rude'],"温柔体贴 gentle。"],
    ['The storm caused ___ damage to the coastal town.','massive',['minor','tiny','small'],"巨大破坏 massive。"],
    ['She was ___ about her achievements and never boasted.','modest',['proud','arrogant','boastful'],"谦虚 modest。"],
    ['The medicine provided ___ relief from the pain.','instant',['delayed','slow','eternal'],"立即缓解 instant。"],
    ['His speech was so ___ that the audience burst into tears.','moving',['boring','dull','funny'],"催人泪下 moving。"],
    ['The detective followed the ___ trail of clues to solve the mystery.','complex',['simple','straight','easy'],"复杂线索 complex。"],
    ['The contract was ___; both parties signed willingly.','valid',['void','fake','null'],"有效合同 valid。"],
    ['She has an ___ talent for music and can play many instruments.','exceptional',['ordinary','average','common'],"非凡天赋 exceptional。"],
    ['The manager took a ___ decision to expand the business.','bold',['timid','cautious','cowardly'],"大胆决定 bold。"],
    ['The view from the mountain top was ___.','breathtaking',['ugly','plain','dull'],"令人惊叹的景色 breathtaking。"],
    ['The suspect gave a ___ answer, avoiding the question directly.','evasive',['direct','straight','clear'],"回避问题 evasive。"],
    ['The library has a ___ collection of rare books.','vast',['small','tiny','narrow'],"大量藏书 vast。"],
    ['His performance was ___; he forgot his lines twice.','disastrous',['perfect','flawless','brilliant'],"灾难性表演 disastrous。"],
    ['The soup was so ___ that I could not eat it.','salty',['bland','sweet','tasteless'],"太咸无法吃 salty。"],
    ['She gave a ___ nod to show her agreement.','slight',['big','huge','massive'],"轻微点头 slight。"],
    ['The story had a ___ ending that no one expected.','surprising',['predictable','expected','obvious'],"出人意料结尾 surprising。"],
    ['The old man walked with a ___ stick for support.','sturdy',['weak','fragile','flimsy'],"结实拐杖 sturdy。"],
    ['The children were ___ to see the magician perform.','eager',['reluctant','unwilling','bored'],"渴望看魔术 eager。"],
    ['The report was ___ and covered all the main points.','comprehensive',['partial','incomplete','brief'],"全面报告 comprehensive。"],
    ['His behavior was ___; he remained calm under pressure.','admirable',['shameful','awful','terrible'],"令人钦佩 admirable。"],
    ['The new bridge is ___ enough to withstand strong winds.','sturdy',['weak','fragile','flimsy'],"坚固 sturdy。"],
    ['She wore a ___ expression when she heard the joke.','puzzled',['clear','certain','sure'],"困惑表情 puzzled。"],
    ['The treaty brought ___ peace to the war-torn region.','lasting',['brief','temporary','short'],"持久和平 lasting。"],
    ['The student made a ___ effort to improve his grades.','genuine',['fake','false','half'],"真心努力 genuine。"],
    ['The forest fire spread ___ due to the strong winds.','rapidly',['slowly','gradually','sluggishly'],"迅速蔓延 rapidly。"],
    ['His reply was ___ and to the point.','concise',['lengthy','wordy','verbose'],"简明扼要 concise。"],
    ['The committee reached a ___ decision after long debate.','unanimous',['divided','split','conflict'],"一致决定 unanimous。"],
    ['The vase was ___ and broke easily.','fragile',['sturdy','strong','tough'],"易碎 fragile。"],
    ['She gave a ___ description of the suspect to the police.','detailed',['vague','brief','rough'],"详细描述 detailed。"],
    ['The weather was ___ for a picnic, sunny and warm.','ideal',['awful','terrible','poor'],"理想天气 ideal。"],
    ['The boss was ___ when the project was delivered early.','delighted',['angry','upset','annoyed'],"提前交付老板高兴 delighted。"],
    ['The rope was ___ enough to hold the heavy load.','strong',['weak','thin','fragile'],"够结实 strong。"],
    ['The film\'s plot was so ___ that I fell asleep.','boring',['exciting','thrilling','gripping'],"无聊催眠 boring。"],
    ['The negotiator remained ___ throughout the tense discussion.','calm',['nervous','anxious','panicked'],"保持冷静 calm。"],
    ['The new employee was ___ to learn and asked many questions.','eager',['reluctant','unwilling','lazy'],"渴望学习 eager。"],
    ['The rescue team made a ___ effort to find the lost hikers.','desperate',['half','weak','lazy'],"拼命努力 desperate。"],
    ['The artist\'s work was ___ for its originality.','noted',['ignored','overlooked','unknown'],"因独创性而闻名 noted。"],
    ['The machine is ___; it works without human control.','automatic',['manual','hand','human'],"自动的 automatic。"],
    ['The judge was ___ and treated everyone fairly.','impartial',['biased','partial','unfair'],"公正 impartial。"],
    ['The witness was ___ and could not recall the event.','confused',['clear','certain','sure'],"困惑记不清 confused。"],
    ['The economy showed ___ growth in the third quarter.','steady',['erratic','unstable','fluctuating'],"稳定增长 steady。"],
    ['The hikers found the trail ___ and easy to follow.','clear',['vague','obscure','hidden'],"清晰好走 clear。"]
  ];
  ctxData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let diff = idx % 3 === 0 ? 1 : (idx % 3 === 1 ? 2 : 3);
    let { o, a } = mk(c, w);
    add(ch, 'single', `Cloze: ${q}`, o, a, e, diff);
  });
}

// ============================================================
// MODULE 4: 阅读理解 Reading Comprehension (150 questions)
// ============================================================
function genReading() {
  const ch = '阅读理解';
  // Each entry: { p: passage, qs: [ {ty, q, c, w, e} ... ] }
  const PASS = [
    {p:'Artificial intelligence is transforming the workplace. Many routine tasks that once required human effort can now be automated, allowing employees to focus on more creative work.',qs:[
      {q:'What is the main idea of the passage?',c:'AI is changing the workplace by automating routine tasks.',w:['AI will completely replace all human workers.','AI has no real impact on employment.','AI only helps with creative work.'],e:'主旨：AI 通过自动化常规任务改变工作场所。'},
      {q:'It can be inferred that employees will now:',c:'spend more time on creative tasks.',w:['do more routine work','lose all their jobs','avoid using technology'],e:'推理：自动化让员工专注于创造性工作。'},
      {q:'According to the passage, what can be automated?',c:'routine tasks',w:['creative work','management decisions','everything'],e:'细节：routine tasks 可被自动化。'}
    ]},
    {p:'Online learning has grown rapidly in recent years. Students can now attend courses from anywhere, but some educators worry that face-to-face interaction is being lost.',qs:[
      {q:'What is the passage mainly about?',c:'The rise of online learning and a concern about it.',w:['The history of schools','Why students fail exams','How to use computers'],e:'主旨：在线学习的兴起及随之而来的担忧。'},
      {q:'What concern do some educators have?',c:'Face-to-face interaction may be lost.',w:['Courses are too expensive','Computers are too slow','Students learn too much'],e:'细节：educators 担心失去面对面交流。'},
      {q:'The word "interaction" in the passage most likely means:',c:'communication between people',w:['a type of course','a computer program','an exam result'],e:'词义：interaction 交流、互动。'}
    ]},
    {p:'Climate change has caused sea levels to rise. Coastal cities are building higher walls to protect themselves, but scientists argue that reducing emissions is the only long-term solution.',qs:[
      {q:'What is the main idea of the passage?',c:'Rising sea levels threaten coasts, and cutting emissions is the long-term fix.',w:['Sea walls are the best solution','Climate change is a myth','Coastal cities are sinking fast'],e:'主旨。'},
      {q:'According to scientists, what is the long-term solution?',c:'reducing emissions',w:['building higher walls','moving cities inland','doing nothing'],e:'细节：科学家认为减排是长期解决之道。'},
      {q:'The author\'s attitude toward sea walls is best described as:',c:'they are helpful but not enough.',w:['completely useless','the perfect solution','harmful to fish'],e:'态度：墙有用但不够。'}
    ]},
    {p:'Many people believe that economic growth always improves living standards. However, some economists point out that growth can also widen the gap between rich and poor.',qs:[
      {q:'What is the main idea of the passage?',c:'Economic growth may not benefit everyone equally.',w:['Growth always helps everyone','Growth has no effect on poverty','The rich are getting poorer'],e:'主旨。'},
      {q:'It can be inferred that:',c:'wealth distribution matters as much as growth.',w:['growth should be stopped','only the poor benefit from growth','economists dislike growth'],e:'推理。'},
      {q:'The phrase "widen the gap" most nearly means:',c:'increase the difference',w:['reduce the difference','maintain equality','close the divide'],e:'词义：拉大差距。'}
    ]},
    {p:'Traditional culture is disappearing in many parts of the world as young people embrace modern lifestyles. Some governments are launching programs to preserve local customs and languages.',qs:[
      {q:'What is the passage mainly about?',c:'The decline of traditional culture and efforts to preserve it.',w:['Why young people dislike customs','How modern lifestyles are cheaper','The history of languages'],e:'主旨。'},
      {q:'Why is traditional culture disappearing?',c:'Young people prefer modern lifestyles.',w:['Governments ban customs','Old people refuse to teach','Customs are too expensive'],e:'细节。'},
      {q:'What are governments doing in response?',c:'launching preservation programs',w:['ignoring the issue','banning modern lifestyles','raising taxes'],e:'细节。'}
    ]},
    {p:'Regular exercise has been shown to reduce the risk of heart disease. Even moderate activity, such as walking for thirty minutes a day, can produce significant health benefits.',qs:[
      {q:'What is the main idea of the passage?',c:'Moderate exercise can significantly improve heart health.',w:['Only intense exercise is useful','Walking cures all diseases','Heart disease is unavoidable'],e:'主旨。'},
      {q:'According to the passage, how much walking is beneficial?',c:'thirty minutes a day',w:['five minutes a week','three hours a day','none at all'],e:'细节。'},
      {q:'The word "moderate" most nearly means:',c:'not extreme',w:['very intense','extremely light','dangerous'],e:'词义：适度的。'}
    ]},
    {p:'Renewable energy sources such as solar and wind power are becoming cheaper every year. As a result, more countries are investing in clean energy to reduce their dependence on fossil fuels.',qs:[
      {q:'What is the main idea of the passage?',c:'Clean energy is getting cheaper and more popular.',w:['Fossil fuels are the cheapest','Solar power is failing','Countries avoid clean energy'],e:'主旨。'},
      {q:'Why are countries investing in clean energy?',c:'to reduce dependence on fossil fuels',w:['to increase pollution','to waste money','to raise fuel prices'],e:'细节。'},
      {q:'It can be inferred that fossil fuels are:',c:'becoming less favored.',w:['becoming cheaper','the only option','harmless'],e:'推理。'}
    ]},
    {p:'A recent study found that students who read regularly tend to have larger vocabularies. The researchers concluded that reading is one of the most effective ways to build language skills.',qs:[
      {q:'What is the main idea of the passage?',c:'Regular reading helps build vocabulary.',w:['Reading wastes time','Vocabulary cannot be improved','Students dislike reading'],e:'主旨。'},
      {q:'What did the study conclude?',c:'Reading is an effective way to build language skills.',w:['Reading has no effect','TV is better than reading','Vocabulary is genetic'],e:'细节。'},
      {q:'The word "effective" most nearly means:',c:'producing a desired result',w:['useless','expensive','outdated'],e:'词义。'}
    ]},
    {p:'Globalization has connected economies more closely than ever. While it has created new markets, it has also made local industries vulnerable to international competition.',qs:[
      {q:'What is the passage mainly about?',c:'Globalization brings both opportunities and risks.',w:['Globalization only helps','Globalization only harms','Trade is illegal'],e:'主旨。'},
      {q:'According to the passage, what is a downside of globalization?',c:'Local industries face more competition.',w:['New markets disappear','Trade stops completely','Prices always fall'],e:'细节。'},
      {q:'The word "vulnerable" most nearly means:',c:'easily harmed',w:['very strong','completely safe','unaffected'],e:'词义：易受伤害的。'}
    ]},
    {p:'Many cities are promoting public transportation to reduce traffic congestion and air pollution. Improved bus and subway systems encourage residents to leave their cars at home.',qs:[
      {q:'What is the main idea of the passage?',c:'Better public transit can cut traffic and pollution.',w:['Cars are the best transport','Public transit is useless','Pollution cannot be reduced'],e:'主旨。'},
      {q:'Why are cities promoting public transportation?',c:'to reduce congestion and pollution',w:['to sell more cars','to raise ticket prices','to close roads'],e:'细节。'},
      {q:'The word "congestion" most nearly means:',c:'overcrowding of traffic',w:['empty roads','clean air','cheap fuel'],e:'词义：拥堵。'}
    ]},
    {p:'Remote work became common during the pandemic and has remained popular. Companies report lower office costs, but some managers struggle to maintain team cohesion.',qs:[
      {q:'What is the main idea of the passage?',c:'Remote work brings savings but challenges teamwork.',w:['Remote work is banned','Offices are cheaper now','Managers love remote work'],e:'主旨。'},
      {q:'What benefit do companies report?',c:'lower office costs',w:['higher office costs','more meetings','worse productivity'],e:'细节。'},
      {q:'It can be inferred that team cohesion is:',c:'harder to maintain remotely.',w:['easier online','impossible in offices','unimportant'],e:'推理。'}
    ]},
    {p:'Electric vehicles produce no tailpipe emissions, which helps improve urban air quality. However, the electricity used to charge them often comes from power plants that burn fossil fuels.',qs:[
      {q:'What is the main idea of the passage?',c:'Electric cars help locally but may still rely on fossil fuels.',w:['Electric cars are perfect','Electric cars cause all pollution','Cars should be banned'],e:'主旨。'},
      {q:'According to the passage, what is a limitation of electric vehicles?',c:'Their electricity may come from fossil fuels.',w:['They emit tailpipe gases','They are too slow','They never use electricity'],e:'细节。'},
      {q:'The word "emissions" most nearly means:',c:'released pollutants',w:['clean air','engine power','fuel prices'],e:'词义：排放物。'}
    ]},
    {p:'Bilingual children often show greater cognitive flexibility, according to researchers. Switching between two languages appears to exercise the brain in beneficial ways.',qs:[
      {q:'What is the main idea of the passage?',c:'Bilingualism may boost cognitive flexibility.',w:['Bilingual children struggle more','Languages harm the brain','Only adults learn languages'],e:'主旨。'},
      {q:'Why might bilingual children be more flexible thinkers?',c:'Switching languages exercises the brain.',w:['They study less','They avoid thinking','They watch more TV'],e:'细节。'},
      {q:'The word "cognitive" relates to:',c:'thinking and knowing',w:['physical strength','cooking skills','musical talent'],e:'词义：认知的。'}
    ]},
    {p:'Deforestation contributes to the loss of biodiversity. When forests are cleared, many species lose their habitats, and some may face extinction.',qs:[
      {q:'What is the main idea of the passage?',c:'Cutting forests threatens many species.',w:['Deforestation helps species','Forests grow back quickly','Extinction is natural and good'],e:'主旨。'},
      {q:'What happens when forests are cleared?',c:'Species lose their habitats.',w:['Species gain habitats','Biodiversity increases','Trees grow faster'],e:'细节。'},
      {q:'The word "extinction" most nearly means:',c:'dying out completely',w:['growing rapidly','moving away','changing color'],e:'词义：灭绝。'}
    ]},
    {p:'Inflation reduces the purchasing power of consumers. When prices rise faster than wages, people can afford fewer goods and services than before.',qs:[
      {q:'What is the main idea of the passage?',c:'Inflation lowers what consumers can buy.',w:['Inflation raises wages','Inflation has no effect','Prices always fall'],e:'主旨。'},
      {q:'According to the passage, when do people afford fewer goods?',c:'When prices rise faster than wages.',w:['When wages rise faster','When prices fall','When wages stay flat'],e:'细节。'},
      {q:'The phrase "purchasing power" refers to:',c:'how much one can buy with money',w:['the strength of banks','the price of gold','the size of loans'],e:'词义：购买力。'}
    ]},
    {p:'Social media allows people to share ideas instantly, but it also spreads misinformation quickly. Experts urge users to verify facts before sharing posts.',qs:[
      {q:'What is the main idea of the passage?',c:'Social media spreads both ideas and misinformation.',w:['Social media is always reliable','Social media has no drawbacks','Misinformation never spreads'],e:'主旨。'},
      {q:'What do experts urge users to do?',c:'verify facts before sharing',w:['share posts immediately','ignore all news','delete their accounts'],e:'细节。'},
      {q:'The author\'s tone can be best described as:',c:'cautious and advisory',w:['enthusiastic and approving','angry and condemning','indifferent and bored'],e:'态度。'}
    ]},
    {p:'Sleep is essential for memory consolidation. Studies show that people who sleep well after learning perform better on tests than those who stay awake.',qs:[
      {q:'What is the main idea of the passage?',c:'Good sleep aids memory after learning.',w:['Sleep harms memory','Memory needs no sleep','Tests are useless'],e:'主旨。'},
      {q:'Who performs better on tests according to the study?',c:'those who sleep well after learning',w:['those who stay awake','those who skip sleep','those who never study'],e:'细节。'},
      {q:'The word "consolidation" most nearly means:',c:'strengthening',w:['weakening','forgetting','reading'],e:'词义：巩固。'}
    ]},
    {p:'Urbanization has led to the growth of megacities. While these cities offer economic opportunities, they also face problems such as housing shortages and pollution.',qs:[
      {q:'What is the main idea of the passage?',c:'Megacities offer opportunities but also serious problems.',w:['Megacities have no problems','Urbanization is declining','Cities are shrinking'],e:'主旨。'},
      {q:'Which of the following is a problem mentioned in the passage?',c:'housing shortages',w:['too many houses','clean air everywhere','low population'],e:'细节。'},
      {q:'The word "opportunities" most nearly means:',c:'favorable chances',w:['serious dangers','strict rules','low wages'],e:'词义：机会。'}
    ]},
    {p:'Recycling helps conserve natural resources and reduce waste. However, many recyclable materials still end up in landfills due to poor sorting by consumers.',qs:[
      {q:'What is the main idea of the passage?',c:'Recycling is useful but sorting problems limit its effect.',w:['Recycling never works','Landfills are good','Consumers recycle perfectly'],e:'主旨。'},
      {q:'Why do recyclable materials end up in landfills?',c:'Consumers sort poorly.',w:['Sorting is perfect','Materials cannot be recycled','Landfills are needed'],e:'细节。'},
      {q:'The word "conserve" most nearly means:',c:'to save or protect',w:['to waste','to sell','to destroy'],e:'词义：节约。'}
    ]},
    {p:'The gig economy offers workers flexible hours, but it often lacks benefits such as health insurance and paid leave. This has sparked debate over worker protections.',qs:[
      {q:'What is the main idea of the passage?',c:'Gig work is flexible but often lacks benefits.',w:['Gig work is illegal','Gig workers get full benefits','Flexibility is unimportant'],e:'主旨。'},
      {q:'What has the gig economy sparked?',c:'debate over worker protections',w:['agreement on all issues','a ban on flexibility','lower interest in work'],e:'细节。'},
      {q:'It can be inferred that gig workers:',c:'may face financial insecurity.',w:['are fully protected','never work','earn fixed salaries'],e:'推理。'}
    ]},
    {p:'Museums preserve cultural heritage for future generations. By displaying artifacts and artworks, they help the public understand history and art.',qs:[
      {q:'What is the main idea of the passage?',c:'Museums protect and share cultural heritage.',w:['Museums sell artifacts','Museums are useless','Art has no history'],e:'主旨。'},
      {q:'How do museums help the public?',c:'By displaying artifacts and artworks.',w:['By hiding artworks','By closing to public','By selling tickets only'],e:'细节。'},
      {q:'The word "artifacts" most nearly means:',c:'objects made by humans',w:['wild animals','natural rocks','modern gadgets'],e:'词义：人工制品。'}
    ]},
    {p:'A balanced diet includes a variety of foods. Nutritionists recommend eating plenty of fruits and vegetables while limiting sugar and processed foods.',qs:[
      {q:'What is the main idea of the passage?',c:'A balanced diet emphasizes variety and limits sugar.',w:['Sugar is healthy','Only meat is needed','Diets do not matter'],e:'主旨。'},
      {q:'What do nutritionists recommend limiting?',c:'sugar and processed foods',w:['fruits and vegetables','water','protein'],e:'细节。'},
      {q:'The word "processed" most nearly means:',c:'treated or manufactured',w:['fresh and raw','wild and natural','home-cooked'],e:'词义：加工的。'}
    ]},
    {p:'Automation in factories has increased productivity but reduced the need for manual labor. Many factory workers have had to retrain for new kinds of jobs.',qs:[
      {q:'What is the main idea of the passage?',c:'Automation raises productivity but displaces manual jobs.',w:['Automation creates manual jobs','Factories hire more workers','Productivity has fallen'],e:'主旨。'},
      {q:'What have many factory workers had to do?',c:'retrain for new jobs',w:['retire immediately','stop working forever','avoid training'],e:'细节。'},
      {q:'It can be inferred that retraining is:',c:'necessary after job displacement.',w:['useless','optional and rare','harmful'],e:'推理。'}
    ]},
    {p:'Water scarcity affects millions of people worldwide. Climate change and wasteful practices are making the problem worse each year.',qs:[
      {q:'What is the main idea of the passage?',c:'Water scarcity is worsening due to climate and waste.',w:['Water is abundant everywhere','Scarcity is solved','Climate change helps water supply'],e:'主旨。'},
      {q:'What is making water scarcity worse?',c:'climate change and wasteful practices',w:['more rainfall','better conservation','fewer people'],e:'细节。'},
      {q:'The word "scarcity" most nearly means:',c:'a shortage',w:['an abundance','a flood','a surplus'],e:'词义：短缺。'}
    ]},
    {p:'E-commerce has changed how people shop. Customers can compare prices online and have goods delivered to their doors, which has hurt many traditional stores.',qs:[
      {q:'What is the main idea of the passage?',c:'Online shopping has reshaped retail and challenged stores.',w:['E-commerce is failing','Stores are unaffected','People stopped shopping'],e:'主旨。'},
      {q:'What has hurt traditional stores?',c:'the rise of e-commerce',w:['higher prices online','worse delivery','online shopping bans'],e:'细节。'},
      {q:'The author\'s attitude is best described as:',c:'objective and observational',w:['strongly approving','bitterly critical','completely indifferent'],e:'态度。'}
    ]},
    {p:'Mental health is as important as physical health. Regular exercise, sufficient sleep, and social connections all contribute to psychological well-being.',qs:[
      {q:'What is the main idea of the passage?',c:'Mental health depends on several healthy habits.',w:['Mental health is unimportant','Only sleep matters','Exercise harms the mind'],e:'主旨。'},
      {q:'Which of the following contributes to mental well-being?',c:'social connections',w:['isolation','sleep deprivation','inactivity'],e:'细节。'},
      {q:'The word "psychological" most nearly means:',c:'related to the mind',w:['related to the body','related to money','related to weather'],e:'词义：心理的。'}
    ]},
    {p:'Solar panels convert sunlight into electricity. They produce no pollution during operation, making them an attractive alternative to fossil fuels.',qs:[
      {q:'What is the main idea of the passage?',c:'Solar panels generate clean electricity from sunlight.',w:['Solar panels pollute heavily','Solar power is useless','Fossil fuels are cleaner'],e:'主旨。'},
      {q:'Why are solar panels attractive?',c:'They produce no pollution during operation.',w:['They are very cheap','They burn fuel','They work at night only'],e:'细节。'},
      {q:'The word "convert" most nearly means:',c:'to change into',w:['to destroy','to hide','to sell'],e:'词义：转换。'}
    ]},
    {p:'Children who grow up reading books tend to develop stronger imaginations. Parents are encouraged to read aloud to their kids from an early age.',qs:[
      {q:'What is the main idea of the passage?',c:'Early reading helps develop children\'s imagination.',w:['Reading weakens imagination','Parents should not read','Books harm children'],e:'主旨。'},
      {q:'What are parents encouraged to do?',c:'read aloud to their kids early',w:['stop reading','buy fewer books','wait until school'],e:'细节。'},
      {q:'It can be inferred that reading aloud:',c:'benefits young children.',w:['has no effect','delays learning','is harmful'],e:'推理。'}
    ]},
    {p:'The aging population is straining pension systems in many countries. With fewer young workers, governments are considering raising the retirement age.',qs:[
      {q:'What is the main idea of the passage?',c:'Aging populations pressure pension systems.',w:['Pensions are fully funded','Young workers are increasing','Retirement age is falling'],e:'主旨。'},
      {q:'What are governments considering?',c:'raising the retirement age',w:['lowering pensions only','hiring more youth','abolishing pensions'],e:'细节。'},
      {q:'The word "straining" most nearly means:',c:'putting pressure on',w:['relaxing','funding fully','ignoring'],e:'词义：使紧张。'}
    ]},
    {p:'Public libraries offer free access to books and the internet. They serve as important community centers, especially for low-income families.',qs:[
      {q:'What is the main idea of the passage?',c:'Libraries provide free resources and serve communities.',w:['Libraries charge high fees','Libraries are closing down','Internet is banned in libraries'],e:'主旨。'},
      {q:'Who benefits most from libraries according to the passage?',c:'low-income families',w:['wealthy families only','tourists','library staff only'],e:'细节。'},
      {q:'The word "access" most nearly means:',c:'the ability to use',w:['the cost of','a ban on','a type of book'],e:'词义：使用机会。'}
    ]},
    {p:'Overfishing has depleted many fish populations. Scientists warn that without strict quotas, some species may never recover.',qs:[
      {q:'What is the main idea of the passage?',c:'Overfishing threatens fish populations.',w:['Fish populations are rising','Fishing is sustainable','Quotas are unnecessary'],e:'主旨。'},
      {q:'What do scientists warn?',c:'Some species may never recover without quotas.',w:['Fish recover quickly','Quotas harm fish','Overfishing is fine'],e:'细节。'},
      {q:'The word "depleted" most nearly means:',c:'reduced greatly',w:['increased','protected','untouched'],e:'词义：耗尽。'}
    ]},
    {p:'Distance education has made learning accessible to people in remote areas. However, poor internet connections can hinder the experience.',qs:[
      {q:'What is the main idea of the passage?',c:'Distance education expands access but faces tech limits.',w:['Distance education is perfect','Remote areas have fast internet','Learning is impossible online'],e:'主旨。'},
      {q:'What can hinder distance education?',c:'poor internet connections',w:['fast internet','too many teachers','low tuition'],e:'细节。'},
      {q:'The word "hinder" most nearly means:',c:'to obstruct',w:['to help','to speed up','to fund'],e:'词义：阻碍。'}
    ]},
    {p:'The sharing economy lets people rent out their homes and cars. It creates extra income for owners but raises concerns about safety and regulation.',qs:[
      {q:'What is the main idea of the passage?',c:'The sharing economy offers income but raises concerns.',w:['The sharing economy is banned','Renting is always unsafe','Sharing has no benefits'],e:'主旨。'},
      {q:'What concerns does the sharing economy raise?',c:'safety and regulation',w:['extra income','low prices','better service'],e:'细节。'},
      {q:'It can be inferred that regulation of sharing is:',c:'still being debated.',w:['fully settled','completely banned','unnecessary'],e:'推理。'}
    ]},
    {p:'Vaccines have prevented countless diseases over the past century. Despite their success, some people remain hesitant due to misinformation.',qs:[
      {q:'What is the main idea of the passage?',c:'Vaccines save lives but face hesitation from misinformation.',w:['Vaccines are dangerous','Vaccines never work','No one hesitates about vaccines'],e:'主旨。'},
      {q:'Why do some people remain hesitant?',c:'due to misinformation',w:['due to science','due to low cost','due to availability'],e:'细节。'},
      {q:'The author\'s attitude toward vaccines is:',c:'supportive',w:['opposed','neutral only','unclear'],e:'态度。'}
    ]},
    {p:'Wind turbines generate electricity from wind. They are most effective in coastal and open areas where winds are strong and steady.',qs:[
      {q:'What is the main idea of the passage?',c:'Wind turbines work best where winds are strong.',w:['Wind turbines fail everywhere','Wind power is constant','Turbines need fuel'],e:'主旨。'},
      {q:'Where are wind turbines most effective?',c:'coastal and open areas',w:['dense forests','underground','cities only'],e:'细节。'},
      {q:'The word "steady" most nearly means:',c:'constant and even',w:['changing','weak','dangerous'],e:'词义：稳定的。'}
    ]},
    {p:'Many students experience stress during exams. Experts suggest that proper time management and regular breaks can reduce this pressure.',qs:[
      {q:'What is the main idea of the passage?',c:'Time management and breaks ease exam stress.',w:['Exams cause no stress','Breaks increase stress','Stress cannot be reduced'],e:'主旨。'},
      {q:'What do experts suggest to reduce exam stress?',c:'proper time management and regular breaks',w:['studying nonstop','skipping breaks','cramming all night'],e:'细节。'},
      {q:'The word "pressure" most nearly means:',c:'stress or burden',w:['relaxation','free time','reward'],e:'词义：压力。'}
    ]},
    {p:'Credit cards offer convenience but can lead to debt if not used carefully. Financial advisors recommend paying the full balance each month.',qs:[
      {q:'What is the main idea of the passage?',c:'Credit cards are convenient but risky if misused.',w:['Credit cards are always bad','Credit cards are debt-free','Credit cards have no limits'],e:'主旨。'},
      {q:'What do financial advisors recommend?',c:'paying the full balance each month',w:['paying only minimums','ignoring bills','canceling all cards'],e:'细节。'},
      {q:'It can be inferred that paying only the minimum:',c:'can lead to debt.',w:['avoids all debt','is recommended','earns rewards'],e:'推理。'}
    ]},
    {p:'Planting trees in cities helps cool the air and reduce energy use. Trees also absorb carbon dioxide, fighting climate change.',qs:[
      {q:'What is the main idea of the passage?',c:'Urban trees cool cities and help the climate.',w:['Trees warm cities','Trees increase energy use','Trees release carbon'],e:'主旨。'},
      {q:'What do trees absorb according to the passage?',c:'carbon dioxide',w:['oxygen','sunlight only','concrete'],e:'细节。'},
      {q:'The word "absorb" most nearly means:',c:'to take in',w:['to release','to cut down','to sell'],e:'词义：吸收。'}
    ]},
    {p:'Online reviews influence consumer choices. Studies show that most shoppers trust online reviews as much as personal recommendations.',qs:[
      {q:'What is the main idea of the passage?',c:'Online reviews strongly shape buying decisions.',w:['Reviews are ignored','Reviews are always fake','Shoppers never read reviews'],e:'主旨。'},
      {q:'What do studies show about shoppers?',c:'They trust online reviews like personal recommendations.',w:['They distrust all reviews','They never read reviews','They prefer ads'],e:'细节。'},
      {q:'The author\'s tone is best described as:',c:'informative',w:['alarmist','sarcastic','hostile'],e:'态度。'}
    ]},
    {p:'Drinking enough water is vital for health. It aids digestion, regulates body temperature, and keeps skin healthy.',qs:[
      {q:'What is the main idea of the passage?',c:'Adequate water intake is essential for health.',w:['Water harms digestion','Water is unnecessary','Only cold water helps'],e:'主旨。'},
      {q:'Which of the following does water help with?',c:'regulating body temperature',w:['raising body heat','stopping digestion','damaging skin'],e:'细节。'},
      {q:'The word "vital" most nearly means:',c:'essential',w:['useless','optional','harmful'],e:'词义：至关重要的。'}
    ]},
    {p:'Self-driving cars may reduce accidents caused by human error. However, questions remain about their safety in complex traffic situations.',qs:[
      {q:'What is the main idea of the passage?',c:'Self-driving cars could cut accidents but raise safety questions.',w:['Self-driving cars are flawless','Human drivers never err','Self-driving cars are banned'],e:'主旨。'},
      {q:'What may self-driving cars reduce?',c:'accidents caused by human error',w:['traffic rules','fuel efficiency','car prices'],e:'细节。'},
      {q:'It can be inferred that complex traffic:',c:'still challenges self-driving cars.',w:['is easy for them','is avoided by them','never happens'],e:'推理。'}
    ]},
    {p:'Learning a second language improves career prospects. Many employers value bilingual employees who can communicate with international clients.',qs:[
      {q:'What is the main idea of the passage?',c:'A second language boosts career opportunities.',w:['Languages hurt careers','Employers dislike bilinguals','English is enough'],e:'主旨。'},
      {q:'Why do employers value bilingual employees?',c:'They can communicate with international clients.',w:['They demand higher pay','They work slower','They avoid clients'],e:'细节。'},
      {q:'The word "prospects" most nearly means:',c:'chances for success',w:['risks of failure','past salaries','job losses'],e:'词义：前景。'}
    ]},
    {p:'Plastic pollution harms marine life. Sea animals often mistake plastic waste for food, which can be fatal.',qs:[
      {q:'What is the main idea of the passage?',c:'Plastic waste endangers sea animals.',w:['Plastic helps marine life','Sea animals eat plastic safely','Pollution is decreasing'],e:'主旨。'},
      {q:'What happens when sea animals mistake plastic for food?',c:'It can be fatal.',w:['It is nutritious','It helps them grow','It is harmless'],e:'细节。'},
      {q:'The word "fatal" most nearly means:',c:'deadly',w:['safe','healthy','temporary'],e:'词义：致命的。'}
    ]},
    {p:'Time management skills help students balance study and leisure. Setting priorities and avoiding procrastination are key strategies.',qs:[
      {q:'What is the main idea of the passage?',c:'Time management helps balance study and leisure.',w:['Study and leisure conflict','Procrastination is good','Priorities do not matter'],e:'主旨。'},
      {q:'Which is a key time-management strategy mentioned?',c:'setting priorities',w:['procrastinating','ignoring deadlines','avoiding plans'],e:'细节。'},
      {q:'The word "procrastination" most nearly means:',c:'delaying tasks',w:['finishing early','planning ahead','working hard'],e:'词义：拖延。'}
    ]},
    {p:'Robotics is advancing in medicine. Surgical robots can perform precise operations, reducing recovery time for patients.',qs:[
      {q:'What is the main idea of the passage?',c:'Robots improve precision and recovery in surgery.',w:['Robots harm patients','Surgery is unchanged','Robots replace all doctors'],e:'主旨。'},
      {q:'What do surgical robots reduce?',c:'recovery time',w:['precision','patient safety','operation success'],e:'细节。'},
      {q:'The word "precise" most nearly means:',c:'exact and accurate',w:['careless','rough','slow'],e:'词义：精确的。'}
    ]},
    {p:'Many cultures value the elderly for their wisdom. In contrast, some modern societies tend to neglect older people.',qs:[
      {q:'What is the main idea of the passage?',c:'Societies differ in how they treat the elderly.',w:['All cultures neglect the elderly','The elderly are useless','Modern societies value elders most'],e:'主旨。'},
      {q:'What do many cultures value the elderly for?',c:'their wisdom',w:['their wealth','their youth','their strength'],e:'细节。'},
      {q:'The word "neglect" most nearly means:',c:'to ignore or fail to care for',w:['to respect','to praise','to support'],e:'词义：忽视。'}
    ]},
    {p:'Public health campaigns have reduced smoking rates in many countries. Warning labels and advertising bans have proven effective.',qs:[
      {q:'What is the main idea of the passage?',c:'Anti-smoking campaigns have lowered smoking rates.',w:['Smoking rates are rising','Campaigns have no effect','Warnings encourage smoking'],e:'主旨。'},
      {q:'What has proven effective in reducing smoking?',c:'warning labels and advertising bans',w:['free cigarettes','more advertising','lower tobacco taxes'],e:'细节。'},
      {q:'The author\'s tone is best described as:',c:'factual and positive',w:['skeptical','angry','indifferent'],e:'态度。'}
    ]},
    {p:'Cloud storage lets users save files online instead of on local devices. It offers convenience but raises privacy concerns.',qs:[
      {q:'What is the main idea of the passage?',c:'Cloud storage is convenient but raises privacy issues.',w:['Cloud storage is unsafe always','Cloud storage has no benefits','Local storage is obsolete'],e:'主旨。'},
      {q:'What concern does cloud storage raise?',c:'privacy',w:['speed','cost only','storage size'],e:'细节。'},
      {q:'It can be inferred that users should:',c:'be cautious about what they store online.',w:['store all secrets online','avoid all storage','never use the internet'],e:'推理。'}
    ]},
    {p:'Cultural diversity in workplaces can boost creativity. Teams with varied backgrounds often generate more innovative ideas.',qs:[
      {q:'What is the main idea of the passage?',c:'Diverse teams tend to be more creative.',w:['Diversity reduces creativity','Teams should be identical','Backgrounds do not matter'],e:'主旨。'},
      {q:'What can diverse teams generate more of?',c:'innovative ideas',w:['fewer ideas','the same ideas','no ideas'],e:'细节。'},
      {q:'The word "innovative" most nearly means:',c:'new and original',w:['old and common','boring','cheap'],e:'词义：创新的。'}
    ]},
    {p:'Noise pollution in cities affects people\'s sleep and concentration. Experts recommend soundproofing and quiet zones to address the issue.',qs:[
      {q:'What is the main idea of the passage?',c:'City noise harms sleep and focus; solutions exist.',w:['Noise pollution is harmless','Cities are too quiet','Soundproofing fails'],e:'主旨。'},
      {q:'What do experts recommend?',c:'soundproofing and quiet zones',w:['louder cities','more traffic','removing walls'],e:'细节。'},
      {q:'The word "concentration" most nearly means:',c:'focused attention',w:['distraction','sleep','exercise'],e:'词义：专注。'}
    ]},
    {p:'Microfinance provides small loans to poor entrepreneurs. It helps them start businesses and escape poverty, though repayment rates vary.',qs:[
      {q:'What is the main idea of the passage?',c:'Small loans help the poor start businesses.',w:['Microfinance never works','Loans increase poverty','Entrepreneurs avoid loans'],e:'主旨。'},
      {q:'What does microfinance help entrepreneurs do?',c:'start businesses and escape poverty',w:['avoid working','borrow endlessly','stay poor'],e:'细节。'},
      {q:'The word "entrepreneurs" most nearly means:',c:'people who start businesses',w:['government workers','bankers only','students'],e:'词义：企业家。'}
    ]},
    {p:'Digital libraries are replacing physical ones in some regions. They offer vast collections but lack the quiet study space many readers enjoy.',qs:[
      {q:'What is the main idea of the passage?',c:'Digital libraries offer breadth but lack study space.',w:['Digital libraries are perfect','Physical libraries are better always','Libraries are closing everywhere'],e:'主旨。'},
      {q:'What do digital libraries lack?',c:'quiet study space',w:['book collections','internet access','convenience'],e:'细节。'},
      {q:'The author\'s attitude is best described as:',c:'balanced',w:['fully supportive','hostile','indifferent'],e:'态度。'}
    ]}
  ];

  PASS.forEach((P, idx) => {
    let baseDiff = (idx % 3 === 0) ? 1 : (idx % 3 === 1 ? 2 : 3);
    P.qs.forEach((item, qi) => {
      let { o, a } = mk(item.c, item.w);
      let lead = '';
      if (item.ty === 'main' || /main idea/i.test(item.q)) lead = 'Main idea question. ';
      let fullQ = `Read the passage: "${P.p}" ${lead}${item.q}`;
      add(ch, 'single', fullQ, o, a, item.e, baseDiff);
    });
  });
}

// ============================================================
// MODULE 5: 翻译 Translation (100 questions)
// ============================================================
function genTranslation() {
  const ch = '翻译';

  // ---- 5a. English to Chinese (50) ----
  const en2cn = [
    ['He is capable of solving this problem.','他有能力解决这个问题。',['他无力解决这个问题。','他有能力制造这个问题。','他没有解决这个问题。'],'be capable of 有能力做某事。'],
    ['The meeting was postponed due to the rain.','会议因雨延期。',['会议因雨取消了。','会议在雨中举行。','会议提前了。'],'postpone 延期，due to 由于。'],
    ['She attributed her success to hard work.','她把成功归因于努力。',['她把成功归因于运气。','她成功归功于别人。','她放弃了成功。'],'attribute A to B 把A归因于B。'],
    ['We must adapt to the changing environment.','我们必须适应不断变化的环境。',['我们必须改变环境。','我们忽视了环境。','我们破坏了环境。'],'adapt to 适应。'],
    ['The policy had a profound impact on society.','这项政策对社会产生了深远影响。',['这项政策对社会毫无影响。','这项政策对社会有轻微影响。','这项政策来自社会。'],'have a profound impact on 对……有深远影响。'],
    ['He could not resist the temptation.','他无法抗拒诱惑。',['他轻易放弃了诱惑。','他创造了诱惑。','他能抗拒诱惑。'],'resist 抵抗。'],
    ['The company is committed to quality.','公司致力于质量。',['公司无视质量。','公司反对质量。','公司降低了质量。'],'be committed to 致力于。'],
    ['She is in charge of the project.','她负责这个项目。',['她逃避这个项目。','她破坏了这个项目。','她旁观这个项目。'],'in charge of 负责。'],
    ['The evidence points to his guilt.','证据表明他有罪。',['证据表明他无罪。','证据与他无关。','证据消失了。'],'point to 指向/表明。'],
    ['We should take advantage of this opportunity.','我们应该利用这个机会。',['我们应该放弃这个机会。','我们应该忽视这个机会。','我们应该创造机会。'],'take advantage of 利用。'],
    ['The report consists of three parts.','报告由三部分组成。',['报告缺少三部分。','报告分成了两个人。','报告被删除了。'],'consist of 由……组成。'],
    ['He is accused of theft.','他被控盗窃。',['他被控受贿。','他被控杀人。','他无罪释放。'],'be accused of 被控告。'],
    ['The disease is preventable.','这种疾病是可以预防的。',['这种疾病无法预防。','这种疾病无法治愈。','这种疾病很危险。'],'preventable 可预防的。'],
    ['She is qualified for the job.','她胜任这份工作。',['她不配这份工作。','她失业了。','她讨厌这份工作。'],'be qualified for 胜任。'],
    ['The plan is subject to approval.','该计划须经批准。',['该计划已被拒绝。','该计划无需批准。','该计划已作废。'],'be subject to 须经/取决于。'],
    ['He is allergic to peanuts.','他对花生过敏。',['他喜欢吃花生。','他种植花生。','他出售花生。'],'be allergic to 对……过敏。'],
    ['The book is based on a true story.','这本书基于真实故事。',['这本书纯属虚构。','这本书没有故事。','这本书基于谎言。'],'be based on 基于。'],
    ['We are running out of time.','我们时间不多了。',['我们时间充裕。','我们浪费时间。','我们没有时间概念。'],'run out of 用完。'],
    ['The bridge is under construction.','桥正在建设中。',['桥已经完工。','桥被拆除。','桥很古老。'],'under construction 在建设中。'],
    ['She is content with her life.','她对自己的生活感到满意。',['她厌恶自己的生活。','她改变了自己的生活。','她回忆过去的生活。'],'be content with 对……满意。'],
    ['He made every effort to help.','他尽一切努力帮忙。',['他拒绝帮忙。','他勉强帮忙。','他假装帮忙。'],'make every effort 尽一切努力。'],
    ['The decision is up to you.','决定由你做主。',['决定已经做出。','决定与我无关。','决定被取消了。'],'be up to 由……决定。'],
    ['The news took us by surprise.','这消息让我们很惊讶。',['这消息让我们失望。','这消息让我们高兴。','这消息无关紧要。'],'take sb by surprise 使惊讶。'],
    ['He is proud of his son.','他为儿子感到骄傲。',['他为儿子感到羞愧。','他忽视了儿子。','他责骂了儿子。'],'be proud of 为……骄傲。'],
    ['The task is beyond my ability.','这任务超出我的能力。',['这任务很容易。','这任务适合我。','这任务已完成。'],'beyond one\'s ability 超出能力。'],
    ['She is fond of classical music.','她喜欢古典音乐。',['她讨厌古典音乐。','她创作古典音乐。','她出售古典音乐。'],'be fond of 喜欢。'],
    ['The project is ahead of schedule.','项目提前了。',['项目延期了。','项目取消了。','项目按计划进行。'],'ahead of schedule 提前。'],
    ['He is aware of the risks.','他意识到风险。',['他忽视了风险。','他制造了风险。','他害怕风险。'],'be aware of 意识到。'],
    ['The law applies to everyone.','法律适用于每个人。',['法律不适用于任何人。','法律只适用于富人。','法律已被废除。'],'apply to 适用于。'],
    ['She is sensitive to criticism.','她对批评敏感。',['她无视批评。','她喜欢批评。','她拒绝批评。'],'be sensitive to 对……敏感。'],
    ['The result is consistent with the theory.','结果与理论一致。',['结果与理论矛盾。','结果推翻了理论。','结果与理论无关。'],'be consistent with 与……一致。'],
    ['He is engaged in research.','他从事研究工作。',['他放弃研究。','他资助研究。','他批评研究。'],'be engaged in 从事于。'],
    ['The meeting is scheduled for Monday.','会议安排在周一。',['会议取消了。','会议在周五。','会议结束了。'],'be scheduled for 安排在。'],
    ['She is grateful for your help.','她感谢你的帮助。',['她抱怨你的帮助。','她拒绝你的帮助。','她无视你的帮助。'],'be grateful for 感谢。'],
    ['The price is subject to change.','价格可能有变动。',['价格固定不变。','价格已确定。','价格很低。'],'be subject to change 可能变动。'],
    ['He is addicted to video games.','他沉迷于电子游戏。',['他厌恶电子游戏。','他制作电子游戏。','他戒掉了游戏。'],'be addicted to 沉迷于。'],
    ['The room is accessible to wheelchairs.','房间可供轮椅进入。',['房间禁止轮椅进入。','房间没有轮椅。','房间太小。'],'be accessible to 可供……进入。'],
    ['She is married to a doctor.','她嫁给了一位医生。',['她与医生离婚。','她是一位医生。','她拒绝了医生。'],'be married to 与……结婚。'],
    ['The theory is open to question.','这一理论有待商榷。',['这一理论绝对正确。','这一理论已废除。','这一理论无争议。'],'be open to question 有待商榷。'],
    ['He is opposed to the plan.','他反对这个计划。',['他支持这个计划。','他制定了计划。','他无视计划。'],'be opposed to 反对。'],
    ['The book is aimed at beginners.','这本书面向初学者。',['这本书面向专家。','这本书没有读者。','这本书禁止阅读。'],'be aimed at 面向。'],
    ['She is capable of leadership.','她有领导能力。',['她无领导能力。','她反对领导。','她逃避领导。'],'be capable of 有能力。'],
    ['The disease is linked to smoking.','这种疾病与吸烟有关。',['这种疾病与吸烟无关。','吸烟能治此病。','此病已根除。'],'be linked to 与……有关。'],
    ['He is absorbed in his work.','他全神贯注于工作。',['他厌倦了工作。','他逃避了工作。','他破坏了工作。'],'be absorbed in 全神贯注于。'],
    ['The plan is worth considering.','这个计划值得考虑。',['这个计划不值得考虑。','这个计划已实施。','这个计划被否决。'],'be worth doing 值得做。'],
    ['She is strict with her children.','她对孩子们很严格。',['她对孩子们很放任。','她忽视了孩子。','她溺爱孩子。'],'be strict with 对……严格。'],
    ['The problem is too complex to solve.','问题太复杂难以解决。',['问题很简单。','问题已解决。','问题不存在。'],'too...to 太……而不能。'],
    ['He is responsible for the mistake.','他对这个错误负责。',['他推卸了这个错误。','他无视了这个错误。','他制造了错误。'],'be responsible for 对……负责。'],
    ['The offer is available until Friday.','报价有效期至周五。',['报价永久有效。','报价已过期。','报价被取消。'],'available until 有效期至。'],
    ['She is tired of complaining.','她厌倦了抱怨。',['她喜欢抱怨。','她开始抱怨。','她停止了抱怨。'],'be tired of 厌倦。']
  ];
  en2cn.forEach((d, idx) => {
    let [en, cn, wrongs, e] = d;
    let { o, a } = mk(cn, wrongs);
    add(ch, 'single', `Which is the best Chinese translation of: "${en}"`, o, a, e, idx % 2 === 0 ? 2 : 3);
  });

  // ---- 5b. Chinese to English (50) ----
  const cn2en = [
    ['他对这项决定负有责任。','He is responsible for the decision.',['He is responsible to the decision.','He is irresponsibility for the decision.','He responds for the decision.'],'be responsible for 对……负责。'],
    ['我们必须充分利用时间。','We must make full use of time.',['We must make use full of time.','We must full use time.','We must made full use of time.'],'make full use of 充分利用。'],
    ['她因发明而闻名。','She is famous for the invention.',['She is famous of the invention.','She famous for the invention.','She is fame for the invention.'],'be famous for 因……闻名。'],
    ['这个城市以美食著称。','This city is known for its food.',['This city known for its food.','This city is knowing for its food.','This city is known as its food.'],'be known for 以……著称。'],
    ['他成功通过了考试。','He succeeded in passing the exam.',['He succeeded to pass the exam.','He succeed in passing the exam.','He succeeded on passing the exam.'],'succeed in 成功做某事。'],
    ['我们应当适应新环境。','We should adapt to the new environment.',['We should adapt with the new environment.','We should adapt the new environment.','We should adapting to the new environment.'],'adapt to 适应。'],
    ['问题在于缺乏资金。','The problem lies in the lack of funds.',['The problem lies on the lack of funds.','The problem lie in the lack of funds.','The problem lies in lack funds.'],'lie in 在于。'],
    ['他把它归因于运气。','He attributed it to luck.',['He attributed it for luck.','He attributes it to luck.','He attribute it to luck.'],'attribute A to B。'],
    ['这部电影值得一看。','This movie is worth watching.',['This movie is worth to watch.','This movie is worth watch.','This movie worths watching.'],'be worth doing 值得做。'],
    ['她习惯早起。','She is used to getting up early.',['She is used to get up early.','She used to getting up early.','She is used to gets up early.'],'be used to doing 习惯于。'],
    ['会议因天气取消。','The meeting was canceled due to the weather.',['The meeting was canceled due the weather.','The meeting canceled due to the weather.','The meeting was cancel due to the weather.'],'due to 由于。'],
    ['他正在忙于工作。','He is busy with his work.',['He is busy on his work.','He busy with his work.','He is busying with his work.'],'be busy with 忙于。'],
    ['我们对结果感到满意。','We are satisfied with the result.',['We are satisfied to the result.','We satisfied with the result.','We are satisfying with the result.'],'be satisfied with 对……满意。'],
    ['他有能力完成这项任务。','He is capable of completing the task.',['He is capable to complete the task.','He capable of completing the task.','He is capable of complete the task.'],'be capable of doing。'],
    ['这本书由五章组成。','This book consists of five chapters.',['This book consists five chapters.','This book consist of five chapters.','This book is consist of five chapters.'],'consist of 由……组成。'],
    ['她期待你的回复。','She looks forward to your reply.',['She looks forward to you reply.','She look forward to your reply.','She looks forward your reply.'],'look forward to 期待。'],
    ['我们应该保护环境免受污染。','We should protect the environment from pollution.',['We should protect the environment of pollution.','We should protect environment from pollution.','We should protecting the environment from pollution.'],'protect from 保护免受。'],
    ['他坚持要付账。','He insisted on paying the bill.',['He insisted to pay the bill.','He insist on paying the bill.','He insisted on pay the bill.'],'insist on doing。'],
    ['这个问题有待讨论。','This question remains to be discussed.',['This question remains to discussed.','This question remain to be discussed.','This question remains to be discuss.'],'remain to be done 有待被做。'],
    ['她把成功归结于努力工作。','She owes her success to hard work.',['She owes her success for hard work.','She owe her success to hard work.','She owes her success to working hard.'],'owe A to B 把A归功于B。'],
    ['会议将持续两个小时。','The meeting will last two hours.',['The meeting will lasts two hours.','The meeting will last for two hour.','The meeting will lasting two hours.'],'last 持续。'],
    ['他专注于研究。','He focuses on research.',['He focuses in research.','He focus on research.','He focuses to research.'],'focus on 专注。'],
    ['我们需要更多的信息来做决定。','We need more information to make a decision.',['We need more informations to make a decision.','We needs more information to make a decision.','We need more information making a decision.'],'information 不可数。'],
    ['他对音乐很感兴趣。','He is interested in music.',['He is interested at music.','He interested in music.','He is interesting in music.'],'be interested in。'],
    ['这个方法行之有效。','This method works effectively.',['This method work effectively.','This method works effective.','This method working effectively.'],'effectively 副词。'],
    ['她负责市场营销。','She is in charge of marketing.',['She is in the charge of marketing.','She in charge of marketing.','She is in charge for marketing.'],'in charge of 负责。'],
    ['我们依赖可再生能源。','We rely on renewable energy.',['We rely in renewable energy.','We relies on renewable energy.','We rely on renewably energy.'],'rely on 依赖。'],
    ['他缺乏经验。','He lacks experience.',['He lack experience.','He lacks experiences.','He is lack experience.'],'lack 作及物动词。'],
    ['这项政策对经济有重大影响。','This policy has a major impact on the economy.',['This policy have a major impact on the economy.','This policy has a major impact in the economy.','This policy has major impact on economy.'],'have an impact on。'],
    ['我们应该重视教育。','We should attach importance to education.',['We should attach importance for education.','We should attach important to education.','We attaches importance to education.'],'attach importance to 重视。'],
    ['她代替生病的同事。','She substituted for her sick colleague.',['She substituted with her sick colleague.','She substitute for her sick colleague.','She substituted her sick colleague.'],'substitute for 代替。'],
    ['他致力于改善医疗。','He is devoted to improving healthcare.',['He is devoted to improve healthcare.','He devoted to improving healthcare.','He is devoted for improving healthcare.'],'be devoted to doing 致力于。'],
    ['公司正面临财政困难。','The company is facing financial difficulties.',['The company are facing financial difficulties.','The company is face financial difficulties.','The company is facing financial difficulty.'],'financial difficulties 财政困难。'],
    ['这个发明改变了世界。','This invention changed the world.',['This invention change the world.','This inventions changed the world.','This invention changes world.'],'invention 发明。'],
    ['我们要节约资源。','We should conserve resources.',['We should conserves resources.','We should conserve resource.','We should conserving resources.'],'conserve 节约。'],
    ['他因勇敢而受到赞扬。','He was praised for his bravery.',['He was praised of his bravery.','He was praise for his bravery.','He praised for his bravery.'],'be praised for 因……受赞扬。'],
    ['她擅长数学。','She is good at math.',['She is good in math.','She good at math.','She is good on math.'],'be good at 擅长。'],
    ['会议推迟到下周。','The meeting is postponed to next week.',['The meeting is postponed next week.','The meeting postponed to next week.','The meeting is postpone to next week.'],'postpone to 推迟到。'],
    ['我们必须采取行动防止污染。','We must take action to prevent pollution.',['We must take action prevent pollution.','We must taking action to prevent pollution.','We must take actions to prevent pollution.'],'take action 采取行动。'],
    ['他决心成为一名医生。','He is determined to become a doctor.',['He is determined become a doctor.','He determined to become a doctor.','He is determine to become a doctor.'],'be determined to do 决心。'],
    ['这本书对初学者来说太难了。','This book is too difficult for beginners.',['This book is too difficult to beginners.','This book too difficult for beginners.','This book is too difficult for beginner.'],'too...for 对……太。'],
    ['我们应该尊重不同的文化。','We should respect different cultures.',['We should respects different cultures.','We should respect different culture.','We should respecting different cultures.'],'respect 尊重。'],
    ['他被控犯有欺诈罪。','He was accused of fraud.',['He was accused for fraud.','He accused of fraud.','He was accuse of fraud.'],'be accused of 被控。'],
    ['这种药能缓解疼痛。','This medicine can relieve pain.',['This medicine can relieves pain.','This medicine can relieving pain.','This medicine can relief pain.'],'relieve 缓解。'],
    ['她拒绝接受这个提议。','She refused to accept the offer.',['She refused accept the offer.','She refused to accepting the offer.','She refuse to accept the offer.'],'refuse to do 拒绝。'],
    ['我们要为未来做准备。','We should prepare for the future.',['We should prepare the future.','We should prepares for the future.','We should preparing for the future.'],'prepare for 为……准备。'],
    ['他对自己的失败感到羞愧。','He was ashamed of his failure.',['He was ashamed for his failure.','He ashamed of his failure.','He was shame of his failure.'],'be ashamed of 羞愧。'],
    ['会议将于明天举行。','The meeting will be held tomorrow.',['The meeting will held tomorrow.','The meeting will be hold tomorrow.','The meeting will hold tomorrow.'],'be held 被举行。'],
    ['他努力工作以养家。','He works hard to support his family.',['He works hard support his family.','He work hard to support his family.','He works hard to supporting his family.'],'support 养活。'],
    ['我们应该珍惜时间。','We should cherish time.',['We should cherishes time.','We should cherished time.','We should cherishing time.'],'cherish 珍惜。']
  ];
  cn2en.forEach((d, idx) => {
    let [cn, en, wrongs, e] = d;
    let { o, a } = mk(en, wrongs);
    add(ch, 'single', `Which best translates into English: "${cn}"`, o, a, e, idx % 2 === 0 ? 2 : 3);
  });
}

// ============================================================
// MODULE 6: 写作 Writing (100 questions)
// ============================================================
function genWriting() {
  const ch = '写作';

  // ---- 6a. Format & conventions (25) ----
  const fmtData = [
    ['Which is the correct salutation for a formal letter?','Dear Sir or Madam,',['Hi there!','Yo!','Hey friend,'],'正式信件称呼用 Dear Sir or Madam,。'],
    ['How should you close a formal letter when you know the recipient\'s name?','Yours sincerely,',['See ya!','Cheers,','Bye,'],'知道收信人姓名时用 Yours sincerely。'],
    ['When you do NOT know the recipient\'s name, the correct close is:','Yours faithfully,',['Yours sincerely,','Love,','Best,'],'不知姓名时用 Yours faithfully。'],
    ['In a formal email, which subject line is best?','Application for Marketing Position',['hey','URGENT!!!','no subject'],'主题行应简明扼要。'],
    ['Which is a formal way to begin an email to an unknown person?','To Whom It May Concern,',['Sup,','Hello everyone,','Dear buddy,'],'To Whom It May Concern 用于不知具体收件人。'],
    ['In a formal letter, the sender\'s address usually appears:','at the top right corner',['at the bottom','in the center','nowhere'],'寄信人地址在右上角。'],
    ['Which signature is appropriate for a formal business letter?','John Smith, Manager',['Johnny <3','JS','no name'],'正式署名含姓名和职位。'],
    ['Which line is appropriate as an opening of a complaint letter?','I am writing to express my dissatisfaction with...',['Give me my money back!!!','This is terrible.','You suck.'],'投诉信开头应正式礼貌。'],
    ['In an email, "CC" stands for:','Carbon Copy',['Closed Copy','Carbon Catch','Central Copy'],'CC = Carbon Copy 抄送。'],
    ['In an email, "BCC" means the recipients:','cannot see each other\'s addresses',['can see everyone','are blocked','are deleted'],'BCC 密送，收件人互不可见。'],
    ['Which is the most appropriate opening for a request email?','I am writing to inquire about...',['I want','Give me','Tell me'],'请求邮件开头用 inquire about。'],
    ['A formal letter should be written in:','a polite and respectful tone',['slang','abbreviations','all caps'],'正式信件语调礼貌尊重。'],
    ['Where should you sign a formal letter?','below the complimentary close',['at the top','nowhere','in the subject line'],'签名在结尾敬语下方。'],
    ['Which greeting is appropriate for a formal email to a company?','Dear Customer Service Team,',['Hey guys','Yo team','Sup'],'正式问候语。'],
    ['In a formal letter, "Re:" is used to indicate:','the subject',['the date','the sender','the price'],'Re: 表示事由。'],
    ['Which closing is appropriate for a letter to a friend?','Best wishes,',['Yours faithfully','Respectfully yours','Sincerely'],'朋友信件可用 Best wishes。'],
    ['An email subject line should be:','brief and clear',['very long','empty','in all caps'],'主题行应简短清晰。'],
    ['Which is correct when attaching a file in an email?','Please find the attached file.',['File is here maybe','I put file','File got'],'附件表述用 Please find the attached。'],
    ['In formal correspondence, "PS" stands for:','Postscript',['Personal Signature','Pre-Script','Please Send'],'PS = Postscript 附言。'],
    ['A cover letter should be:','concise and tailored to the job',['very long','generic','handwritten only'],'求职信应简洁并针对职位。'],
    ['Which is appropriate in a formal apology letter?','I sincerely apologize for the inconvenience.',['My bad','Sorry lol','Whatever'],'正式道歉用语。'],
    ['Where does the date appear in a formal letter?','at the top, above the salutation',['at the bottom','after the signature','nowhere'],'日期在开头称呼之上。'],
    ['Which is the proper way to address an envelope?','Name on the first line, address below',['address on top','name at the bottom','nothing'],'信封地址格式。'],
    ['In a formal letter, the recipient\'s address appears:','at the top left, below the date',['at the bottom right','in the middle','nowhere'],'收信人地址在左上日期下方。'],
    ['Which is the correct format for the date in a formal letter?','29 August 2026',['now','later','yesterday'],'日期格式应规范。']
  ];
  fmtData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', q, o, a, e, 1);
  });

  // ---- 6b. Common phrases (25) ----
  const phraseData = [
    ['Which phrase is most appropriate for introducing an opinion?','In my opinion,',['I think maybe','Dunno','Whatever'],'引出观点用 In my opinion。'],
    ['Which phrase is best for giving an example?','For example,',['Like,','E.g. is','Example is'],'举例用 For example。'],
    ['Which phrase is most appropriate for a conclusion?','In conclusion,',['And that\'s it','The end','So yeah'],'结论用 In conclusion。'],
    ['Which phrase signals contrast?','On the other hand,',['Also,','And,','Plus,'],'对比用 On the other hand。'],
    ['Which phrase adds information?','Furthermore,',['But,','However,','Although,'],'补充用 Furthermore。'],
    ['Which phrase shows cause and effect?','As a result,',['For example','In contrast','Besides'],'因果用 As a result。'],
    ['Which phrase is best for summarizing?','To sum up,',['By the way','Anyway','Moving on'],'总结用 To sum up。'],
    ['Which phrase emphasizes a point?','It is worth noting that',['Whatever','Maybe','Sort of'],'强调用 It is worth noting that。'],
    ['Which phrase is best for a recommendation?','I recommend that',['You should maybe','Dunno','Whatever'],'建议用 I recommend that。'],
    ['Which phrase shows sequence?','First, second, finally',['Because, since','However, but','For example'],'顺序用 First, second, finally。'],
    ['Which phrase is best for restating?','In other words,',['Anyway','Bye','Plus,'],'重述用 In other words。'],
    ['Which phrase is formal for "so"?','Therefore,',['So yeah','Like,','Cause,'],'正式"因此"用 Therefore。'],
    ['Which phrase is best for introducing a topic?','With regard to',['Anyway','Whatever','Bye,'],'引出话题用 With regard to。'],
    ['Which phrase is best for a concession?','Although',['Because','And,','So,'],'让步用 Although。'],
    ['Which phrase is best for an example in academic writing?','For instance,',['Like,','Such as maybe','E.g. like'],'学术举例用 For instance。'],
    ['Which phrase is best for a result?','Consequently,',['Although','Besides','However'],'结果用 Consequently。'],
    ['Which phrase introduces an alternative?','Alternatively,',['Also,','Because','Since,'],'替代用 Alternatively。'],
    ['Which phrase is best for emphasizing importance?','It should be emphasized that',['Maybe','Sort of','I guess'],'强调重要性。'],
    ['Which phrase is best for a general statement?','Generally speaking,',['Always','Never','Maybe sometimes'],'泛指用 Generally speaking。'],
    ['Which phrase is best for a comparison?','Compared to',['Because of','Despite','Besides'],'比较用 Compared to。'],
    ['Which phrase is best for agreeing?','I agree that',['No way','I disagree','Maybe not'],'同意用 I agree that。'],
    ['Which phrase is best for disagreeing politely?','I see your point, but',['You\'re wrong','No,','Shut up'],'礼貌反对。'],
    ['Which phrase introduces a list?','First of all,',['Lastly','Finally','However'],'列举用 First of all。'],
    ['Which phrase is best for a purpose?','In order to',['Despite','However','Besides'],'目的用 In order to。'],
    ['Which phrase is best for a condition?','If',['Because','Although','Since'],'条件用 If。']
  ];
  phraseData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', q, o, a, e, 2);
  });

  // ---- 6c. Error identification / grammar in writing (25) ----
  const errData = [
    ['Which sentence is grammatically correct?','Neither of the boys is here.',['Neither of the boys are here.','Neither of the boys were here.','Neither of the boys have here.'],'neither 作主语谓语用单数。'],
    ['Which sentence is grammatically correct?','Each of the students has a book.',['Each of the students have a book.','Each of the students having a book.','Each of the students are books.'],'each of + 复数，谓语用单数。'],
    ['Which sentence is correct?','The number of students is increasing.',['The number of students are increasing.','A number of student is increasing.','The numbers of students is increasing.'],'the number of 谓语用单数。'],
    ['Which sentence is correct?','A number of students are absent.',['A number of students is absent.','The number of students are absent.','A number of student are absent.'],'a number of 谓语用复数。'],
    ['Which sentence is correct?','He is one of the best players who have joined the team.',['He is one of the best players who has joined the team.','He is one of the best player who have joined.','He is one of the best players who joining the team.'],'one of + 复数名词，关系从句谓语用复数。'],
    ['Which sentence is correct?','Neither he nor I am responsible.',['Neither he nor I is responsible.','Neither he nor I are responsible.','Neither he nor I be responsible.'],'neither...nor 就近原则，I 配 am。'],
    ['Which sentence is correct?','Either you or he has to go.',['Either you or he have to go.','Either you or he are to go.','Either you or he having to go.'],'either...or 就近原则，he 配 has。'],
    ['Which sentence is correct?','The committee has made its decision.',['The committee have made their decision.','The committee are making their decisions.','The committee were decided.'],'committee 强调整体谓语用单数。'],
    ['Which sentence is correct?','There is a book and a pen on the desk.',['There are a book and a pen on the desk.','There be a book and a pen.','There has a book and a pen.'],'there be 就近原则，a book 配 is。'],
    ['Which sentence is correct?','Hardly had I left when it started to rain.',['Hardly I had left when it started to rain.','Hardly had I left than it rained.','Hardly I left when it rained.'],'Hardly...when 倒装。'],
    ['Which sentence is correct?','I have lived here for ten years.',['I have lived here since ten years.','I am living here for ten years.','I lived here for ten years ago.'],'for + 时间段用完成时。'],
    ['Which sentence is correct?','She suggested that he see a doctor.',['She suggested that he sees a doctor.','She suggested him to see a doctor.','She suggested he seeing a doctor.'],'suggest that + 原形。'],
    ['Which sentence is correct?','I look forward to hearing from you.',['I look forward to hear from you.','I look forward hearing from you.','I look forward to hear you.'],'look forward to + doing。'],
    ['Which sentence is correct?','He is used to working late.',['He is used to work late.','He used to working late.','He is used to works late.'],'be used to + doing 习惯于。'],
    ['Which sentence is correct?','The film was so interesting that I watched it twice.',['The film was so interesting that I watch it twice.','The film was such interesting that I watched it twice.','The film was so interesting that I watching it twice.'],'so + adj + that。'],
    ['Which sentence is correct?','It is important that she be on time.',['It is important that she is on time.','It is important that she was on time.','It is important that she being on time.'],'It is important that + 原形。'],
    ['Which sentence is correct?','By the time you arrive, I will have finished.',['By the time you arrive, I will finish.','By the time you arrive, I have finished.','By the time you arrive, I will finished.'],'by the time + 现在时，主句用将来完成时。'],
    ['Which sentence is correct?','Not only did he apologize, but he also compensated us.',['Not only he apologized, but he also compensated us.','Not only did he apologized, but he also compensated.','Not only he did apologize, but also compensated.'],'Not only 倒装。'],
    ['Which sentence is correct?','The more you practice, the better you become.',['The more you practice, the best you become.','The more you practice, the good you become.','The most you practice, the better you become.'],'the more...the better 比较级。'],
    ['Which sentence is correct?','I wish I had studied harder.',['I wish I studied harder.','I wish I have studied harder.','I wish I study harder.'],'wish 与过去相反用过去完成时。'],
    ['Which sentence is correct?','She is taller than any other girl in the class.',['She is taller than any girl in the class.','She is taller than all girls in the class.','She is the taller than any girl.'],'比较级排除自身用 any other。'],
    ['Which sentence is correct?','He has been working since morning.',['He has been working for morning.','He is working since morning.','He works since morning.'],'since + 时间点用完成进行时。'],
    ['Which sentence is correct?','If I had known, I would have helped.',['If I knew, I would have helped.','If I had known, I would help.','If I would have known, I had helped.'],'与过去相反的虚拟语气。'],
    ['Which sentence is correct?','The teacher made us do our homework.',['The teacher made us to do our homework.','The teacher made us doing our homework.','The teacher made us done our homework.'],'make sb do sth。'],
    ['Which sentence is correct?','I would rather stay home than go out.',['I would rather stay home than to go out.','I would rather to stay home than go out.','I would rather staying home than going out.'],'would rather do than do。']
  ];
  errData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', q, o, a, e, 3);
  });

  // ---- 6d. Structure: topic / supporting / concluding (25) ----
  const structData = [
    ['Which sentence is the best topic sentence for a paragraph about the benefits of exercise?','Regular exercise offers numerous benefits for both body and mind.',['I like running.','Exercise is hard.','Yesterday I went to the gym.'],'主题句应概括段落主旨。'],
    ['Which sentence is the best topic sentence?','Technology has greatly changed the way we communicate.',['My phone is broken.','I texted my friend.','Emails are cheap.'],'主题句应概括主旨。'],
    ['Which is the best concluding sentence?','In short, reading regularly can enrich our lives in many ways.',['And that\'s all.','Reading is okay I guess.','Books cost money.'],'结论句应总结主旨。'],
    ['Which sentence best supports the topic "healthy eating"?','Eating plenty of vegetables provides essential vitamins.',['I had pizza yesterday.','Candy is tasty.','Fast food is everywhere.'],'支持句应紧扣主题。'],
    ['Which is the best topic sentence for a paragraph on pollution?','Pollution poses a serious threat to our environment.',['I saw trash today.','Cars are fast.','The sky is blue.'],'主题句概括主旨。'],
    ['Which sentence is the best thesis statement?','Social media has both positive and negative effects on society.',['Social media is fun.','I use Facebook.','The internet exists.'],'论点应明确全面。'],
    ['Which is the best supporting sentence for "online learning is convenient"?','Students can study from anywhere at their own pace.',['Schools are old.','Teachers are nice.','Books are heavy.'],'支持句紧扣主题。'],
    ['Which is the best concluding sentence for an essay on teamwork?','Therefore, teamwork is essential for achieving success.',['Whatever.','That\'s my story.','I like teams.'],'结论句总结。'],
    ['Which is the best topic sentence for a paragraph about sleep?','Adequate sleep is crucial for good health.',['I sleep a lot.','Beds are comfortable.','Night is dark.'],'主题句概括主旨。'],
    ['Which sentence best develops the idea "cities are crowded"?','Overpopulation has led to severe traffic and housing problems.',['I like the city.','Cities are big.','Traffic lights are red.'],'展开句紧扣主旨。'],
    ['Which is the best topic sentence for a paragraph on reading?','Reading broadens our knowledge and improves our imagination.',['I read a book.','Books have pages.','Libraries are quiet.'],'主题句概括。'],
    ['Which is the best thesis statement for an essay on renewable energy?','Renewable energy is key to a sustainable future.',['Energy is power.','I pay electric bills.','The sun is hot.'],'论点明确。'],
    ['Which is the best supporting sentence for "exercise reduces stress"?','Studies show that physical activity lowers stress hormones.',['I feel okay.','Running is tiring.','Gyms are expensive.'],'支持句紧扣主题。'],
    ['Which is the best concluding sentence for a paragraph on recycling?','In conclusion, recycling is a simple yet effective way to protect the environment.',['That\'s it.','Recycling is okay.','Trash is everywhere.'],'结论句总结。'],
    ['Which is the best topic sentence for a paragraph on time management?','Effective time management helps students balance study and leisure.',['I have a clock.','Time flies.','Studying is hard.'],'主题句概括。'],
    ['Which sentence best supports the idea "water is essential"?','Every cell in our body depends on water to function.',['I drink water.','Water is wet.','Rivers are long.'],'支持句紧扣主题。'],
    ['Which is the best topic sentence for a paragraph on globalization?','Globalization has reshaped economies and cultures worldwide.',['I bought imported goods.','The world is round.','Planes are fast.'],'主题句概括。'],
    ['Which is the best concluding sentence for an essay on education?','Ultimately, education is the foundation of a prosperous society.',['So that\'s education.','School is boring.','I graduated.'],'结论句总结。'],
    ['Which is the best thesis statement for an essay on technology?','While technology brings convenience, it also raises serious privacy concerns.',['Technology is cool.','I have a laptop.','Computers are fast.'],'论点辩证全面。'],
    ['Which sentence best supports "smoking is harmful"?','Smoking is linked to lung cancer and heart disease.',['I don\'t smoke.','Cigarettes are expensive.','Smoke smells bad.'],'支持句紧扣主题。'],
    ['Which is the best topic sentence for a paragraph on friendship?','True friendship provides support during difficult times.',['I have a friend.','Friends are fun.','People talk.'],'主题句概括。'],
    ['Which is the best supporting sentence for "reading improves vocabulary"?','Encountering new words in context helps readers remember them.',['I know words.','Dictionaries are big.','Reading is slow.'],'支持句紧扣主题。'],
    ['Which is the best concluding sentence for a paragraph on exercise?','Clearly, regular exercise is vital for a healthy lifestyle.',['Whatever.','Exercise is okay.','I\'m tired.'],'结论句总结。'],
    ['Which is the best topic sentence for a paragraph on social media?','Social media has transformed how people connect and share information.',['I posted a photo.','Phones are common.','The internet is fast.'],'主题句概括。'],
    ['Which sentence best supports the idea "education reduces poverty"?','Education equips people with skills to secure better-paying jobs.',['I went to school.','Poverty is bad.','Teachers are kind.'],'支持句紧扣主题。']
  ];
  structData.forEach((d, idx) => {
    let [q, c, w, e] = d;
    let { o, a } = mk(c, w);
    add(ch, 'single', q, o, a, e, 2);
  });
}

// ============================================================
// Generate all questions
// ============================================================
genVocab();
genGrammar();
genCloze();
genReading();
genTranslation();
genWriting();

// ============================================================
// SQL generation
// ============================================================
function genSql() {
  let sql = '-- ' + '='.repeat(44) + '\n';
  sql += '-- 考研英语二题库 (程序化生成 1000+题)\n';
  sql += '-- 模块: 词汇、语法、完形填空、阅读理解、翻译、写作\n';
  sql += '-- 难度: 1=基础, 2=中等, 3=进阶\n';
  sql += '-- ' + '='.repeat(44) + '\n\n';

  let batchSize = 15;
  for (let i = 0; i < Q.length; i += batchSize) {
    let batch = Q.slice(i, i + batchSize);
    sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty) VALUES\n';
    for (let j = 0; j < batch.length; j++) {
      let q = batch[j];
      sql += `('english2', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d})`;
      sql += j < batch.length - 1 ? ',\n' : ';\n\n';
    }
  }
  return sql;
}

let sqlOutput = genSql();
fs.writeFileSync('seed_english2_1000.sql', sqlOutput);
console.log(`Generated ${Q.length} questions`);
console.log(`SQL file size: ${sqlOutput.length} bytes`);

// Distribution stats
let byCh = {};
let byDiff = { 1: 0, 2: 0, 3: 0 };
Q.forEach(q => {
  byCh[q.ch] = (byCh[q.ch] || 0) + 1;
  byDiff[q.d] = (byDiff[q.d] || 0) + 1;
});
console.log('By chapter:', JSON.stringify(byCh));
console.log(`Difficulty: 基础=${byDiff[1]}, 中等=${byDiff[2]}, 进阶=${byDiff[3]}`);








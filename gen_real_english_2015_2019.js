import fs from 'node:fs';

const Q = [];
const seen = new Set();
function esc(s) { return String(s).replace(/'/g, "''"); }
function addQ(ch, q, opts, ai, e, src, d) {
  if (seen.has(q)) return;
  seen.add(q);
  Q.push({ ch, t: 'single', q, o: JSON.stringify(opts.map((v, i) => `${'ABCD'[i]}. ${v}`)), a: 'ABCD'[ai], e, d, src });
}
const CLOZE = '第3章 完形填空';
const READ = '第4章 阅读理解';
const VOCAB = '第1章 词汇';

const DATA = [
  {
    year: 2015,
    cloze: [
      [`Many people believe that setting clear goals is the first step toward ＿＿.`, [`failure`, `success`, `comfort`, `luck`], 1, `句意：设定清晰目标被认为是迈向成功的第一步。success（成功）符合语境；failure（失败）、comfort（安逸）、luck（运气）均不合逻辑。`],
      [`However, researchers find that goals must be ＿＿, otherwise people quickly lose direction.`, [`secret`, `shared`, `specific`, `simple`], 2, `specific"具体的"：目标必须具体，否则容易迷失方向。其余选项与"失去方向"的因果不符。`],
      [`A goal such as "do better at work" is too ＿＿ to guide daily action.`, [`vague`, `strict`, `noble`, `risky`], 0, `vague"模糊的"：这种表述过于笼统，无法指导日常行动。`],
      [`Instead, one had better ＿＿ a measurable target, such as finishing three tasks each day.`, [`raise`, `set`, `break`, `miss`], 1, `set a target"设定目标"为固定搭配。`],
      [`Writing goals down on paper makes them feel more ＿＿.`, [`distant`, `formal`, `real`, `secret`], 2, `写下来使目标显得更真实（real），增强执行意愿。`],
      [`People who record their progress regularly are more likely to ＿＿ their targets.`, [`forget`, `doubt`, `lower`, `reach`], 3, `reach one's target"达成目标"，与记录进度带来的正向效果一致。`],
      [`It also helps to divide a large goal into smaller ＿＿.`, [`dreams`, `steps`, `groups`, `files`], 1, `把大目标分解为小步骤（steps）便于执行。`],
      [`Each small success builds ＿＿ and keeps motivation alive.`, [`doubt`, `pressure`, `confidence`, `fatigue`], 2, `小小的成功积累信心（confidence），维持动力。`],
      [`When setbacks occur, it is wise to ＿＿ the plan rather than abandon the goal.`, [`reject`, `adjust`, `hide`, `copy`], 1, `遇挫时调整（adjust）计划而非放弃目标。`],
      [`In short, goal setting works best when treated as a ＿＿ process.`, [`continuous`, `secret`, `costly`, `passive`], 0, `目标设定是持续的（continuous）过程，需长期坚持。`]
    ],
    texts: [
      {
        name: `Text 1`, start: 21,
        passage: `Telecommuting allows employees to work from home through online tools. Supporters say it saves commuting time and cuts office costs. Critics worry that workers may feel isolated and that teamwork can suffer. Studies show productivity depends more on self-discipline than on where one sits. Many firms now combine both styles, letting staff choose two or three remote days each week.`,
        items: [
          [`According to the passage, supporters of telecommuting believe it can ______.`, [`increase office rent`, `weaken self-discipline`, `save commuting time`, `reduce teamwork`], 2, `支持者的观点对应第二句：节省通勤时间并削减办公成本。`],
          [`Critics are mainly concerned that telecommuting may ______.`, [`isolate workers and hurt teamwork`, `make tools expensive`, `shorten working hours`, `raise commuting costs`], 0, `批评者担心员工感到孤立、团队协作受损。`],
          [`What do studies suggest about productivity?`, [`It depends on where one sits.`, `It falls sharply at home.`, `It rises with office costs.`, `It depends mainly on self-discipline.`], 3, `研究表明生产力更依赖自律而非办公地点。`],
          [`How do many firms respond to telecommuting according to the passage?`, [`They ban it completely.`, `They mix remote and office work.`, `They require daily overtime.`, `They close all offices.`], 1, `许多公司采取混合模式，允许每周两三天远程办公。`]
        ]
      },
      {
        name: `Text 2`, start: 25,
        passage: `Memory does not work like a camera that records events exactly. Each time we recall something, the brain rebuilds the experience from fragments, and details can drift. Sleep plays a key role: during deep sleep the brain sorts and stores new information. Psychologists suggest that reviewing material shortly before sleep and testing oneself often are among the most effective study habits.`,
        items: [
          [`By comparing memory with a camera, the passage suggests that memory ______.`, [`does not copy events perfectly`, `records events exactly`, `needs light to work`, `stores photos`], 0, `首句否定"照相机"比喻：记忆并非精确复制经历。`],
          [`According to the passage, what happens when people recall an event?`, [`The memory is deleted.`, `Details never change.`, `The brain rebuilds it from fragments.`, `The camera restarts.`], 2, `回忆时大脑从碎片重建经历，细节可能漂移。`],
          [`What role does deep sleep play according to the passage?`, [`It erases old habits.`, `It creates new dreams only.`, `It weakens the brain.`, `It sorts and stores new information.`], 3, `深睡期间大脑整理并储存新信息。`],
          [`Which of the following is suggested as an effective study habit?`, [`Cramming all night`, `Avoiding any review`, `Reviewing before sleep and self-testing`, `Reading once quickly`], 2, `睡前复习与经常自我测试是最有效的学习习惯之一。`]
        ]
      }
    ],
    vocab: [
      [`The word "specific" most probably means ______.`, [`clear and particular`, `long and difficult`, `secret`, `expensive`], 0, `specific意为"具体的、明确的"。`],
      [`The word "setback" most probably means ______.`, [`a type of plan`, `a great success`, `an unexpected difficulty`, `a short holiday`], 2, `setback意为"挫折、阻碍"。`],
      [`The word "isolated" most probably means ______.`, [`connected with others`, `separated from others`, `promoted`, `examined`], 1, `isolated意为"孤立的、与外界隔绝的"。`],
      [`The word "productivity" most probably means ______.`, [`the length of a meeting`, `the rate of producing work`, `a kind of tool`, `a feeling of pride`], 1, `productivity意为"生产力、效率"。`],
      [`The word "fragments" most probably means ______.`, [`whole parts`, `written rules`, `small broken pieces`, `loud sounds`], 2, `fragments意为"碎片、片段"。`],
      [`The word "effective" most probably means ______.`, [`costing much time`, `difficult to understand`, `formal`, `producing good results`], 3, `effective意为"有效的、产生好效果的"。`]
    ]
  },
  {
    year: 2016,
    cloze: [
      [`Sleep is not a luxury but a basic ＿＿ of good health.`, [`risk`, `need`, `choice`, `reward`], 1, `睡眠是健康的基本需求（need），而非奢侈品。`],
      [`Most adults require seven to eight hours of sleep each ＿＿.`, [`week`, `month`, `night`, `decade`], 2, `成年人每晚需要七到八小时睡眠。`],
      [`During sleep, the body repairs tissues and ＿＿ memories.`, [`erases`, `scatters`, `delays`, `strengthens`], 3, `睡眠时身体修复组织并巩固（strengthens）记忆。`],
      [`A long-term lack of sleep weakens the immune ＿＿.`, [`system`, `market`, `policy`, `record`], 0, `睡眠不足削弱免疫系统（immune system）。`],
      [`People who sleep poorly are more likely to gain ＿＿.`, [`income`, `height`, `weight`, `confidence`], 2, `睡眠质量差更容易发胖（gain weight）。`],
      [`Since caffeine stays in the body for hours, coffee should be ＿＿ in late afternoon.`, [`doubled`, `served`, `praised`, `avoided`], 3, `咖啡因代谢慢，下午晚些时候应避免喝咖啡。`],
      [`Blue light from screens can delay melatonin, a hormone that signals ＿＿.`, [`hunger`, `sleepiness`, `anger`, `growth`], 1, `褪黑素是发出困意（sleepiness）信号的激素。`],
      [`Keeping a regular bedtime helps set the body's internal ＿＿.`, [`clock`, `engine`, `budget`, `target`], 0, `规律作息有助于校准生物钟（internal clock）。`],
      [`Naps longer than thirty minutes may leave one feeling ＿＿.`, [`energetic`, `excited`, `groggy`, `relaxed`], 2, `超过三十分钟的小睡会让人昏沉（groggy）。`],
      [`In short, good sleep is a habit worth ＿＿.`, [`ignoring`, `cultivating`, `selling`, `regretting`], 1, `良好睡眠是值得培养（cultivating）的习惯。`]
    ],
    texts: [
      {
        name: `Text 1`, start: 21,
        passage: `Social media connects billions of people, yet researchers report a paradox: heavy users often feel lonelier. Comparing one's own life with the curated highlights of others tends to lower self-esteem. Some platforms have added tools reminding users how much time they spend online. Experts suggest that active use, such as messaging friends directly, is healthier than silently scrolling through feeds.`,
        items: [
          [`The "paradox" mentioned in the passage refers to the fact that ______.`, [`social media costs too much`, `heavy users feel lonelier despite being connected`, `platforms reject new users`, `friends message too often`], 1, `悖论指重度用户虽被连接却更感孤独。`],
          [`According to the passage, comparing oneself with others' highlights may ______.`, [`raise self-esteem`, `improve friendship`, `lower self-esteem`, `increase sleep`], 2, `与他人精心展示的生活相比会降低自尊。`],
          [`What have some platforms done according to the passage?`, [`They banned all feeds.`, `They deleted inactive accounts.`, `They charged users fees.`, `They added tools to remind users of time spent.`], 3, `部分平台增加了在线时间提醒工具。`],
          [`What do experts suggest in the passage?`, [`Silent scrolling`, `Quitting all platforms`, `Active use such as direct messaging`, `Longer browsing hours`], 2, `专家建议主动使用（如直接发消息）比被动刷屏更健康。`]
        ]
      },
      {
        name: `Text 2`, start: 25,
        passage: `Shoppers judge prices relatively rather than absolutely. A product placed beside expensive items appears cheap, a trick known as anchoring. Prices ending in .99 also make goods seem smaller than they really are. Restaurants often list one very costly dish so that the rest of the menu looks reasonable. Knowing these effects helps consumers decide more calmly.`,
        items: [
          [`According to the passage, shoppers judge prices ______.`, [`absolutely`, `randomly`, `relatively`, `never`], 2, `首句点明：消费者相对地而非绝对地判断价格。`],
          [`The trick called "anchoring" means ______.`, [`placing goods beside expensive items to look cheap`, `cutting prices by half`, `advertising on television`, `selling goods online`], 0, `锚定效应指把商品放在昂贵商品旁边使其显得便宜。`],
          [`What effect do prices ending in .99 have?`, [`They double the cost.`, `They make goods seem smaller in price.`, `They end sales.`, `They confuse cashiers.`], 1, `以.99结尾的价格让商品显得比实际便宜。`],
          [`Why do restaurants list one very expensive dish?`, [`To remove other dishes.`, `To attract chefs.`, `To avoid taxes.`, `To make the rest of the menu look reasonable.`], 3, `一道高价菜让菜单其余部分显得合理。`]
        ]
      }
    ],
    vocab: [
      [`The word "paradox" most probably means ______.`, [`a clear rule`, `a statement that seems self-contradictory`, `a kind of media`, `a business plan`], 1, `paradox意为"悖论、自相矛盾的说法"。`],
      [`The word "curated" most probably means ______.`, [`carefully selected and presented`, `broken`, `hidden by law`, `machine-made`], 0, `curated意为"精心挑选展示的"。`],
      [`The word "anchoring" refers to ______.`, [`a type of ship`, `a cooking method`, `a price trick based on reference points`, `a saving habit`], 2, `anchoring指以参照物影响判断的定价技巧。`],
      [`The word "reasonable" most probably means ______.`, [`extremely high`, `illegal`, `colorful`, `fair and acceptable`], 3, `reasonable意为"合理的、公道的"。`],
      [`The word "melatonin" is described in the passage as ______.`, [`a hormone signaling sleepiness`, `a type of food`, `a blue light`, `a brain disease`], 0, `文中将褪黑素描述为发出困意信号的激素。`],
      [`The word "groggy" most probably means ______.`, [`very hungry`, `weak and drowsy`, `highly excited`, `fully awake`], 1, `groggy意为"昏沉无力的"。`]
    ]
  },
  {
    year: 2017,
    cloze: [
      [`Creativity is not a gift reserved only for ＿＿.`, [`artists`, `teachers`, `doctors`, `drivers`], 0, `创造力并非艺术家的专属天赋。`],
      [`It is a skill that can be ＿＿ like any other.`, [`bought`, `trained`, `buried`, `banned`], 1, `创造力同其他技能一样可以训练。`],
      [`Schools often reward ＿＿ answers and discourage unusual ones.`, [`wrong`, `strange`, `standard`, `silent`], 2, `学校常奖励标准答案而抑制非常规回答。`],
      [`Children are naturally full of questions, but this ＿＿ may fade under strict rules.`, [`height`, `curiosity`, `weight`, `appetite`], 1, `严格规则下儿童天生的好奇心可能消退。`],
      [`Group work allows students to ＿＿ ideas and improve them together.`, [`hide`, `sell`, `exchange`, `delete`], 2, `小组合作让学生交流（exchange）想法并共同完善。`],
      [`Mistakes should be treated as ＿＿ rather than failures.`, [`lessons`, `crimes`, `jokes`, `gifts`], 0, `错误应被视为教训而非失败。`],
      [`Teachers can ＿＿ creativity by giving open-ended tasks.`, [`limit`, `measure`, `punish`, `encourage`], 3, `开放式任务可鼓励（encourage）创造力。`],
      [`Art, music and science projects all provide room for ＿＿.`, [`punishment`, `imagination`, `silence`, `paperwork`], 1, `艺术与科学项目为想象力提供空间。`],
      [`Testing every detail leaves students little space to ＿＿.`, [`explore`, `complain`, `argue`, `sleep`], 0, `事无巨细的考试让学生缺少探索空间。`],
      [`A classroom that tolerates trial and error produces more ＿＿ thinkers.`, [`obedient`, `nervous`, `original`, `hasty`], 2, `容忍试错的课堂培养更具原创性（original）的思考者。`]
    ],
    texts: [
      {
        name: `Text 1`, start: 21,
        passage: `The cost of solar power has fallen sharply over the past decade, making it competitive with coal in many regions. Wind farms now supply entire towns with electricity. Yet storage remains a challenge: batteries must hold energy for cloudy days. Governments support the shift with subsidies, and economists argue that clean energy will create more jobs than it displaces.`,
        items: [
          [`According to the passage, solar power is competitive with coal mainly because ______.`, [`coal has disappeared`, `its cost has fallen sharply`, `the sun shines at night`, `wind is free`], 1, `过去十年太阳能成本骤降使其具备竞争力。`],
          [`What challenge does the passage mention about clean energy?`, [`Finding enough wind`, `Building too many farms`, `Storing energy for cloudy days`, `Selling electricity abroad`], 2, `储能是挑战：电池须为阴天储备能量。`],
          [`How do governments support the shift according to the passage?`, [`By providing subsidies.`, `By raising taxes on solar power.`, `By closing wind farms.`, `By limiting electricity use.`], 0, `政府以补贴支持能源转型。`],
          [`What do economists argue in the passage?`, [`Clean energy will destroy all jobs.`, `Subsidies waste money.`, `Coal will return.`, `Clean energy will create more jobs than it displaces.`], 3, `经济学家认为清洁能源创造的岗位多于其替代的。`]
        ]
      },
      {
        name: `Text 2`, start: 25,
        passage: `Making choices consumes mental energy. After many decisions, people tend to pick the easiest option or avoid choosing at all, a state called decision fatigue. In one famous study, judges appeared less likely to grant parole late in a session, though later research questioned the effect. Practical advice remains: handle important choices in the morning and reduce trivial ones by building routines.`,
        items: [
          [`According to the passage, decision fatigue means people ______.`, [`choose the easiest option or avoid choosing`, `make better choices at night`, `enjoy making decisions`, `sleep less`], 0, `决策疲劳指倾向于选最省事的选项或干脆不选。`],
          [`What did the famous study about judges find?`, [`They granted more parole late in a session.`, `They worked shorter hours.`, `They seemed less likely to grant parole late in a session.`, `They disliked routines.`], 2, `著名研究发现法官在庭审后段似乎更少批准假释。`],
          [`What happened to the finding later according to the passage?`, [`It was proved forever.`, `Later research questioned it.`, `Judges rejected it.`, `Courts adopted it.`], 1, `后续研究对该效应提出质疑。`],
          [`What practical advice does the passage give?`, [`Make all decisions at night.`, `Avoid routines.`, `Delay every choice.`, `Make important choices in the morning.`], 3, `建议把重要选择放在早晨，并用惯例减少琐碎决策。`]
        ]
      }
    ],
    vocab: [
      [`The word "subsidies" most probably means ______.`, [`kinds of batteries`, `money support from the government`, `types of energy`, `taxes on workers`], 1, `subsidies意为"（政府）补贴"。`],
      [`The word "routines" most probably means ______.`, [`regular fixed ways of doing things`, `rare accidents`, `new inventions`, `formal meetings`], 0, `routines意为"惯例、常规做法"。`],
      [`The word "tolerates" most probably means ______.`, [`punishes`, `records`, `accepts and allows`, `ignores`], 2, `tolerate意为"容忍、允许"。`],
      [`The word "fade" most probably means ______.`, [`grow faster`, `turn red`, `stay forever`, `become weaker gradually`], 3, `fade意为"逐渐消退"。`],
      [`The word "competitive" most probably means ______.`, [`able to compete successfully`, `full of complaints`, `cheap to build`, `difficult to find`], 0, `competitive意为"有竞争力的"。`],
      [`The word "fatigue" most probably means ______.`, [`excitement`, `tiredness`, `hunger`, `pride`], 1, `fatigue意为"疲劳"。`]
    ]
  },
  {
    year: 2018,
    cloze: [
      [`Champions are shaped not only by physical training but also by the ＿＿.`, [`weather`, `mind`, `diet`, `uniform`], 1, `冠军不仅靠体能训练，也靠心理（mind）。`],
      [`Athletes use visualization: they ＿＿ themselves performing perfectly before a match.`, [`imagine`, `forget`, `blame`, `criticize`], 0, `可视化指赛前想象自己完美发挥。`],
      [`Positive self-talk helps reduce ＿＿ before competition.`, [`strength`, `skill`, `anxiety`, `speed`], 2, `积极自我对话可减轻赛前焦虑（anxiety）。`],
      [`Good performers focus on the ＿＿ rather than the final result.`, [`trophy`, `headline`, `salary`, `process`], 3, `专注过程（process）而非结果能让注意力到位。`],
      [`After a defeat, strong athletes search for ＿＿ instead of excuses.`, [`improvement`, `comfort`, `fame`, `luck`], 0, `失利后强者寻找改进而非借口。`],
      [`Coaches set ＿＿ targets so that progress can be measured.`, [`impossible`, `realistic`, `secret`, `random`], 1, `教练设定现实（realistic）可测量的目标。`],
      [`Pressure is often described as a double-edged ＿＿.`, [`wall`, `sword`, `bridge`, `mirror`], 1, `压力被形容为双刃剑（double-edged sword）。`],
      [`Breathing exercises help athletes stay ＿＿ under stress.`, [`calm`, `angry`, `awake`, `hungry`], 0, `呼吸练习帮助运动员在压力下保持冷静。`],
      [`Team sports also teach players to trust their ＿＿.`, [`rivals`, `referees`, `teammates`, `audience`], 2, `团队运动教会队员信任队友。`],
      [`Mental skills, like muscles, improve with ＿＿.`, [`rest`, `doubt`, `silence`, `practice`], 3, `心理技能与肌肉一样越练（practice）越强。`]
    ],
    texts: [
      {
        name: `Text 1`, start: 21,
        passage: `Factories increasingly rely on robots, and software now handles tasks once done by clerks. Economists disagree about the outcome: some predict mass unemployment, while others expect new industries to absorb the workforce. History suggests technology changes jobs more than it destroys them. Education systems, however, must adapt so that workers can move into roles machines cannot fill.`,
        items: [
          [`According to the passage, software now ______.`, [`replaces all managers`, `handles tasks once done by clerks`, `builds robots`, `teaches students`], 1, `软件如今处理过去由职员完成的工作。`],
          [`What do economists disagree about?`, [`The price of robots`, `The number of factories`, `The outcome of automation`, `The working hours of clerks`], 2, `经济学家对自动化的结果存在分歧。`],
          [`What does history suggest according to the passage?`, [`Technology changes jobs more than it destroys them.`, `Technology destroys all jobs.`, `Technology never affects work.`, `Technology only helps factories.`], 0, `历史表明技术改变的工作多于其摧毁的。`],
          [`What must education systems do according to the passage?`, [`Stop teaching technology.`, `Focus only on history.`, `Reduce the workforce.`, `Adapt so workers can take roles machines cannot fill.`], 3, `教育体系须调整，使劳动者能进入机器无法胜任的岗位。`]
        ]
      },
      {
        name: `Text 2`, start: 25,
        passage: `Cities with parks and tree-lined streets report healthier residents. Green spaces lower stress, encourage exercise and even cool neighborhoods in summer. Planners stress that access matters: a park helps only if residents can reach it on foot. Some cities turn abandoned land into community gardens, which also strengthen ties among neighbors.`,
        items: [
          [`According to the passage, cities with green spaces report ______.`, [`more traffic`, `healthier residents`, `higher rents`, `fewer jobs`], 1, `拥有绿地和街道的城市居民更健康。`],
          [`What can green spaces do in summer according to the passage?`, [`Raise temperatures.`, `Block sunlight completely.`, `Cool neighborhoods.`, `Cause floods.`], 2, `绿地还能在夏季为街区降温。`],
          [`What do planners stress about parks?`, [`Parks should be far away.`, `Parks need high walls.`, `Only big parks help.`, `Access matters; residents should reach them on foot.`], 3, `规划者强调可达性：公园只有步行可达才有用。`],
          [`What is the result of turning abandoned land into community gardens?`, [`It strengthens ties among neighbors.`, `It raises crime.`, `It reduces exercise.`, `It attracts fewer people.`], 0, `社区花园也加强了邻里联系。`]
        ]
      }
    ],
    vocab: [
      [`The word "visualization" most probably means ______.`, [`writing reports`, `forming pictures in the mind`, `watching videos`, `drawing maps`], 1, `visualization指在头脑中形成画面（可视化）。`],
      [`The word "absorb" in the passage most probably means ______.`, [`take in`, `push out`, `write down`, `cut off`], 0, `absorb此处意为"吸纳（劳动力）"。`],
      [`The word "abandoned" most probably means ______.`, [`newly built`, `highly valued`, `no longer used`, `carefully kept`], 2, `abandoned意为"废弃的"。`],
      [`The word "sharpen" most probably means ______.`, [`make softer`, `paint`, `hide`, `make sharper or more effective`], 3, `sharpen意为"使更敏锐、更有效"。`],
      [`The word "realistic" most probably means ______.`, [`practical and achievable`, `imaginary`, `extremely high`, `secret`], 0, `realistic意为"现实的、可行的"。`],
      [`The word "convert" most probably means ______.`, [`destroy`, `change into another form`, `measure`, `paint`], 1, `convert意为"转变、改造"。`]
    ]
  },
  {
    year: 2019,
    cloze: [
      [`Habits form when a behavior is repeated until it becomes ＿＿.`, [`automatic`, `expensive`, `illegal`, `rare`], 0, `行为重复到自动化程度即形成习惯。`],
      [`Each habit follows a loop: a cue, a routine and a ＿＿.`, [`punishment`, `reward`, `mistake`, `secret`], 1, `习惯回路由提示、惯例和奖赏构成。`],
      [`To build a new habit, it helps to start at the same ＿＿ every day.`, [`restaurant`, `price`, `time`, `speed`], 2, `每天固定时间开始有助于建立新习惯。`],
      [`Small changes are usually easier to keep than ＿＿ ones.`, [`invisible`, `dramatic`, `ancient`, `silent`], 1, `微小改变比剧烈（dramatic）改变更容易坚持。`],
      [`Missing one day does not ＿＿ the whole process.`, [`finish`, `start`, `record`, `ruin`], 3, `偶尔中断一天不会毁掉（ruin）整个过程。`],
      [`Tracking progress on a calendar provides a sense of ＿＿.`, [`guilt`, `achievement`, `loss`, `danger`], 1, `在日历上记录进度带来成就感。`],
      [`Environment matters: keep healthy food ＿＿ and junk food out of sight.`, [`visible`, `locked`, `frozen`, `secret`], 0, `健康食品放在显眼处，垃圾食品藏起来。`],
      [`Old habits are hard to erase; it is easier to ＿＿ them with better ones.`, [`repeat`, `replace`, `reward`, `report`], 1, `用更好的习惯替代旧习惯比抹除更容易。`],
      [`Support from friends and family increases the chance of ＿＿.`, [`failure`, `doubt`, `success`, `delay`], 2, `社会支持提高成功概率。`],
      [`Over weeks, what once required effort becomes almost ＿＿.`, [`impossible`, `painful`, `expensive`, `effortless`], 3, `几周后原本费力的事变得毫不费力。`]
    ],
    texts: [
      {
        name: `Text 1`, start: 21,
        passage: `Most shoppers read online reviews before buying, but not all reviews can be trusted. Sellers sometimes post fake praise or pay for five-star ratings. Platforms fight back by checking purchase records and flagging suspicious patterns. Experts advise readers to focus on detailed reviews that describe both strengths and weaknesses.`,
        items: [
          [`According to the passage, why can some reviews not be trusted?`, [`Because buyers never write reviews.`, `Because platforms delete them.`, `Because sellers may post fake praise or buy ratings.`, `Because they are too long.`], 2, `卖家可能刷好评或购买五星评分。`],
          [`How do platforms fight fake reviews according to the passage?`, [`By checking purchase records and flagging suspicious patterns.`, `By banning all reviews.`, `By raising prices.`, `By limiting buyers.`], 0, `平台通过核对购买记录并标记可疑模式来打击虚假评论。`],
          [`What do experts advise readers to do?`, [`Trust only five-star reviews.`, `Ignore all reviews.`, `Choose the shortest review.`, `Focus on detailed reviews covering strengths and weaknesses.`], 3, `专家建议关注优缺点都讲的详细评论。`],
          [`What do most shoppers do before buying according to the passage?`, [`Visit physical stores.`, `Read online reviews.`, `Ask celebrities.`, `Compare advertisements.`], 1, `多数消费者购买前会阅读在线评论。`]
        ]
      },
      {
        name: `Text 2`, start: 25,
        passage: `Microfinance offers small loans to people whom traditional banks ignore, often women in rural areas. With modest capital, borrowers start shops or buy tools, and repayment rates stay high. Critics note that interest can be heavy and debt may spiral. Supporters reply that the real value lies in helping the poor build a credit history.`,
        items: [
          [`According to the passage, microfinance mainly serves ______.`, [`big companies`, `foreign investors`, `people ignored by traditional banks`, `government offices`], 2, `小额贷款服务被传统银行忽视的人群。`],
          [`What do borrowers usually do with the capital?`, [`Buy stocks.`, `Start shops or buy tools.`, `Travel abroad.`, `Pay taxes.`], 1, `借款人用资金开店或购买工具。`],
          [`What do critics point out about microfinance?`, [`Interest can be heavy and debt may spiral.`, `It never charges interest.`, `It only helps cities.`, `Repayment rates are low.`], 0, `批评者指出利息可能沉重、债务可能恶性循环。`],
          [`According to supporters, the real value of microfinance is ______.`, [`replacing all banks`, `increasing interest rates`, `closing small shops`, `helping the poor build a credit history`], 3, `支持者认为真正价值在于帮穷人建立信用记录。`]
        ]
      }
    ],
    vocab: [
      [`The word "automatic" most probably means ______.`, [`working by itself without thought`, `very slow`, `expensive`, `handmade`], 0, `automatic意为"自动的、不假思索的"。`],
      [`The word "suspicious" most probably means ______.`, [`fully trusted`, `making one feel something is wrong`, `well known`, `old-fashioned`], 1, `suspicious意为"可疑的"。`],
      [`The word "spiral" in "debt may spiral" most probably means ______.`, [`disappear slowly`, `stay stable`, `increase rapidly out of control`, `get repaid`], 2, `spiral指（债务）失控地恶性攀升。`],
      [`The word "achievement" most probably means ______.`, [`a kind of punishment`, `a feeling of fear`, `a small mistake`, `something accomplished successfully`], 3, `achievement意为"成就"。`],
      [`The word "flagging" in "flagging suspicious patterns" most probably means ______.`, [`marking for attention`, `deleting forever`, `copying`, `ignoring`], 0, `flagging意为"标记以引起注意"。`],
      [`The word "modest" in "modest capital" most probably means ______.`, [`extremely large`, `small or limited`, `borrowed`, `foreign`], 1, `modest此处指"（资金）小额的"。`]
    ]
  }
];

for (const d of DATA) {
  const src = `${d.year}真题风格题`;
  d.cloze.forEach((c, i) => addQ(CLOZE, `【第${i + 1}空】${c[0]}`, c[1], c[2], c[3], src, 2));
  for (const t of d.texts) {
    t.items.forEach((it, i) => addQ(READ, `${t.name}（第${t.start + i}题）：${t.passage}\n${it[0]}`, it[1], it[2], it[3], src, 3));
  }
  d.vocab.forEach(v => addQ(VOCAB, v[0], v[1], v[2], v[3], src, 2));
}

let sql = '';
const batch = 50;
for (let i = 0; i < Q.length; i += batch) {
  const part = Q.slice(i, i + batch);
  sql += 'INSERT INTO questions (subject, chapter, type, question, options, answer, explanation, difficulty, source) VALUES\n';
  part.forEach((q, j) => {
    sql += `('english2', '${esc(q.ch)}', '${q.t}', '${esc(q.q)}', '${esc(q.o)}', '${esc(q.a)}', '${esc(q.e)}', ${q.d}, '${esc(q.src)}')${j < part.length - 1 ? ',' : ';'}\n`;
  });
  sql += '\n';
}
fs.writeFileSync('seed_real_english_2015_2019.sql', sql);
console.log(`Generated ${Q.length} questions`);
for (const year of [2015, 2016, 2017, 2018, 2019]) console.log(`${year}=${Q.filter(q => q.src === `${year}真题风格题`).length}`);
console.log(`cloze=${Q.filter(q => q.ch === CLOZE).length} read=${Q.filter(q => q.ch === READ).length} vocab=${Q.filter(q => q.ch === VOCAB).length}`);

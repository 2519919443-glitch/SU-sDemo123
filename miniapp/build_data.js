const fs = require('fs');

// 古诗文
const poems = [
  {id:1,title:'静夜思',author:'李白（唐）',content:'床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',translation:'床前洒满了明亮的月光，好像地上泛起了一层白霜。',appreciation:'语言清新朴素，意境明朗空灵。',grade:'小学',tags:['思乡','月亮']},
  {id:2,title:'春晓',author:'孟浩然（唐）',content:'春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',translation:'春日里贪睡不知不觉天已破晓，醒来后到处都能听到鸟儿的啼叫。',appreciation:'看似平淡，却蕴含无限惜春之意。',grade:'小学',tags:['春天','惜春']},
  {id:3,title:'望庐山瀑布',author:'李白（唐）',content:'日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。',translation:'香炉峰在阳光照射下生起紫色烟霞，远远望去瀑布像白色的绸缎挂在山前。',appreciation:'气势磅礴，大胆夸张，浪漫主义风格。',grade:'小学',tags:['山水','夸张']},
  {id:4,title:'出塞',author:'王昌龄（唐）',content:'秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。',translation:'依旧是秦汉时期的明月和边关，万里出征的将士还没有回来。',appreciation:'边塞诗的压卷之作，雄浑豪放。',grade:'初中',tags:['边塞','爱国']},
  {id:5,title:'水调歌头',author:'苏轼（宋）',content:'明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。',translation:'明月从什么时候开始有的？端起酒杯来询问青天。不知道在天上的宫殿里，今天晚上是哪一年。',appreciation:'中秋词中的绝唱，融入丰富的哲理与深情。',grade:'初中',tags:['中秋','苏轼']},
  {id:6,title:'登高',author:'杜甫（唐）',content:'风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。',translation:'风急天高猿猴啼叫显得十分悲哀，水清沙白的河洲上有群群水鸟在飞翔。',appreciation:'被誉为古今七律第一。',grade:'高中',tags:['律诗','杜甫']},
  {id:7,title:'岳阳楼记',author:'范仲淹（宋）',content:'庆历四年春，滕子京谪守巴陵郡。\n越明年，政通人和，百废具兴。',translation:'庆历四年的春天，滕子京被贬职到巴陵郡做太守。到了第二年，政事顺利，百姓和乐，许多已废弛的事情都兴办起来了。',appreciation:'不以物喜不以己悲的旷达胸襟。',grade:'初中',tags:['古文','范仲淹']},
  {id:8,title:'桃花源记',author:'陶渊明（晋）',content:'晋太元中，武陵人捕鱼为业。\n缘溪行，忘路之远近。',translation:'东晋太元年间，武陵郡有个人以打鱼为生。有一天他顺着溪水划船，忘记了路程的远近。',appreciation:'描绘了一个与世无争的理想社会。',grade:'初中',tags:['古文','陶渊明']},
  {id:9,title:'滕王阁序',author:'王勃（唐）',content:'豫章故郡，洪都新府。\n星分翼轸，地接衡庐。',translation:'这里是汉代的豫章郡城，如今是洪都的都督府。天上的方位属于翼、轸两星宿的分野，地上连接着衡山和庐山。',appreciation:'落霞与孤鹜齐飞，秋水共长天一色。',grade:'高中',tags:['古文','王勃']},
  {id:10,title:'论语',author:'孔子',content:'学而时习之，不亦说乎？\n有朋自远方来，不亦乐乎？',translation:'学习并且按时温习，不也很愉快吗？有朋友从远方来，不也很快乐吗？',appreciation:'儒家经典，记录了孔子及其弟子的言行。',grade:'初中',tags:['儒家','教育']},
  {id:11,title:'陋室铭',author:'刘禹锡（唐）',content:'山不在高，有仙则名。\n水不在深，有龙则灵。',translation:'山不在于高，有了神仙就出名。水不在于深，有了龙就显得有灵气。',appreciation:'表达了作者高洁傲岸的情操和安贫乐道的情趣。',grade:'初中',tags:['古文','刘禹锡']},
  {id:12,title:'爱莲说',author:'周敦颐（宋）',content:'水陆草木之花，可爱者甚蕃。\n晋陶渊明独爱菊。',translation:'水上、陆地上各种草本木本的花，值得喜爱的非常多。晋代的陶渊明只喜爱菊花。',appreciation:'以莲喻人，表达不慕名利、洁身自好的高尚品质。',grade:'初中',tags:['古文','周敦颐']},
  {id:13,title:'赤壁赋',author:'苏轼（宋）',content:'壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。\n清风徐来，水波不兴。',translation:'壬戌年的秋天，七月十六日，苏轼与友人在赤壁之下泛舟游玩。清风缓缓吹来，水面不起波纹。',appreciation:'借赤壁之游抒发对人生无常的感慨，却又表现出旷达的人生态度。',grade:'高中',tags:['古文','苏轼']},
  {id:14,title:'劝学',author:'荀子',content:'青，取之于蓝，而青于蓝；\n冰，水为之，而寒于水。',translation:'靛青是从蓼蓝中提取的，但颜色比蓼蓝更深；冰是由水凝结而成的，但比水更冷。',appreciation:'以生动的比喻说明学习的重要性，强调学习可以改变人。',grade:'高中',tags:['古文','荀子']},
  {id:15,title:'将进酒',author:'李白（唐）',content:'君不见黄河之水天上来，奔流到海不复回。\n君不见高堂明镜悲白发，朝如青丝暮成雪。',translation:'你没看见黄河的水从天上流下来，奔腾入海不再回。你没看见高堂上的明镜悲叹白发，早晨还像青丝到了傍晚就变成雪。',appreciation:'气势磅礴，感情奔放，是李白诗歌的代表作之一。',grade:'高中',tags:['古诗','李白']},
];

// 知识点（每个年级+学科 3-5 条）
const knowledgePoints = [
  // 小学 语文
  {id:1,grade:'小学',subject:'语文',textbook:'一年级上',chapter:'汉语拼音（一）',title:'单韵母 a o e',type:'基础',content:'单韵母 a o e 的发音和四声',mastery:0},
  {id:2,grade:'小学',subject:'语文',textbook:'一年级上',chapter:'汉语拼音（一）',title:'单韵母 i u ü',type:'基础',content:'i 的发音像衣服的衣，ü 和 j q x 相拼时去掉两点',mastery:0},
  {id:3,grade:'小学',subject:'语文',textbook:'一年级上',chapter:'课文（一）',title:'秋天',type:'重点',content:'天气凉了，树叶黄了，一片片叶子从树上落下来',mastery:0},
  {id:4,grade:'小学',subject:'语文',textbook:'一年级下',chapter:'识字（一）',title:'春夏秋冬',type:'基础',content:'春：春风 夏：夏雨 秋：秋霜 冬：冬雪',mastery:0},
  {id:5,grade:'小学',subject:'语文',textbook:'二年级上',chapter:'课文（四）',title:'坐井观天',type:'考点',content:'比喻眼界狭窄，见识短浅的人',mastery:0},
  // 小学 数学
  {id:10,grade:'小学',subject:'数学',textbook:'一年级上',chapter:'20以内的进位加法',title:'9加几',type:'重点',content:'凑十法：9加1等于10，把另一个数分成1和几',mastery:0},
  {id:11,grade:'小学',subject:'数学',textbook:'二年级上',chapter:'表内乘法（一）',title:'乘法口诀',type:'基础',content:'一一得一，一二得二，一九得九',mastery:0},
  {id:12,grade:'小学',subject:'数学',textbook:'四年级上',chapter:'大数的认识',title:'亿以内数的认识',type:'重点',content:'10个一万是十万，10个十万是一百万',mastery:0},
  {id:13,grade:'小学',subject:'数学',textbook:'六年级下',chapter:'圆柱与圆锥',title:'圆柱的体积',type:'考点',content:'V = Sh = πr²h',mastery:0},
  // 小学 英语
  {id:20,grade:'小学',subject:'英语',textbook:'三年级上',chapter:'Unit 1 Hello',title:'Hello 的用法',type:'基础',content:'Hello! 和 Hi! 都用来打招呼',mastery:0},
  {id:21,grade:'小学',subject:'英语',textbook:'五年级下',chapter:'Unit 2 My favourite season',title:'四季表达',type:'重点',content:'spring 春天 summer 夏天 autumn 秋天 winter 冬天',mastery:0},
  // 初中 语文
  {id:30,grade:'初中',subject:'语文',textbook:'七年级上',chapter:'第一单元 四季美景',title:'春（朱自清）',type:'重点',content:'描绘了春草图、春花图、春风图、春雨图、迎春图',mastery:0},
  {id:31,grade:'初中',subject:'语文',textbook:'七年级上',chapter:'第五单元 动物与人',title:'猫（郑振铎）',type:'考点',content:'揭示了不能以貌取人，不能主观臆断的道理',mastery:0},
  // 初中 数学
  {id:40,grade:'初中',subject:'数学',textbook:'七年级上',chapter:'第一章 有理数',title:'数轴',type:'重点',content:'数轴是规定了原点、正方向和单位长度的直线',mastery:0},
  {id:41,grade:'初中',subject:'数学',textbook:'八年级上',chapter:'第十三章 轴对称',title:'轴对称图形',type:'重点',content:'如果一个图形沿着一条直线折叠，直线两旁的部分能够互相重合',mastery:0},
  // 初中 英语
  {id:50,grade:'初中',subject:'英语',textbook:'七年级上',chapter:'Unit 1 My name is Gina',title:'自我介绍句型',type:'基础',content:'What is your name? My name is ...',mastery:0},
  {id:51,grade:'初中',subject:'英语',textbook:'八年级上',chapter:'Unit 3 I am more outgoing',title:'形容词比较级',type:'重点',content:'单音节词加-er，多音节词前加more',mastery:0},
  // 初中 物理
  {id:60,grade:'初中',subject:'物理',textbook:'八年级上',chapter:'第一章 机械运动',title:'速度和平均速度',type:'重点',content:'v = s/t，1m/s = 3.6km/h',mastery:0},
  {id:61,grade:'初中',subject:'物理',textbook:'八年级上',chapter:'第五章 透镜及其应用',title:'凸透镜成像规律',type:'考点',content:'u>2f 成倒立缩小实像；u<f 成正立放大虚像',mastery:0},
  // 初中 化学
  {id:70,grade:'初中',subject:'化学',textbook:'九年级上',chapter:'第一单元 走进化学世界',title:'化学变化和物理变化',type:'基础',content:'化学变化有新物质生成，物理变化没有',mastery:0},
  {id:71,grade:'初中',subject:'化学',textbook:'九年级上',chapter:'第六单元 碳和碳的氧化物',title:'二氧化碳的制取',type:'重点',content:'CaCO3 + 2HCl → CaCl2 + H2O + CO2',mastery:0},
  // 高中 语文
  {id:80,grade:'高中',subject:'语文',textbook:'必修 上册',chapter:'第三单元 生命的诗意',title:'登高（杜甫）',type:'考点',content:'被誉为古今七律第一，表达了诗人常年漂泊、老病孤愁的复杂感情',mastery:0},
  {id:81,grade:'高中',subject:'语文',textbook:'必修 上册',chapter:'第三单元 生命的诗意',title:'梦游天姥吟留别（李白）',type:'考点',content:'安能摧眉折腰事权贵，使我不得开心颜',mastery:0},
  // 高中 数学
  {id:90,grade:'高中',subject:'数学',textbook:'必修 第一册',chapter:'第三章 函数的概念与性质',title:'函数的单调性',type:'重点',content:'对于区间D上任意x1、x2，当x1<x2时都有f(x1)<f(x2)，则f(x)在D上是增函数',mastery:0},
  {id:91,grade:'高中',subject:'数学',textbook:'必修 第一册',chapter:'第四章 指数函数与对数函数',title:'对数函数的性质',type:'考点',content:'当a>1时函数在R上单调递增，图像恒过点(1,0)',mastery:0},
  // 高中 物理
  {id:100,grade:'高中',subject:'物理',textbook:'必修 第一册',chapter:'第二章 匀变速直线运动',title:'匀变速直线运动公式',type:'考点',content:'v=v0+at，x=v0t+1/2at²，v²-v0²=2ax',mastery:0},
  // 高中 化学
  {id:110,grade:'高中',subject:'化学',textbook:'必修 第一册',chapter:'第四章 物质结构 元素周期律',title:'元素周期律',type:'考点',content:'同周期从左到右原子半径逐渐减小，金属性逐渐减弱',mastery:0},
];

// 题库（每章节 2-3 题）
const quizBanks = [
  // 小学 语文
  {id:1,grade:'小学',subject:'语文',textbook:'一年级上',chapter:'汉语拼音（一）',difficulty:'基础',question:'下列单韵母中，发音时嘴巴张得最大的是？',options:['A. a','B. o','C. e','D. i'],answer:'A',explanation:'单韵母a发音时嘴巴张得最大'},
  {id:2,grade:'小学',subject:'语文',textbook:'一年级上',chapter:'课文（二）',difficulty:'重点',question:'"弯弯的月儿小小的船"中，把什么比作船？',options:['A. 月亮','B. 太阳','C. 星星','D. 云朵'],answer:'A',explanation:'这句诗把弯弯的月儿（月亮）比作小小的船'},
  {id:3,grade:'小学',subject:'语文',textbook:'二年级上',chapter:'课文（四）',difficulty:'考点',question:'"坐井观天"这个寓言故事告诉我们什么道理？',options:['A. 天空很大','B. 眼界狭窄的人自以为是','C. 青蛙很可爱','D. 井水很清'],answer:'B',explanation:'坐井观天的寓意是：眼界狭窄、见识短浅的人，却自以为是'},
  // 小学 数学
  {id:10,grade:'小学',subject:'数学',textbook:'一年级上',chapter:'20以内的进位加法',difficulty:'基础',question:'9 + 5 = ？',options:['A. 12','B. 13','C. 14','D. 15'],answer:'C',explanation:'用凑十法：9+1=10，5分成1和4，10+4=14'},
  {id:11,grade:'小学',subject:'数学',textbook:'二年级上',chapter:'表内乘法（一）',difficulty:'基础',question:'3 × 4 = ？',options:['A. 7','B. 10','C. 12','D. 15'],answer:'C',explanation:'3×4=12，也可以理解为3个4相加'},
  {id:12,grade:'小学',subject:'数学',textbook:'六年级下',chapter:'圆柱与圆锥',difficulty:'考点',question:'一个圆柱的底面半径是2cm，高是5cm，体积是多少？（π取3.14）',options:['A. 31.4cm³','B. 62.8cm³','C. 78.5cm³','D. 125.6cm³'],answer:'B',explanation:'V=πr²h=3.14×4×5=62.8cm³'},
  // 小学 英语
  {id:20,grade:'小学',subject:'英语',textbook:'三年级上',chapter:'Unit 1 Hello',difficulty:'基础',question:'用英语打招呼，正确的是？',options:['A. Goodbye','B. Hello','C. Thank you','D. Sorry'],answer:'B',explanation:'Hello! 和 Hi! 都用来打招呼'},
  {id:21,grade:'小学',subject:'英语',textbook:'四年级上',chapter:'Unit 1 My classroom',difficulty:'重点',question:"Whose book is this? — ___ my book.",options:['A. It','B. Its','C. It is','D. Is'],answer:'C',explanation:'回答要用 It is 或 It\'s'},

  // 初中 语文
  {id:30,grade:'初中',subject:'语文',textbook:'七年级上',chapter:'第一单元 四季美景',difficulty:'基础',question:'《春》的作者是？',options:['A. 老舍','B. 朱自清','C. 鲁迅','D. 冰心'],answer:'B',explanation:'《春》是朱自清的散文名篇'},
  {id:31,grade:'初中',subject:'语文',textbook:'七年级上',chapter:'第五单元 动物与人',difficulty:'重点',question:'《猫》一文中，作者最后说"我永远不能原谅自己"，是因为？',options:['A. 没有照顾好第一只猫','B. 冤枉了第三只猫','C. 没有给猫足够的食物','D. 把猫送人了'],answer:'B',explanation:'作者主观臆断，冤枉了第三只猫偷吃了鸟'},
  // 初中 数学
  {id:40,grade:'初中',subject:'数学',textbook:'七年级上',chapter:'第一章 有理数',difficulty:'基础',question:'在数轴上，原点表示的数是？',options:['A. 1','B. 0','C. -1','D. 不确定'],answer:'B',explanation:'数轴的原点表示的数是0'},
  {id:41,grade:'初中',subject:'数学',textbook:'七年级上',chapter:'第一章 有理数',difficulty:'重点',question:'|-5| 的值是？',options:['A. -5','B. 5','C. 0','D. 1/5'],answer:'B',explanation:'负数的绝对值是它的相反数，所以 |-5| = 5'},
  {id:42,grade:'初中',subject:'数学',textbook:'九年级上',chapter:'第二十二章 二次函数',difficulty:'考点',question:'二次函数 y = x² - 4x + 3 的顶点坐标是？',options:['A. (2,-1)','B. (2,1)','C. (-2,-1)','D. (4,3)'],answer:'A',explanation:'配方法：y=(x-2)²-1，顶点坐标(2,-1)'},
  // 初中 英语
  {id:50,grade:'初中',subject:'英语',textbook:'七年级上',chapter:'Unit 1 My name is Gina',difficulty:'基础',question:"— What is ___ name? — My name is Tom.",options:['A. you','B. your','C. yours','D. yourself'],answer:'B',explanation:'your 是形容词性物主代词，后面要加名词'},
  {id:51,grade:'初中',subject:'英语',textbook:'八年级上',chapter:'Unit 3 I am more outgoing',difficulty:'重点',question:'My sister is ___ than me.',options:['A. outgoing','B. more outgoing','C. most outgoing','D. the most outgoing'],answer:'B',explanation:'句中有than，要用比较级。多音节词在前面加more'},
  // 初中 物理
  {id:60,grade:'初中',subject:'物理',textbook:'八年级上',chapter:'第一章 机械运动',difficulty:'重点',question:'小明骑自行车的速度为5m/s，这相当于每小时多少千米？',options:['A. 5km/h','B. 10km/h','C. 18km/h','D. 36km/h'],answer:'C',explanation:'1m/s = 3.6km/h，所以5m/s = 18km/h'},
  {id:61,grade:'初中',subject:'物理',textbook:'八年级上',chapter:'第五章 透镜及其应用',difficulty:'考点',question:'用放大镜看物体时，物体应放在凸透镜的？',options:['A. 2倍焦距以外','B. 1倍和2倍焦距之间','C. 1倍焦距以内','D. 焦点上'],answer:'C',explanation:'当u<f时，凸透镜成正立、放大的虚像，这就是放大镜的原理'},
  // 初中 化学
  {id:70,grade:'初中',subject:'化学',textbook:'九年级上',chapter:'第一单元 走进化学世界',difficulty:'基础',question:'下列变化中，属于化学变化的是？',options:['A. 冰融化成水','B. 玻璃破碎','C. 铁生锈','D. 水蒸发'],answer:'C',explanation:'化学变化有新物质生成。铁生锈生成了铁锈，是化学变化'},
  {id:71,grade:'初中',subject:'化学',textbook:'九年级上',chapter:'第二单元 我们周围的空气',difficulty:'基础',question:'空气中体积分数最大的气体是？',options:['A. 氧气','B. 氮气','C. 二氧化碳','D. 稀有气体'],answer:'B',explanation:'按体积分数算：氮气78%、氧气21%'},

  // 高中 语文
  {id:80,grade:'高中',subject:'语文',textbook:'必修 上册',chapter:'第三单元 生命的诗意',difficulty:'基础',question:'《登高》的作者是？',options:['A. 李白','B. 杜甫','C. 白居易','D. 王维'],answer:'B',explanation:'《登高》是杜甫的作品，被誉为古今七律第一'},
  {id:81,grade:'高中',subject:'语文',textbook:'必修 上册',chapter:'第三单元 生命的诗意',difficulty:'重点',question:'"安能摧眉折腰事权贵，使我不得开心颜"表达了诗人怎样的态度？',options:['A. 对权贵的敬畏','B. 对权贵的蔑视和反抗','C. 对仕途的渴望','D. 对隐居的无奈'],answer:'B',explanation:'这句诗表达了李白蔑视权贵、追求自由的抗议精神'},
  // 高中 数学
  {id:90,grade:'高中',subject:'数学',textbook:'必修 第一册',chapter:'第一章 集合与常用逻辑用语',difficulty:'基础',question:'已知集合A={1,2,3}，B={2,3,4}，则A∩B=',options:['A. {1}','B. {2,3}','C. {1,2,3,4}','D. 空集'],answer:'B',explanation:'交集是由既属于A又属于B的元素组成的集合，所以是{2,3}'},
  {id:91,grade:'高中',subject:'数学',textbook:'必修 第一册',chapter:'第三章 函数的概念与性质',difficulty:'重点',question:'函数f(x)=x²的奇偶性是？',options:['A. 奇函数','B. 偶函数','C. 既是奇函数又是偶函数','D. 非奇非偶函数'],answer:'B',explanation:'f(-x)=(-x)²=x²=f(x)，所以是偶函数，图像关于y轴对称'},
  // 高中 物理
  {id:100,grade:'高中',subject:'物理',textbook:'必修 第一册',chapter:'第二章 匀变速直线运动',difficulty:'考点',question:'一物体从静止开始做匀加速直线运动，加速度为2m/s²，则第3秒末的速度为？',options:['A. 2m/s','B. 4m/s','C. 6m/s','D. 8m/s'],answer:'C',explanation:'用v=v0+at，v0=0，a=2，t=3，得v=0+2×3=6m/s'},
  // 高中 化学
  {id:110,grade:'高中',subject:'化学',textbook:'必修 第一册',chapter:'第四章 物质结构 元素周期律',difficulty:'基础',question:'下列元素中，原子半径最大的是？',options:['A. Na','B. Mg','C. Al','D. Cl'],answer:'A',explanation:'同周期从左到右原子半径逐渐减小，所以Na>Mg>Al>Cl'},
];

const words = [
  {id:1,word:'apple',phonetic:'/æpl/',meaning:'苹果',example:'I eat an apple every day.',grade:'小学',module:'Unit 1'},
  {id:2,word:'happy',phonetic:'/ˈhæpi/',meaning:'快乐的',example:'She feels happy today.',grade:'小学',module:'Unit 1'},
  {id:3,word:'school',phonetic:'/skuːl/',meaning:'学校',example:'I go to school by bus.',grade:'小学',module:'Unit 2'},
  {id:4,word:'because',phonetic:'/bɪˈkɒz/',meaning:'因为',example:'I like summer because I can swim.',grade:'初中',module:'Unit 1'},
  {id:5,word:'important',phonetic:'/ɪmˈpɔːtnt/',meaning:'重要的',example:'This is an important meeting.',grade:'初中',module:'Unit 2'},
  {id:6,word:'opportunity',phonetic:'/ˌɒpəˈtjuːnəti/',meaning:'机会',example:'This is a good opportunity.',grade:'高中',module:'Unit 1'},
];

const idioms = [
  {id:1,word:'画龙点睛',pinyin:'hua long dian jing',meaning:'比喻在关键地方加上精辟的语句',usage:'这篇文章的结尾真是画龙点睛之笔。',grade:'小学'},
  {id:2,word:'守株待兔',pinyin:'shou zhu dai tu',meaning:'比喻不主动努力，而存万一的侥幸心理',usage:'学习不能守株待兔，要主动进取。',grade:'小学'},
  {id:3,word:'锲而不舍',pinyin:'qie er bu she',meaning:'比喻有恒心，有毅力，坚持不懈',usage:'学习要有锲而不舍的精神。',grade:'初中'},
  {id:4,word:'举一反三',pinyin:'ju yi fan san',meaning:'比喻从一件事情类推而知道其他许多事情',usage:'学习要举一反三，不能死记硬背。',grade:'初中'},
  {id:5,word:'破釜沉舟',pinyin:'po fu chen zhou',meaning:'比喻下决心不顾一切地干到底',usage:'面对高考，我们要有破釜沉舟的勇气。',grade:'高中'},
];

const formulas = [
  {id:1,subject:'数学',grade:'小学',category:'四则运算',name:'加法交换律',formula:'a + b = b + a',desc:'两数相加，交换加数的位置，和不变'},
  {id:2,subject:'数学',grade:'初中',category:'几何',name:'勾股定理',formula:'a² + b² = c²',desc:'直角三角形两直角边的平方和等于斜边的平方'},
  {id:3,subject:'数学',grade:'高中',category:'三角函数',name:'正弦定理',formula:'a/sinA = b/sinB = c/sinC = 2R',desc:'三角形中，各边与其对角的正弦之比相等'},
  {id:4,subject:'物理',grade:'初中',category:'力学',name:'牛顿第二定律',formula:'F = ma',desc:'物体的加速度的大小跟作用力成正比'},
  {id:5,subject:'化学',grade:'初中',category:'氧化还原反应',name:'升失氧降得还',formula:'升失氧，降得还',desc:'化合价升高失电子被氧化；化合价降低得电子被还原'},
];

// ========== 输出 ==========
function j(obj) {
  return JSON.stringify(obj, null, 2);
}

let out = '// =============================================\n';
out += '//  K12 学习助手 - 全局数据库\n';
out += '//  知识点：' + knowledgePoints.length + '  题库：' + quizBanks.length + '\n';
out += '// =============================================\n\n';

out += 'const poems = ' + j(poems) + ';\n\n';
out += 'const knowledgePoints = ' + j(knowledgePoints) + ';\n\n';
out += 'const quizBanks = ' + j(quizBanks) + ';\n\n';
out += 'const words = ' + j(words) + ';\n\n';
out += 'const idioms = ' + j(idioms) + ';\n\n';
out += 'const formulas = ' + j(formulas) + ';\n\n';

out += '// ---------- 挂载到 window.AppData ----------\n';
out += 'window.AppData = window.AppData || {};\n';
out += 'window.AppData.poems = poems;\n';
out += 'window.AppData.knowledgePoints = knowledgePoints;\n';
out += 'window.AppData.quizBanks = quizBanks;\n';
out += 'window.AppData.words = words;\n';
out += 'window.AppData.idioms = idioms;\n';
out += 'window.AppData.formulas = formulas;\n\n';

// 工具函数
out += 'window.AppData.getSubjectsByGrade = function(grd) {\n';
out += '  var grade = grd || (window.App && App.state && App.state.grade) || "小学";\n';
out += '  var subs = [];\n';
out += '  (window.AppData.knowledgePoints||[]).forEach(function(k) {\n';
out += '    if (k.grade === grade && subs.indexOf(k.subject) === -1) subs.push(k.subject);\n';
out += '  });\n';
out += '  return subs;\n';
out += '};\n\n';

out += 'window.AppData.getChaptersBySubject = function(grd, subject) {\n';
out += '  var grade = grd || (window.App && App.state && App.state.grade) || "小学";\n';
out += '  var chapters = [];\n';
out += '  (window.AppData.knowledgePoints||[]).forEach(function(k) {\n';
out += '    if (k.grade === grade && k.subject === subject && chapters.indexOf(k.chapter) === -1) chapters.push(k.chapter);\n';
out += '  });\n';
out += '  return chapters;\n';
out += '};\n\n';

out += 'window.AppData.getPointsByChapter = function(grd, subject, chapter) {\n';
out += '  var grade = grd || (window.App && App.state && App.state.grade) || "小学";\n';
out += '  return (window.AppData.knowledgePoints||[]).filter(function(k) {\n';
out += '    return k.grade === grade && k.subject === subject && k.chapter === chapter;\n';
out += '  });\n';
out += '};\n\n';

out += 'window.AppData.getQuizByChapter = function(grd, subject, chapter) {\n';
out += '  var grade = grd || (window.App && App.state && App.state.grade) || "小学";\n';
out += '  return (window.AppData.quizBanks||[]).filter(function(q) {\n';
out += '    return q.grade === grade && q.subject === subject && q.chapter === chapter;\n';
out += '  });\n';
out += '};\n';

fs.writeFileSync('src/data.js', out, 'utf8');
console.log('data.js 生成完毕！');
console.log('  知识点：' + knowledgePoints.length);
console.log('  题库：' + quizBanks.length);

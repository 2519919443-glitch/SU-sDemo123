const fs = require('fs');

// 用反引号包裹所有含特殊字符的字符串值
const poems = [
  { id:1, title:`静夜思`, author:`李白（唐）`, content:`床前明月光，疑是地上霜。\n举头望明月，低头思故乡。`, translation:`床前洒满了明亮的月光，好像地上泛起了一层白霜。抬起头来仰望明月，低下头去思念远方的家乡。`, appreciation:`语言清新朴素，意境明朗空灵，千百年来广为传诵。`, grade:`小学`, tags:[`思乡`,`月亮`] },
  { id:2, title:`春晓`, author:`孟浩然（唐）`, content:`春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。`, translation:`春日里贪睡不知不觉天已破晓，到处都能听到鸟儿的欢叫声。昨天夜里风声雨声一直不断，那娇美的春花不知被吹落了多少？`, appreciation:`看似平淡，却蕴含无限惜春之意，言有尽而意无穷。`, grade:`小学`, tags:[`春天`,`惜春`] },
  { id:3, title:`望庐山瀑布`, author:`李白（唐）`, content:`日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。`, translation:`香炉峰在阳光的照射下生起紫色烟霞，远远望见瀑布似白色绢绸悬挂在山前。高崖上飞腾直落的瀑布好像有三千尺，让人恍惚以为是银河从天上泻落到人间。`, appreciation:`气势磅礴，大胆夸张，充分展现了李白浪漫主义的诗歌风格。`, grade:`小学`, tags:[`山水`,`夸张`] },
  { id:4, title:`出塞`, author:`王昌龄（唐）`, content:`秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。`, translation:`依旧是秦汉时期的明月和边关，守边御敌鏖战万里征夫未回还。只要龙城的飞将李广如今还在，绝不许匈奴南下牧马度过阴山。`, appreciation:`边塞诗的压卷之作，雄浑豪放，寄寓了诗人对驱逐外患、保卫边疆的渴望。`, grade:`初中`, tags:[`边塞`,`爱国`] },
  { id:5, title:`水调歌头·明月几时有`, author:`苏轼（宋）`, content:`明月几时有？把酒问青天。不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。`, translation:`明月从什么时候开始有的？端起酒杯来询问青天。不知道天上的宫殿，今晚是哪一年。我想要乘御清风回到天上，又恐怕在美玉砌成的楼宇，受不住高耸的寒冷。月光转过朱红的楼阁，低低地穿过雕花的门窗，照着没有睡意的人。明月不该对人们有什么怨恨吧，为什么偏偏在别人离别时才圆呢？人有悲欢离合的变迁，月有阴晴圆缺的转换，这种事自古来难以周全。只愿人人平安长久，即使相隔千里也能共享这美好的月光。`, appreciation:`中秋词中的绝唱，融入丰富的哲理与深情，千百年来广为传诵。`, grade:`初中`, tags:[`中秋`,`豪放`,`苏轼`] },
  { id:6, title:`登高`, author:`杜甫（唐）`, content:`风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。\n万里悲秋常作客，百年多病独登台。\n艰难苦恨繁霜鬓，潦倒新停浊酒杯。`, translation:`风急天高猿猴啼叫显得十分悲哀，水清沙白的河洲上有鸟儿在盘旋。无边无际的落叶萧萧飘落，望不到头的长江水滚滚奔来。悲对秋景感慨万里漂泊常年为客，一生当中疾病缠身今日独上高台。历尽了艰难苦恨白发长满了双鬓，衰颓满心偏又暂停了消愁的酒杯。`, appreciation:`被誉为古今七律第一，集中展现了杜甫晚年漂泊羁旅之苦与忧国伤时之情。`, grade:`高中`, tags:[`律诗`,`悲秋`,`杜甫`] },
  { id:7, title:`岳阳楼记（节选）`, author:`范仲淹（宋）`, content:`庆历四年春，滕子京谪守巴陵郡。越明年，政通人和，百废具兴……\n予观夫巴陵胜状，在洞庭一湖。衔远山，吞长江，浩浩汤汤，横无际涯……\n嗟夫！予尝求古仁人之心，或异二者之为。何哉？\n不以物喜，不以己悲。居庙堂之高则忧其民；处江湖之远则忧其君。\n是进亦忧，退亦忧。然则何时而乐耶？\n其必曰：先天下之忧而忧，后天下之乐而乐！`, translation:`庆历四年的春天，滕子京被贬职到巴陵郡做太守。到了第二年，政事顺利，百姓和乐，各种荒废的事业都兴办起来了……\n我看那巴陵郡的美好景色，全在洞庭湖上。它连接着远处的山，吞吐着长江的水，水势浩大，无边无际……\n唉！我曾经探求古代品德高尚的人的心思，或许跟上面说的两种表现不同。为什么呢？\n他们不因为外物好坏和自己得失而或喜或悲。在朝廷里做高官就担忧他的百姓；处在偏远的江湖间就担忧他的君王。\n这就是进朝做官也担忧，退处江湖也担忧。那么什么时候才快乐呢？\n他们一定会说：在天下人忧愁之前先忧愁，在天下人快乐之后才快乐！`, appreciation:`不以物喜不以己悲的旷达胸襟，以及先忧后乐的政治抱负，成为千古名篇。`, grade:`初中`, tags:[`古文`,`忧国忧民`,`范仲淹`] },
  { id:8, title:`桃花源记（节选）`, author:`陶渊明（晋）`, content:`晋太元中，武陵人捕鱼为业。缘溪行，忘路之远近……\n土地平旷，屋舍俨然，有良田、美池、桑竹之属。阡陌交通，鸡犬相闻。\n其中往来种作，男女衣着，悉如外人。黄发垂髫，并怡然自乐。`, translation:`东晋太元年间，武陵郡有个人以打鱼为生。一天，他顺着溪水划船，忘了路程的远近……\n这里土地平坦开阔，房屋整整齐齐，有肥沃的田地、美丽的池塘和桑树竹子之类。田间小路交错相通，村落间可以互相听到鸡鸣狗叫的声音。\n人们在田野里来来往往耕种劳作，男女的穿戴跟桃花源外面的人完全一样。老人和小孩都充满喜悦之情，显得自得其乐。`, appreciation:`描绘了一个与世无争、和平安宁的理想社会，寄托了作者对美好社会的向往。`, grade:`初中`, tags:[`古文`,`理想社会`,`陶渊明`] },
  { id:9, title:`滕王阁序（节选）`, author:`王勃（唐）`, content:`豫章故郡，洪都新府。星分翼轸，地接衡庐……\n披绣闼，俯雕甍，山原旷其盈视，川泽纡其骇瞩。\n闾阎扑地，钟鸣鼎食之家；舸舰弥津，青雀黄龙之舳。\n云销雨霁，彩彻区明。落霞与孤鹜齐飞，秋水共长天一色。`, translation:`这里是汉代的豫章郡城，如今是洪都的都督府。天上的方位属于翼、轸两星宿的分野，地上连结着衡山和庐山……\n推开雕花的阁门，俯视雕饰的屋脊，山峰平原尽收眼底，河流迂回令人惊叹。\n房舍密集，有不少官宦人家；船只堵塞了渡口，有许多装饰着青雀黄龙头形的大船。\n云消雨散，阳光普照。晚霞与孤独的野鸭一起飞翔，秋天的江水与辽阔的天空浑然一色。`, appreciation:`落霞与孤鹜齐飞，秋水共长天一色，被誉为千古绝唱，展现初唐气象。`, grade:`高中`, tags:[`古文`,`写景`,`王勃`] },
  { id:10, title:`论语（节选）`, author:`孔子及其弟子`, content:`子曰：“学而时习之，不亦说乎？有朋自远方来，不亦乐乎？\n人不知而不愠，不亦君子乎？”\n\n子曰：“温故而知新，可以为师矣。”\n\n子曰：“学而不思则罔，思而不学则殆。”\n\n子曰：“三人行，必有我师焉。择其善者而从之，其不善者而改之。”`, translation:`孔子说：“学习并且按时温习，不也很愉快吗？有志同道合的人从远方来，不也很快乐吗？人家不了解我，我却不恼怒，不也是君子吗？”\n\n孔子说：“温习旧知识从而得到新的理解与体会，凭借这一点就可以成为老师了。”\n\n孔子说：“只学习却不思考就会迷惑，只空想却不学习就会疑惑。”\n\n孔子说：“几个人一起走路，其中必定有可以做我老师的人。我选取他们的优点而学习，对他们的缺点则加以改正。”`, appreciation:`儒家经典，记录了孔子及其弟子的言行，蕴含着丰富的人生智慧和教育理念。`, grade:`初中`, tags:[`儒家`,`教育`,`孔子`] },
];

const formulas = [
  { id:1, subject:`数学`, grade:`小学`, category:`四则运算`, name:`加法交换律`, formula:`a + b = b + a`, desc:`两数相加，交换加数的位置，和不变。` },
  { id:2, subject:`数学`, grade:`小学`, category:`面积`, name:`长方形面积`, formula:`S = a × b`, desc:`长方形面积 = 长 × 宽` },
  { id:3, subject:`数学`, grade:`小学`, category:`面积`, name:`正方形面积`, formula:`S = a²`, desc:`正方形面积 = 边长 × 边长` },
  { id:4, subject:`数学`, grade:`初中`, category:`代数`, name:`平方差公式`, formula:`a² - b² = (a+b)(a-b)`, desc:`两个数的平方差，等于这两个数的和与这两个数的差的积。` },
  { id:5, subject:`数学`, grade:`初中`, category:`代数`, name:`完全平方公式`, formula:`(a ± b)² = a² ± 2ab + b²`, desc:`两数和（或差）的平方，等于它们的平方和加上（或减去）它们积的2倍。` },
  { id:6, subject:`数学`, grade:`初中`, category:`几何`, name:`勾股定理`, formula:`a² + b² = c²`, desc:`直角三角形两直角边的平方和等于斜边的平方。` },
  { id:7, subject:`数学`, grade:`高中`, category:`三角函数`, name:`正弦定理`, formula:`a/sinA = b/sinB = c/sinC = 2R`, desc:`三角形中，各边与其对角的正弦之比相等，且等于外接圆直径。` },
  { id:8, subject:`数学`, grade:`高中`, category:`三角函数`, name:`余弦定理`, formula:`c² = a² + b² - 2ab·cosC`, desc:`三角形中，一边的平方等于其他两边平方的和减去这两边与其夹角余弦乘积的2倍。` },
  { id:9, subject:`数学`, grade:`高中`, category:`导数`, name:`基本导数公式`, formula:`(xⁿ)' = nxⁿ⁻¹`, desc:`幂函数的导数：x的n次方的导数等于n乘以x的n-1次方。` },
  { id:10, subject:`物理`, grade:`初中`, category:`力学`, name:`牛顿第二定律`, formula:`F = ma`, desc:`物体加速度的大小跟作用力成正比，跟物体的质量成反比，加速度的方向跟作用力的方向相同。` },
  { id:11, subject:`物理`, grade:`高中`, category:`电磁学`, name:`欧姆定律`, formula:`I = U/R`, desc:`通过导体的电流跟导体两端的电压成正比，跟导体的电阻成反比。` },
  { id:12, subject:`化学`, grade:`初中`, category:`化学方程式`, name:`水的电解`, formula:`2H₂O → 2H₂↑ + O₂↑`, desc:`水在通电条件下分解为氢气和氧气，体积比为2:1。` },
];

const words = [
  { id:1, word:`apple`, phonetic:`/ˈæpl/`, meaning:`苹果`, example:`I eat an apple every day.`, grade:`小学`, module:`Unit 1` },
  { id:2, word:`happy`, phonetic:`/ˈhæpi/`, meaning:`快乐的`, example:`She feels happy today.`, grade:`小学`, module:`Unit 1` },
  { id:3, word:`school`, phonetic:`/skuːl/`, meaning:`学校`, example:`I go to school by bus.`, grade:`小学`, module:`Unit 2` },
  { id:4, word:`beautiful`, phonetic:`/ˈbjuːtɪfl/`, meaning:`美丽的`, example:`The flower is beautiful.`, grade:`小学`, module:`Unit 3` },
  { id:5, word:`because`, phonetic:`/bɪˈkɒz/`, meaning:`因为`, example:`I like summer because I can swim.`, grade:`初中`, module:`Unit 1` },
  { id:6, word:`important`, phonetic:`/ɪmˈpɔːtnt/`, meaning:`重要的`, example:`This is an important meeting.`, grade:`初中`, module:`Unit 2` },
  { id:7, word:`environment`, phonetic:`/ɪnˈvaɪrənmənt/`, meaning:`环境`, example:`We should protect the environment.`, grade:`初中`, module:`Unit 3` },
  { id:8, word:`opportunity`, phonetic:`/ˌɒpəˈtjuːnəti/`, meaning:`机会`, example:`This is a good opportunity to learn.`, grade:`高中`, module:`Unit 1` },
  { id:9, word:`responsible`, phonetic:`/rɪˈspɒnsəbl/`, meaning:`有责任心的`, example:`We should be responsible for our actions.`, grade:`高中`, module:`Unit 2` },
  { id:10, word:`phenomenon`, phonetic:`/fɪˈnɒmɪnən/`, meaning:`现象`, example:`This is a common natural phenomenon.`, grade:`高中`, module:`Unit 3` },
];

const idioms = [
  { id:1, word:`画龙点睛`, pinyin:`huà lóng diǎn jing`, meaning:`比喻在关键地方加上精辟的语句或举动，使内容更加生动传神。`, usage:`这篇文章的结尾真是画龙点睛之笔。`, grade:`小学` },
  { id:2, word:`守株待兔`, pinyin:`shou zhu dai tu`, meaning:`比喻不主动努力，而存万一的侥幸心理，希望得到意外的收获。`, usage:`学习不能守株待兔，要主动进取。`, grade:`小学` },
  { id:3, word:`亡羊补牢`, pinyin:`wang yang bu lao`, meaning:`比喻出了问题以后想办法补救，可以防止继续受损失。`, usage:`虽然这次考试没考好，但亡羊补牢，为时不晚。`, grade:`小学` },
  { id:4, word:`锲而不舍`, pinyin:`qie er bu she`, meaning:`比喻有恒心，有毅力，坚持不懈。`, usage:`学习要有锲而不舍的精神。`, grade:`初中` },
  { id:5, word:`厚积薄发`, pinyin:`hou ji bo fa`, meaning:`长期大量地积累，然后少量地慢慢释放出来。形容只有准备充分才能办好事情。`, usage:`只有厚积薄发，才能在考场上从容应对。`, grade:`初中` },
  { id:6, word:`破釜沉舟`, pinyin:`po fu chen zhou`, meaning:`比喻下决心不顾一切地干到底。`, usage:`面对高考，我们要有破釜沉舟的勇气。`, grade:`高中` },
  { id:7, word:`举一反三`, pinyin:`ju yi fan san`, meaning:`比喻从一件事情类推而知道其他许多事情。`, usage:`学习要举一反三，不能死记硬背。`, grade:`初中` },
  { id:8, word:`温故知新`, pinyin:`wen gu zhi xin`, meaning:`温习旧知识从而得到新的理解和体会。`, usage:`复习时要学会温故知新。`, grade:`初中` },
];

const knowledgePoints = [
  // 小学
  { id:1, grade:`小学`, subject:`语文`, chapter:`一年级上`, title:`拼音基础`, content:`声母23个：b p m f d t n l g k h j q x zh ch sh r z c s y w\n韵母24个：a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong\n整体认读音节：zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying`, type:`基础` },
  { id:2, grade:`小学`, subject:`数学`, chapter:`二年级上`, title:`乘法口诀`, content:`一一得一，一二得二……一一得一\n乘法是加法的简便运算。例如：3×4 = 3+3+3+3 = 12`, type:`基础` },
  { id:3, grade:`小学`, subject:`英语`, chapter:`三年级上`, title:`英文字母`, content:`26个英文字母：Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz\n五大元音字母：A E I O U`, type:`基础` },
  // 初中
  { id:10, grade:`初中`, subject:`数学`, chapter:`八年级上`, title:`一次函数`, content:`一次函数的一般形式：y = kx + b（k≠0）\nk>0时，y随x增大而增大；k<0时，y随x增大而减小。\nb是y轴截距，即x=0时y的值。`, type:`重点` },
  { id:11, grade:`初中`, subject:`物理`, chapter:`八年级下`, title:`牛顿第一定律`, content:`一切物体在没有受到力的作用时，总保持静止状态或匀速直线运动状态。\n这就是牛顿第一定律，也叫惯性定律。\n惯性是物体保持原来运动状态不变的性质，一切物体都有惯性。`, type:`重点` },
  { id:12, grade:`初中`, subject:`化学`, chapter:`九年级上`, title:`元素周期表`, content:`元素周期表共有7个周期、18个族。\n前20号元素：氢氦锂铍硼，碳氮氧氟氖，钠镁铝硅磷，硫氯氩钾钙。\n金属元素一般写在左边，非金属元素写在右边。`, type:`重点` },
  // 高中
  { id:20, grade:`高中`, subject:`数学`, chapter:`必修一`, title:`函数的基本性质`, content:`函数的单调性：对于定义域I内某个区间D上的任意两个自变量的值x₁、x₂，当x₁<x₂时，都有f(x₁)<f(x₂)，那么就说函数f(x)在区间D上是增函数。\n函数的奇偶性：若f(-x)=f(x)，则为偶函数；若f(-x)=-f(x)，则为奇函数。`, type:`考点` },
  { id:21, grade:`高中`, subject:`物理`, chapter:`必修一`, title:`匀变速直线运动`, content:`速度公式：v = v₀ + at\n位移公式：x = v₀t + ½at²\n速度位移公式：v² - v₀² = 2ax\n自由落体运动：v = gt，h = ½gt²`, type:`考点` },
  { id:22, grade:`高中`, subject:`化学`, chapter:`必修一`, title:`氧化还原反应`, content:`氧化还原反应的本质：电子的转移（得失或偏移）\n氧化反应：失电子，化合价升高，被氧化\n还原反应：得电子，化合价降低，被还原\n口诀：升失氧，降得还`, type:`考点` },
  { id:23, grade:`高中`, subject:`语文`, chapter:`必修上`, title:`古诗文鉴赏方法`, content:`鉴赏古诗文的步骤：\n1. 读懂字面意思（翻译）\n2. 把握意象和意境\n3. 分析表现手法（比喻、拟人、对偶、用典等）\n4. 体会思想感情（忧国忧民、思乡怀人、壮志难酬等）\n5. 品味语言特色（豪放、婉约、清新、沉郁等）`, type:`方法` },
];

const quizBanks = [
  // 小学题库
  { id:1, grade:`小学`, subject:`数学`, type:`基础`, chapter:`二年级`, questions:[
    { q:`3 + 5 = ?`, options:[`7`,`8`,`9`,`10`], answer:1, explanation:`3加5等于8。`, knowledge:`加法运算` },
    { q:`15 - 8 = ?`, options:[`5`,`6`,`7`,`8`], answer:2, explanation:`15减8等于7。`, knowledge:`减法运算` },
    { q:`4 × 6 = ?`, options:[`20`,`24`,`28`,`30`], answer:1, explanation:`4乘以6等于24。`, knowledge:`乘法运算` },
    { q:`下面哪个是等边三角形？`, options:[`三条边都不相等`,`只有两条边相等`,`三条边都相等`,`不知道`], answer:2, explanation:`等边三角形的定义是三条边都相等。`, knowledge:`三角形分类` },
    { q:`1小时 = 多少分钟？`, options:[`50`,`60`,`70`,`100`], answer:1, explanation:`1小时等于60分钟。`, knowledge:`时间单位` },
  ]},
  // 初中题库
  { id:2, grade:`初中`, subject:`数学`, type:`提升`, chapter:`八年级`, questions:[
    { q:`如果一次函数 y = 2x + 3，当 x = 1 时，y = ?`, options:[`2`,`3`,`5`,`6`], answer:2, explanation:`将x=1代入：y = 2×1 + 3 = 5。`, knowledge:`一次函数` },
    { q:`下列哪个是勾股定理的表达式？`, options:[`a + b = c`,`a² + b² = c²`,`a³ + b³ = c³`,`2a + 2b = 2c`], answer:1, explanation:`直角三角形两直角边的平方和等于斜边的平方，即a²+b²=c²。`, knowledge:`勾股定理` },
    { q:`解不等式：2x - 4 > 0`, options:[`x > 1`,`x > 2`,`x < 2`,`x < 1`], answer:1, explanation:`2x - 4 > 0 → 2x > 4 → x > 2。`, knowledge:`一元一次不等式` },
    { q:`平行四边形的对角线互相？`, options:[`相等`,`垂直`,`平分`,`平行`], answer:2, explanation:`平行四边形的对角线互相平分。`, knowledge:`平行四边形性质` },
    { q:`tan30° 的值是多少？`, options:[`√3/2`,`√3/3`,`1/2`,`1`], answer:1, explanation:`tan30° = √3/3，这是特殊角的三角函数值，需要牢记。`, knowledge:`三角函数` },
  ]},
  // 高中题库
  { id:3, grade:`高中`, subject:`数学`, type:`难题`, chapter:`必修一`, questions:[
    { q:`函数 f(x) = x² - 4x + 3 的最小值是？`, options:[`-1`,`0`,`1`,`3`], answer:0, explanation:`f(x) = x²-4x+3 = (x-2)²-1，当x=2时取最小值-1。`, knowledge:`二次函数最值` },
    { q:`已知集合 A = {1,2,3}，B = {2,3,4}，则 A∩B = ?`, options:[`{1}`,`{2,3}`,`{1,2,3,4}`,`{4}`], answer:1, explanation:`交集是两个集合共有的元素，A∩B = {2,3}。`, knowledge:`集合运算` },
    { q:`lim(x→0) sinx/x = ?`, options:[`0`,`1`,`∞`,`不存在`], answer:1, explanation:`这是重要极限之一：lim(x→0) sinx/x = 1。`, knowledge:`极限` },
    { q:`复数 (1+i)² 等于？`, options:[`2i`,`1+2i`,`2`,`0`], answer:0, explanation:`(1+i)² = 1 + 2i + i² = 1 + 2i - 1 = 2i。`, knowledge:`复数运算` },
    { q:`若 log₂x = 3，则 x = ?`, options:[`6`,`8`,`9`,`12`], answer:1, explanation:`log₂x = 3 意味着 2³ = x，所以 x = 8。`, knowledge:`对数运算` },
  ]},
  // 小学语文
  { id:4, grade:`小学`, subject:`语文`, type:`基础`, chapter:`三年级`, questions:[
    { q:`"床前明月光"的下一句是？`, options:[`疑是地上霜`,`举头望明月`,`低头思故乡`,`不知明镜里`], answer:0, explanation:`出自李白《静夜思》：床前明月光，疑是地上霜。举头望明月，低头思故乡。`, knowledge:`古诗文背诵` },
    { q:`下列哪个字是翘舌音？`, options:[`吃`,`次`,`四`,`字`], answer:0, explanation:`"吃"的拼音是chī，声母ch是翘舌音。`, knowledge:`拼音` },
    { q:`"快乐"的反义词是？`, options:[`高兴`,`悲伤`,`开心`,`愉快`], answer:1, explanation:`快乐表示心情好，反义词是悲伤。`, knowledge:`反义词` },
    { q:`下列词语中，没有错别字的是？`, options:[`万马奔腾`,`兴高彩烈`,`穿流不息`,`迫不急待`], answer:0, explanation:`B应为"兴高采烈"，C应为"川流不息"，D应为"迫不及待"。`, knowledge:`错别字辨析` },
    { q:`"春天来了，花儿笑了。"这句话用了什么修辞手法？`, options:[`比喻`,`拟人`,`排比`,`夸张`], answer:1, explanation:`"花儿笑了"把花当作人来写，是拟人修辞手法。`, knowledge:`修辞手法` },
  ]},
  // 初中英语
  { id:5, grade:`初中`, subject:`英语`, type:`基础`, chapter:`七年级`, questions:[
    { q:`What's this in English?`, options:[`It's a apple.`,`It's an apple.`,`It's apple.`,`This is apple.`], answer:1, explanation:`apple以元音音素开头，前面用an，不用a。`, knowledge:`冠词用法` },
    { q:`She ___ to school every day.`, options:[`go`,`goes`,`going`,`went`], answer:1, explanation:`every day表示经常性动作，用一般现在时，主语she是第三人称单数，动词加es。`, knowledge:`一般现在时` },
    { q:`There ___ some water in the glass.`, options:[`is`,`are`,`am`,`be`], answer:0, explanation:`water是不可数名词，be动词用is。`, knowledge:`there be句型` },
    { q:`My mother is ___ teacher.`, options:[`a`,`an`,`the`,`/`], answer:0, explanation:`teacher以辅音音素开头，用a。`, knowledge:`冠词用法` },
    { q:`How many ___ are there in the box?`, options:[`apple`,`apples`,`apple's`,`apples'`], answer:1, explanation:`how many后面接可数名词复数形式。`, knowledge:`名词复数` },
  ]},
];

const appData = {
  user: { grade:`小学`, level:`三年级`, textbook:`人教版`, studyDays:7, totalMinutes:125, todayMinutes:18, streak:3 },
  subjects: [`语文`,`数学`,`英语`,`物理`,`化学`,`生物`,`历史`,`地理`,`政治`],
  tools: [
    { icon:`📖`, name:`古诗文`, desc:`带翻译赏析`, page:`tools` },
    { icon:`📝`, name:`单词背诵`, desc:`同步课本词库`, page:`tools` },
    { icon:`📐`, name:`公式大全`, desc:`数理化公式汇总`, page:`tools` },
    { icon:`📚`, name:`成语词典`, desc:`释义+例句`, page:`tools` },
    { icon:`🧮`, name:`口算练习`, desc:`每日一练`, page:`tools` },
    { icon:`⏱️`, name:`考试倒计时`, desc:`自定义提醒`, page:`tools` },
    { icon:`📋`, name:`知识备忘录`, desc:`学习笔记`, page:`tools` },
    { icon:`✅`, name:`学习打卡`, desc:`每日记录`, page:`tools` },
  ],
  wrongBooks: [],
  studyLog: [],
};

const output = `// ============================================================
// K12学习助手 - 数据库（自动生成，请勿手动修改）
// ============================================================

export const poems = ${JSON.stringify(poems, null, 2)};

export const formulas = ${JSON.stringify(formulas, null, 2)};

export const words = ${JSON.stringify(words, null, 2)};

export const idioms = ${JSON.stringify(idioms, null, 2)};

export const knowledgePoints = ${JSON.stringify(knowledgePoints, null, 2)};

export const quizBanks = ${JSON.stringify(quizBanks, null, 2)};

export const appData = ${JSON.stringify(appData, null, 2)};
`;

// 不行，JSON.stringify 会把值变成双引号字符串，如果值里有双引号还是会出问题
// 改用直接输出 JS 对象字面量

function toJS(obj, indent=0) {
  const pad = ' '.repeat(indent);
  const pad1 = ' '.repeat(indent+2);
  if (Array.isArray(obj)) {
    return `[\n${pad1}` + obj.map(v => toJS(v, indent+2)).join(`,\n${pad1}`) + `\n${pad}]`;
  }
  if (obj !== null && typeof obj === 'object') {
    const entries = Object.entries(obj);
    return `{\n${pad1}` + entries.map(([k,v]) => `${k}: ${toJS(v, indent+2)}`).join(`,\n${pad1}`) + `\n${pad}}`;
  }
  if (typeof obj === 'string') {
    // 如果字符串里有反引号，用双引号包裹并转义
    if (obj.includes('`')) {
      return JSON.stringify(obj);
    }
    return '`' + obj + '`';
  }
  return String(obj);
}

const output2 = `// ============================================================
// K12学习助手 - 数据库（反引号字符串，安全无转义问题）
// ============================================================

export const poems = ${toJS(poems)};

export const formulas = ${toJS(formulas)};

export const words = ${toJS(words)};

export const idioms = ${toJS(idioms)};

export const knowledgePoints = ${toJS(knowledgePoints)};

export const quizBanks = ${toJS(quizBanks)};

export const appData = ${toJS(appData)};
`;

fs.writeFileSync('C:/Users/BeEverYoung/WorkBuddy/2026-06-19-14-08-25/miniapp/src/data.js', output2, 'utf8');
console.log('data.js regenerated successfully!');

// 验证
try {
  const test = fs.readFileSync('C:/Users/BeEverYoung/WorkBuddy/2026-06-19-14-08-25/miniapp/src/data.js', 'utf8');
  new Function(test);
  console.log('✅ JS syntax verified OK');
} catch(e) {
  console.log('❌ Syntax error:', e.message);
}

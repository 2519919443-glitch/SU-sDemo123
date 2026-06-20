/**
 * 完整版数据统计生成脚本
 * 按照真实课本章节，为所有年级添加知识点和题库
 * 使用方法: node build_data_full.js
 */

const fs = require('fs');
const path = require('path');

// ============ 辅助函数 ============
function makeId(prefix, num) {
  return prefix + '_' + String(num).padStart(3, '0');
}

function j(s) {
  return JSON.stringify(s);
}

// ============ 真实课本章节结构 ============

// 小学 1-6 年级 - 语文（部编版）
const chinesePrimary = {
  1: { textbook: '部编版一年级上', chapters: ['我上学了', '汉语拼音', '识字', '课文'] },
  2: { textbook: '部编版一年级下', chapters: ['识字', '课文', '口语交际'] },
  3: { textbook: '部编版二年级上', chapters: ['课文', '识字', '语文园地'] },
  4: { textbook: '部编版二年级下', chapters: ['课文', '识字', '口语交际'] },
  5: { textbook: '部编版三年级上', chapters: ['课文', '习作', '语文园地', '快乐读书吧'] },
  6: { textbook: '部编版三年级下', chapters: ['课文', '习作', '语文园地'] },
};

// 小学 1-6 年级 - 数学（人教版）
const mathPrimary = {
  1: { textbook: '人教版一年级上', chapters: ['准备课', '位置', '1~5的认识和加减法', '认识图形（一）', '6~10的认识和加减法', '11~20各数的认识', '认识钟表', '20以内的进位加法'] },
  2: { textbook: '人教版一年级下', chapters: ['认识图形（二）', '20以内的退位减法', '分类与整理', '100以内数的认识', '认识人民币', '100以内的加法和减法（一）', '找规律'] },
  3: { textbook: '人教版二年级上', chapters: ['长度单位', '100以内的加法和减法（二）', '角的初步认识', '表内乘法（一）', '观察物体（一）', '表内乘法（二）', '认识时间', '数学广角'] },
  4: { textbook: '人教版二年级下', chapters: ['数据收集整理', '表内除法（一）', '图形的运动（一）', '表内除法（二）', '混合运算', '有余数的除法', '万以内数的认识', '克和千克', '数学广角'] },
  5: { textbook: '人教版三年级上', chapters: ['时、分、秒', '万以内的加法和减法（一）', '测量', '万以内的加法和减法（二）', '倍的认识', '多位数乘一位数', '长方形和正方形', '分数的初步认识', '数学广角'] },
  6: { textbook: '人教版三年级下', chapters: ['位置与方向', '除数是一位数的除法', '复式统计表', '两位数乘两位数', '面积', '年、月、日', '小数的初步认识', '数学广角'] },
};

// 小学 3-6 年级 - 英语（PEP）
const englishPrimary = {
  3: { textbook: 'PEP三年级上', chapters: ['Unit 1 Hello!', 'Unit 2 Colours', 'Unit 3 Look at me!', 'Unit 4 We love animals', 'Unit 5 Let\'s eat!', 'Unit 6 Happy birthday!'] },
  4: { textbook: 'PEP三年级下', chapters: ['Unit 1 Welcome back to school!', 'Unit 2 My family', 'Unit 3 At the zoo', 'Unit 4 Where is my car?', 'Unit 5 Do you like pears?', 'Unit 6 How many?'] },
  5: { textbook: 'PEP四年级上', chapters: ['Unit 1 My classroom', 'Unit 2 My schoolbag', 'Unit 3 My friends', 'Unit 4 My home', 'Unit 5 Dinner\'s ready', 'Unit 6 Meet my family!'] },
  6: { textbook: 'PEP四年级下', chapters: ['Unit 1 Our school', 'Unit 2 What time is it?', 'Unit 3 Weather', 'Unit 4 At the farm', 'Unit 5 My clothes', 'Unit 6 Shopping'] },
};

// 初中 7-9 年级
const juniorChapters = {
  chinese: {
    7: { textbook: '部编版七年级上', chapters: ['第一单元 四季美景', '第二单元 至爱亲情', '第三单元 学习生活', '第四单元 人生之舟', '第五单元 动物与人', '第六单元 想象之翼'] },
    8: { textbook: '部编版七年级下', chapters: ['第一单元 群星闪耀', '第二单元 家国情怀', '第三单元 小人物', '第四单元 修身正己', '第五单元 哲理之思', '第六单元 科幻探险'] },
    9: { textbook: '部编版八年级上', chapters: ['第一单元 新闻阅读', '第二单元 人物刻画', '第三单元 景物描写', '第四单元 情感抒发', '第五单元 事物说明', '第六单元 文言文阅读'] },
  },
  math: {
    7: { textbook: '人教版七年级上', chapters: ['第一章 有理数', '第二章 整式的加减', '第三章 一元一次方程', '第四章 几何图形初步'] },
    8: { textbook: '人教版七年级下', chapters: ['第五章 相交线与平行线', '第六章 实数', '第七章 平面直角坐标系', '第八章 二元一次方程组', '第九章 不等式与不等式组', '第十章 数据的收集、整理与描述'] },
    9: { textbook: '人教版八年级上', chapters: ['第十一章 三角形', '第十二章 全等三角形', '第十三章 轴对称', '第十四章 整式的乘法与因式分解', '第十五章 分式'] },
  },
  english: {
    7: { textbook: '人教版七年级上', chapters: ['Starter Units 1-3', 'Unit 1 My name\'s Gina.', 'Unit 2 This is my sister.', 'Unit 3 Is this your pencil?', 'Unit 4 Where\'s my schoolbag?', 'Unit 5 Do you have a soccer ball?', 'Unit 6 Do you like bananas?', 'Unit 7 How much are these socks?', 'Unit 8 When is your birthday?', 'Unit 9 My favorite subject is science.'] },
    8: { textbook: '人教版七年级下', chapters: ['Unit 1 Can you play the guitar?', 'Unit 2 What time do you go to school?', 'Unit 3 How do you get to school?', 'Unit 4 Don\'t eat in class.', 'Unit 5 Why do you like pandas?', 'Unit 6 I\'m watching TV.', 'Unit 7 It\'s raining!', 'Unit 8 Is there a post office near here?', 'Unit 9 What does he look like?', 'Unit 10 I\'d like some noodles.'] },
    9: { textbook: '人教版八年级上', chapters: ['Unit 1 Where did you go on vacation?', 'Unit 2 How often do you exercise?', 'Unit 3 I\'m more outgoing than my sister.', 'Unit 4 What\'s the best movie theater?', 'Unit 5 Do you want to watch a game show?', 'Unit 6 I\'m going to study computer science.', 'Unit 7 Will people have robots?', 'Unit 8 How do you make a banana milk shake?', 'Unit 9 Can you come to my party?', 'Unit 10 If you go to the party, you\'ll have a great time!'] },
  },
  physics: {
    8: { textbook: '人教版八年级上', chapters: ['第一章 机械运动', '第二章 声现象', '第三章 物态变化', '第四章 光现象', '第五章 透镜及其应用', '第六章 质量与密度'] },
    9: { textbook: '人教版八年级下', chapters: ['第七章 力', '第八章 运动和力', '第九章 压强', '第十章 浮力', '第十一章 功和机械能', '第十二章 简单机械'] },
  },
  chemistry: {
    9: { textbook: '人教版九年级上', chapters: ['第一单元 走进化学世界', '第二单元 我们周围的空气', '第三单元 物质构成的奥秘', '第四单元 自然界的水', '第五单元 化学方程式', '第六单元 碳和碳的氧化物', '第七单元 燃料及其利用'] },
  },
  biology: {
    7: { textbook: '人教版七年级上', chapters: ['第一单元 生物和生物圈', '第二单元 生物体的结构层次', '第三单元 生物圈中的绿色植物'] },
    8: { textbook: '人教版七年级下', chapters: ['第四单元 生物圈中的人', '人体的营养', '人体的呼吸', '人体内物质的运输', '人体内废物的排出', '人体生命活动的调节'] },
  },
  history: {
    7: { textbook: '部编版七年级上', chapters: ['第一单元 史前时期', '第二单元 夏商周时期', '第三单元 秦汉时期', '第四单元 三国两晋南北朝时期'] },
    8: { textbook: '部编版七年级下', chapters: ['第一单元 隋唐时期', '第二单元 辽宋夏金元时期', '第三单元 明清时期'] },
  },
  geography: {
    7: { textbook: '人教版七年级上', chapters: ['第一章 地球和地图', '第二章 陆地和海洋', '第三章 天气与气候', '第四章 居民与聚落', '第五章 发展与合作'] },
    8: { textbook: '人教版七年级下', chapters: ['第六章 我们生活的大洲——亚洲', '第七章 我们邻近的地区和国家', '第八章 东半球其他的地区和国家', '第九章 西半球的国家', '第十章 极地地区'] },
  },
  politics: {
    7: { textbook: '部编版七年级上', chapters: ['第一单元 成长的节拍', '第二单元 友谊的天空', '第三单元 师长情谊', '第四单元 生命的思考'] },
    8: { textbook: '部编版七年级下', chapters: ['第一单元 青春时光', '第二单元 做情绪情感的主人', '第三单元 在集体中成长', '第四单元 走进法治天地'] },
  },
};

// 高中 10-12 年级（高一至高三）
const seniorChapters = {
  chinese: {
    10: { textbook: '部编版必修第一册', chapters: ['第一单元 青春的价值', '第二单元 劳动的价值', '第三单元 生命的诗意', '第四单元 家乡文化生活'] },
    11: { textbook: '部编版必修第二册', chapters: ['第一单元 社会镜像', '第二单元 良知与悲悯', '第三单元 多样化的文化', '第四单元 信息时代的语文生活'] },
    12: { textbook: '部编版选择性必修', chapters: ['第一单元 古代散文', '第二单元 古典小说', '第三单元 现代戏剧', '第四单元 学术论著'] },
  },
  math: {
    10: { textbook: '人教版必修第一册', chapters: ['第一章 集合与常用逻辑用语', '第二章 一元二次函数、方程和不等式', '第三章 函数的概念与性质', '第四章 指数函数与对数函数', '第五章 三角函数'] },
    11: { textbook: '人教版必修第二册', chapters: ['第六章 平面向量及其应用', '第七章 复数', '第八章 立体几何初步', '第九章 统计', '第十章 概率'] },
    12: { textbook: '人教版选择性必修', chapters: ['第一章 空间向量与立体几何', '第二章 直线和圆的方程', '第三章 圆锥曲线的方程', '第四章 数列', '第五章 导数及其应用'] },
  },
  english: {
    10: { textbook: '人教版必修第一册', chapters: ['Unit 1 Teenage Life', 'Unit 2 Travelling Around', 'Unit 3 Sports and Fitness', 'Unit 4 Natural Disasters', 'Unit 5 Languages Around the World'] },
    11: { textbook: '人教版必修第二册', chapters: ['Unit 1 Cultural Heritage', 'Unit 2 Wildlife Protection', 'Unit 3 The Internet', 'Unit 4 History and Traditions', 'Unit 5 Music'] },
    12: { textbook: '人教版选择性必修第一册', chapters: ['Unit 1 People of Achievement', 'Unit 2 Looking into the Future', 'Unit 3 Fascinating Parks', 'Unit 4 Body Language', 'Unit 5 Working the Land'] },
  },
  physics: {
    10: { textbook: '人教版必修第一册', chapters: ['第一章 运动的描述', '第二章 匀变速直线运动', '第三章 相互作用——力', '第四章 运动和力的关系'] },
    11: { textbook: '人教版必修第二册', chapters: ['第五章 抛体运动', '第六章 圆周运动', '第七章 万有引力与天体运动', '第八章 机械能守恒定律'] },
    12: { textbook: '人教版必修第三册', chapters: ['第九章 静电场', '第十章 恒定电流', '第十一章 磁场', '第十二章 电磁感应'] },
  },
  chemistry: {
    10: { textbook: '人教版必修第一册', chapters: ['第一章 物质及其变化', '第二章 海水中的重要元素——钠和氯', '第三章 铁 金属材料', '第四章 物质结构 元素周期律'] },
    11: { textbook: '人教版必修第二册', chapters: ['第五章 化工生产中的重要非金属元素', '第六章 化学反应与能量', '第七章 有机化合物', '第八章 化学与可持续发展'] },
    12: { textbook: '人教版选择性必修', chapters: ['第一章 化学反应原理', '第二章 物质结构与性质', '第三章 有机化学基础'] },
  },
  biology: {
    10: { textbook: '人教版必修1 分子与细胞', chapters: ['第一章 走近细胞', '第二章 组成细胞的分子', '第三章 细胞的基本结构', '第四章 细胞的物质输入和输出', '第五章 细胞的能量供应和利用', '第六章 细胞的生命历程'] },
    11: { textbook: '人教版必修2 遗传与进化', chapters: ['第一章 遗传因子的发现', '第二章 基因和染色体的关系', '第三章 基因的本质', '第四章 基因的表达', '第五章 基因突变及其他变异', '第六章 生物的进化'] },
  },
  history: {
    10: { textbook: '部编版必修 中外历史纲要（上）', chapters: ['第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固', '第二单元 三国两晋南北朝的民族交融与隋唐统一多民族封建国家的发展', '第三单元 辽宋夏金多民族政权的并立与元朝的统一', '第四单元 明清中国版图的奠定与面临的挑战'] },
    11: { textbook: '部编版必修 中外历史纲要（下）', chapters: ['第一单元 古代文明的产生与发展', '第二单元 资本主义制度的确立', '第三单元 资本主义世界殖民体系的形成', '第四单元 第一次世界大战与俄国十月革命'] },
  },
  geography: {
    10: { textbook: '人教版必修第一册', chapters: ['第一章 宇宙中的地球', '第二章 地球上的大气', '第三章 地球上的水', '第四章 地貌', '第五章 植被与土壤', '第六章 自然灾害'] },
    11: { textbook: '人教版必修第二册', chapters: ['第一章 人口', '第二章 城镇和乡村', '第三章 产业区位选择', '第四章 环境与发展'] },
  },
  politics: {
    10: { textbook: '部编版必修1 中国特色社会主义', chapters: ['第一课 社会主义从空想到科学、从理论到实践的发展', '第二课 只有社会主义才能救中国', '第三课 只有中国特色社会主义才能发展中国', '第四课 只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴'] },
    11: { textbook: '部编版必修2 经济与社会', chapters: ['第一单元 基本经济制度与经济体制', '第二单元 经济发展与社会进步'] },
  },
};

// ============ 生成知识点 ============
let kpId = 1;
const knowledgePoints = [];

function addKP(grade, subject, textbook, chapter, title, type, content) {
  knowledgePoints.push({
    id: makeId('kp', kpId++),
    grade,
    subject,
    textbook,
    chapter,
    title,
    type, // 基础/重点/考点
    content,
    mastery: 0,
  });
}

// -------- 小学语文知识点 --------
for (const [grade, info] of Object.entries(chinesePrimary)) {
  for (const chapter of info.chapters) {
    if (chapter === '我上学了') {
      addKP(grade, '语文', info.textbook, chapter, '识字与认读', '基础', '认识常用汉字，掌握基本的识字方法');
      addKP(grade, '语文', info.textbook, chapter, '学习姿势', '基础', '正确的读书姿势和写字姿势');
    } else if (chapter === '汉语拼音') {
      addKP(grade, '语文', info.textbook, chapter, '声母表', '重点', '23个声母：b p m f d t n l g k h j q x zh ch sh r z c s y w');
      addKP(grade, '语文', info.textbook, chapter, '韵母表', '重点', '24个韵母：a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong');
      addKP(grade, '语文', info.textbook, chapter, '整体认读音节', '考点', '16个整体认读音节：zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying');
    } else if (chapter === '识字') {
      addKP(grade, '语文', info.textbook, chapter, '常用汉字', '基础', '认识300-400个常用汉字，会写其中100-200个');
      addKP(grade, '语文', info.textbook, chapter, '笔顺规则', '重点', '先横后竖、先撇后捺、从上到下、从左到右、先外后内、先中间后两边');
    } else if (chapter === '课文') {
      addKP(grade, '语文', info.textbook, chapter, '朗读技巧', '基础', '正确、流利、有感情地朗读课文');
      addKP(grade, '语文', info.textbook, chapter, '理解词句', '重点', '结合上下文理解词句的意思');
    }
  }
}

// -------- 小学数学知识点 --------
for (const [grade, info] of Object.entries(mathPrimary)) {
  for (const chapter of info.chapters) {
    if (chapter.includes('加减法')) {
      addKP(grade, '数学', info.textbook, chapter, '进位加法', '重点', '凑十法：看大数，分小数，凑成十，算得数');
      addKP(grade, '数学', info.textbook, chapter, '退位减法', '重点', '破十法：十几减9，几加1；十几减几，几加几');
    } else if (chapter.includes('乘法')) {
      addKP(grade, '数学', info.textbook, chapter, '乘法口诀', '考点', '熟记1-9的乘法口诀，能熟练运用');
      addKP(grade, '数学', info.textbook, chapter, '乘除法关系', '重点', '乘法是求几个相同加数和的简便运算');
    } else if (chapter.includes('除法')) {
      addKP(grade, '数学', info.textbook, chapter, '除法算理', '重点', '被除数÷除数=商……余数，余数必须小于除数');
      addKP(grade, '数学', info.textbook, chapter, '平均分', '基础', '每份分得同样多，叫平均分');
    } else if (chapter === '长度单位') {
      addKP(grade, '数学', info.textbook, chapter, '长度单位换算', '考点', '1米=10分米=100厘米，1厘米=10毫米');
    } else if (chapter === '时间') {
      addKP(grade, '数学', info.textbook, chapter, '时分的换算', '重点', '1时=60分，1分=60秒，时针走一大格是1小时');
    } else if (chapter === '认识图形') {
      addKP(grade, '数学', info.textbook, chapter, '图形认识', '基础', '认识长方体、正方体、圆柱、球等立体图形');
    } else {
      addKP(grade, '数学', info.textbook, chapter, chapter + '基本概念', '基础', '掌握' + chapter + '的基本概念和计算方法');
    }
  }
}

// -------- 初中知识点（示例：七年级上语文、数学） --------
// 七年级上 语文
const c7chapters = juniorChapters.chinese[7].chapters;
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[0], '春（朱自清）', '重点', '掌握比喻、拟人等修辞手法，体会作者对春天的热爱');
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[0], '济南的冬天（老舍）', '重点', '体会情景交融的写法，掌握对比的手法');
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[1], '散步（莫怀戚）', '重点', '体会尊老爱幼的传统美德，掌握细节描写');
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[2], '从百草园到三味书屋（鲁迅）', '考点', '掌握对比写法，理解作者对童年的怀念');
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[3], '纪念白求恩（毛泽东）', '重点', '掌握议论文的基本结构，理解白求恩精神');
addKP('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[5], '皇帝的新装（安徒生）', '考点', '掌握童话的特点，理解讽刺手法');

// 七年级上 数学
const m7chapters = juniorChapters.math[7].chapters;
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[0], '有理数概念', '基础', '有理数包括整数和分数，0既不是正数也不是负数');
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[0], '数轴', '重点', '数轴三要素：原点、正方向、单位长度');
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[0], '绝对值', '考点', '绝对值表示数轴上某点到原点的距离，|a|≥0');
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[1], '整式加减', '重点', '同类项可以合并，合并同类项时系数相加减');
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[2], '一元一次方程', '考点', '掌握等式的性质，能熟练解一元一次方程');
addKP('7', '数学', juniorChapters.math[7].textbook, m7chapters[3], '立体图形', '基础', '常见的立体图形有长方体、正方体、圆柱、圆锥、球等');

// 七年级上 英语
const e7chapters = juniorChapters.english[7].chapters;
addKP('7', '英语', juniorChapters.english[7].textbook, e7chapters[1], 'be动词用法', '考点', 'I用am，you用are，is连着他她它，单数is复数are');
addKP('7', '英语', juniorChapters.english[7].textbook, e7chapters[1], '形容词性物主代词', '重点', 'my your his her its our your their，后面必须接名词');
addKP('7', '英语', juniorChapters.english[7].textbook, e7chapters[3], '指示代词', '基础', 'this/that指单数，these/those指复数；this/these指近处，that/those指远处');
addKP('7', '英语', juniorChapters.english[7].textbook, e7chapters[5], 'have/has用法', '重点', 'have表示"有"，第三人称单数用has，否定句助动词用do/does');
addKP('7', '英语', juniorChapters.english[7].textbook, e7chapters[7], '购物用语', '基础', 'How much is/are...? It\'s/They\'re... dollars.');

// 八年级上 物理
if (juniorChapters.physics[8]) {
  const p8chapters = juniorChapters.physics[8].chapters;
  addKP('8', '物理', juniorChapters.physics[8].textbook, p8chapters[0], '长度和时间的测量', '基础', '长度单位换算：1km=1000m，1m=10dm=100cm=1000mm');
  addKP('8', '物理', juniorChapters.physics[8].textbook, p8chapters[1], '声音的产生和传播', '重点', '声音是由物体振动产生的，传播需要介质，真空不能传声');
  addKP('8', '物理', juniorChapters.physics[8].textbook, p8chapters[3], '光的反射', '考点', '反射定律：反射光线、入射光线和法线在同一平面内；反射角等于入射角');
  addKP('8', '物理', juniorChapters.physics[8].textbook, p8chapters[4], '凸透镜成像', '考点', 'u>2f：倒立缩小实像；f<u<2f：倒立放大实像；u<f：正立放大虚像');
  addKP('8', '物理', juniorChapters.physics[8].textbook, p8chapters[5], '质量与密度', '重点', '密度公式：ρ=m/V，单位是kg/m³或g/cm³');
}

// -------- 高中知识点（示例：高一上语文、数学） --------
const c10chapters = seniorChapters.chinese[10].chapters;
addKP('10', '语文', seniorChapters.chinese[10].textbook, c10chapters[0], '沁园春·长沙', '重点', '体会毛泽东以天下为己任的革命情怀，掌握情景交融的手法');
addKP('10', '语文', seniorChapters.chinese[10].textbook, c10chapters[2], '短歌行（曹操）', '考点', '理解曹操求贤若渴的心情，掌握用典和比喻的手法');
addKP('10', '语文', seniorChapters.chinese[10].textbook, c10chapters[2], '归园田居（陶渊明）', '重点', '理解陶渊明厌弃官场、回归自然的心情，掌握白描手法');

const m10chapters = seniorChapters.math[10].chapters;
addKP('10', '数学', seniorChapters.math[10].textbook, m10chapters[0], '集合的概念', '基础', '集合是由一些确定的、互不相同的对象组成的整体');
addKP('10', '数学', seniorChapters.math[10].textbook, m10chapters[0], '集合的运算', '重点', '交集A∩B、并集A∪B、补集∁UA，掌握Venn图表示法');
addKP('10', '数学', seniorChapters.math[10].textbook, m10chapters[2], '函数概念', '考点', '函数是特殊的映射，要求：定义域非空、值域是子集、每个x对应唯一y');
addKP('10', '数学', seniorChapters.math[10].textbook, m10chapters[2], '函数单调性', '考点', 'f(x1)<f(x2)为增函数，f(x1)>f(x2)为减函数');
addKP('10', '数学', seniorChapters.math[10].textbook, m10chapters[3], '指数函数', '重点', 'y=a^x，a>0且a≠1；a>1时单调递增，0<a<1时单调递减');

// ============ 生成题库 ============
let qId = 1;
const quizBanks = [];

function addQ(grade, subject, textbook, chapter, difficulty, question, options, answer, explanation) {
  quizBanks.push({
    id: makeId('q', qId++),
    grade,
    subject,
    textbook,
    chapter,
    difficulty, // 易/中/难
    question,
    options,
    answer,
    explanation,
  });
}

// -------- 小学语文题 --------
const pyChapters = chinesePrimary[1].chapters;
addQ('1', '语文', chinesePrimary[1].textbook, '汉语拼音', '易',
  '下列哪个是整体认读音节？',
  ['zhi', 'ba', 'ma', 'he'],
  'A', '整体认读音节有16个，zhi是其中之一，ba、ma、he都不是');
addQ('1', '语文', chinesePrimary[1].textbook, '汉语拼音', '易',
  '"b"属于什么声母？',
  ['双唇音', '唇齿音', '舌尖音', '舌根音'],
  'A', 'b、p、m是双唇音，发音时双唇先闭合再打开');
addQ('1', '语文', chinesePrimary[1].textbook, '识字', '中',
  '"山"字共有几画？',
  ['2画', '3画', '4画', '5画'],
  'B', '"山"字共3画：竖、竖折、竖');
addQ('1', '语文', chinesePrimary[1].textbook, '识字', '易',
  '下列哪个字是左右结构？',
  ['星', '田', '日', '口'],
  'A', '"星"是上下结构…不对，"星"是上下结构。"明"才是左右结构。正确答案是"星"是上下结构，题目有误，应选"明"——但选项中没有，说明这道题在知识库里需要修正。',
  '解析见知识点');

// 修正：重新出一道有效的题
quizBanks.pop();
addQ('1', '语文', chinesePrimary[1].textbook, '识字', '易',
  '"大"字的笔顺正确的是？',
  ['横、撇、捺', '撇、横、捺', '捺、横、撇', '横、捺、撇'],
  'A', '"大"字的正确笔顺是：横、撇、捺，先写横，再写撇，最后写捺');

// -------- 小学数学题 --------
const pm1chapters = mathPrimary[1].chapters;
addQ('1', '数学', mathPrimary[1].textbook, '1~5的认识和加减法', '易',
  '1 + 3 = ?',
  ['2', '3', '4', '5'],
  'C', '1+3=4，可以通过数手指或画图来验证');
addQ('1', '数学', mathPrimary[1].textbook, '6~10的认识和加减法', '易',
  '10 - 4 = ?',
  ['4', '5', '6', '7'],
  'C', '10-4=6，因为4+6=10，所以10-4=6');
addQ('1', '数学', mathPrimary[1].textbook, '20以内的进位加法', '中',
  '9 + 5 = ?',
  ['12', '13', '14', '15'],
  'C', '用凑十法：9+5=9+1+4=10+4=14');
addQ('2', '数学', mathPrimary[2].textbook, '20以内的退位减法', '中',
  '15 - 8 = ?',
  ['5', '6', '7', '8'],
  'C', '用破十法：15-8=10-8+5=2+5=7');
addQ('2', '数学', mathPrimary[2].textbook, '100以内数的认识', '易',
  '最大的两位数是？',
  ['10', '90', '99', '100'],
  'C', '最大的两位数是99，100是三位数');
addQ('3', '数学', mathPrimary[3].textbook, '表内乘法（一）', '易',
  '3 × 4 = ?',
  ['7', '10', '12', '15'],
  'C', '三四十二，3×4=12');
addQ('3', '数学', mathPrimary[3].textbook, '表内乘法（一）', '中',
  '一个星期有7天，3个星期有几天？',
  ['14天', '21天', '28天', '35天'],
  'B', '7×3=21（天），或7+7+7=21（天）');

// -------- 初中语文题 --------
addQ('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[0], '易',
  '《春》的作者是？',
  ['老舍', '朱自清', '鲁迅', '巴金'],
  'B', '《春》是朱自清的散文名篇，选自《朱自清全集》');
addQ('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[0], '中',
  '"吹面不寒杨柳风"用了什么修辞手法？',
  ['比喻', '拟人', '引用', '排比'],
  'C', '这句话引用了南宋志南和尚的诗句，是引用手法');
addQ('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[2], '中',
  '《从百草园到三味书屋》选自鲁迅的哪部作品？',
  ['《呐喊》', '《彷徨》', '《朝花夕拾》', '《野草》'],
  'C', '《从百草园到三味书屋》选自鲁迅的散文集《朝花夕拾》');
addQ('7', '语文', juniorChapters.chinese[7].textbook, c7chapters[5], '难',
  '《皇帝的新装》的体裁是？',
  ['小说', '散文', '童话', '戏剧'],
  'C', '《皇帝的新装》是丹麦作家安徒生的童话作品');

// -------- 初中数学题 --------
addQ('7', '数学', juniorChapters.math[7].textbook, m7chapters[0], '易',
  '|-3| = ?',
  ['-3', '0', '3', '±3'],
  'C', '绝对值表示一个数到原点的距离，距离是非负数，所以|-3|=3');
addQ('7', '数学', juniorChapters.math[7].textbook, m7chapters[0], '易',
  '下列哪个数是负数？',
  ['0', '+(-2)', '-(-2)', '|-2|'],
  'B', '+(-2)=-2是负数；-(-2)=2是正数；|-2|=2是正数；0既不是正数也不是负数');
addQ('7', '数学', juniorChapters.math[7].textbook, m7chapters[1], '中',
  '化简：3x + 5x = ?',
  ['8', '8x', '15x', '35x'],
  'B', '3x+5x=(3+5)x=8x，合并同类项时系数相加');
addQ('7', '数学', juniorChapters.math[7].textbook, m7chapters[2], '中',
  '解方程：2x + 3 = 11，x = ?',
  ['4', '5', '6', '7'],
  'A', '2x+3=11，2x=11-3=8，x=8÷2=4');
addQ('7', '数学', juniorChapters.math[7].textbook, m7chapters[2], '难',
  '甲、乙两地相距360km，一辆汽车从甲地开往乙地，每小时行驶60km，问几小时到达？',
  ['5小时', '6小时', '7小时', '8小时'],
  'B', '时间=路程÷速度=360÷60=6（小时）');

// -------- 初中英语题 --------
addQ('7', '英语', juniorChapters.english[7].textbook, e7chapters[1], '易',
  '_____ name is Linda.',
  ['I', 'My', 'Me', 'Mine'],
  'B', '形容词性物主代词my后面接名词name，句意为"我的名字是Linda"');
addQ('7', '英语', juniorChapters.english[7].textbook, e7chapters[1], '易',
  '— What\'s your name? — _____ name is Tom.',
  ['I', 'My', 'He', 'She'],
  'B', '问名字，回答时用my name is...，故选B');
addQ('7', '英语', juniorChapters.english[7].textbook, e7chapters[3], '中',
  '— Is this _____ pencil? — Yes, it\'s _____.',
  ['you; me', 'your; my', 'your; mine', 'you; mine'],
  'C', '第一空用形容词性物主代词your修饰pencil，第二空用名词性物主代词mine=my pencil');

// -------- 高中数学题 --------
addQ('10', '数学', seniorChapters.math[10].textbook, m10chapters[0], '易',
  '下列哪个选项可以表示集合？',
  ['{1, 2, 2, 3}', '{高个子男生}', '{x | x > 0}', '{大约等于1的数}'],
  'C', '集合的元素必须确定，C用描述法明确表示了元素的特征，可以构成集合');
addQ('10', '数学', seniorChapters.math[10].textbook, m10chapters[0], '中',
  '集合A={1,2,3}，集合B={2,3,4}，则A∩B = ?',
  ['{1}', '{1,2,3,4}', '{2,3}', '{4}'],
  'C', '交集是两个集合共有的元素，A∩B={2,3}');
addQ('10', '数学', seniorChapters.math[10].textbook, m10chapters[2], '中',
  '函数f(x) = x²是？',
  ['奇函数', '偶函数', '既是奇函数又是偶函数', '非奇非偶函数'],
  'B', 'f(-x)=(-x)²=x²=f(x)，所以f(x)=x²是偶函数');
addQ('10', '数学', seniorChapters.math[10].textbook, m10chapters[3], '难',
  '函数y = 2^x过点(0, ?)',
  ['0', '1', '2', '无法确定'],
  'B', '当x=0时，y=2^0=1，所以函数y=2^x过点(0,1)');

// -------- 高中语文题 --------
addQ('10', '语文', seniorChapters.chinese[10].textbook, c10chapters[0], '中',
  '"独立寒秋，湘江北去，橘子洲头"出自哪位作者？',
  ['毛泽东', '周恩来', '朱德', '邓小平'],
  'A', '这句词出自毛泽东的《沁园春·长沙》');
addQ('10', '语文', seniorChapters.chinese[10].textbook, c10chapters[2], '难',
  '"山不厌高，海不厌深"用了什么手法？',
  ['比喻', '用典', '拟人', '对偶'],
  'B', '这句话化用了《管子·形势解》中的典故，表达曹操渴望贤才的心情');

// -------- 八年级物理题 --------
if (juniorChapters.physics[8]) {
  addQ('8', '物理', juniorChapters.physics[8].textbook, juniorChapters.physics[8].chapters[1], '易',
    '声音是由什么产生的？',
    ['热运动', '振动', '电流', '光波'],
    'B', '声音是由物体振动产生的，振动停止，发声也停止');
  addQ('8', '物理', juniorChapters.physics[8].textbook, juniorChapters.physics[8].chapters[1], '中',
    '声音不能在什么中传播？',
    ['空气', '水', '固体', '真空'],
    'D', '声音的传播需要介质（固体、液体、气体），真空不能传声');
  addQ('8', '物理', juniorChapters.physics[8].textbook, juniorChapters.physics[8].chapters[3], '中',
    '光在真空中的传播速度是？',
    ['3×10^5 m/s', '3×10^8 m/s', '340 m/s', '1500 m/s'],
    'B', '光在真空中的传播速度约为3×10^8 m/s（三十万千米每秒）');
  addQ('8', '物理', juniorChapters.physics[8].textbook, juniorChapters.physics[8].chapters[4], '难',
    '凸透镜的焦距是10cm，当物体放在距透镜15cm处时，成什么像？',
    ['倒立缩小实像', '倒立放大实像', '正立放大虚像', '不成像'],
    'B', 'f=10cm，则f<u=15cm<2f=20cm，此时成倒立、放大的实像，是投影仪的原理');
}

// -------- 九年级化学题 --------
if (juniorChapters.chemistry[9]) {
  addQ('9', '化学', juniorChapters.chemistry[9].textbook, juniorChapters.chemistry[9].chapters[1], '易',
    '化学变化和物理变化的本质区别是？',
    ['是否有颜色变化', '是否有气体生成', '是否有新物质生成', '是否放热'],
    'C', '化学变化的本质是有新物质生成，物理变化没有新物质生成');
  addQ('9', '化学', juniorChapters.chemistry[9].textbook, juniorChapters.chemistry[9].chapters[2], '中',
    '空气中含量最多的气体是？',
    ['氧气', '二氧化碳', '氮气', '稀有气体'],
    'C', '空气中氮气约占78%，氧气约占21%，氮气是含量最多的气体');
}

// ============ 诗词数据（保留原有） ============
const poems = [
  { id: 'p001', title: '静夜思', dynasty: '唐', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。', appreciation: '这首诗写作者在秋日夜晚仰望明月时，油然而生的思乡之情。语言朴素自然，意味深长。', tags: ['写景', '思乡'] },
  { id: 'p002', title: '春晓', dynasty: '唐', author: '孟浩然', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', appreciation: '写春天早晨的景象，表达了作者对春天的喜爱和对落花的惋惜之情。', tags: ['写景', '春天'] },
  { id: 'p003', title: '悯农', dynasty: '唐', author: '李绅', content: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', appreciation: '表达了农民劳动的艰辛，告诫人们要珍惜粮食。', tags: ['田园', '励志'] },
  { id: 'p004', title: '登鹳雀楼', dynasty: '唐', author: '王之涣', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', appreciation: '蕴含"站得高看得远"的哲理，激励人们不断进取。', tags: ['励志', '哲理'] },
  { id: 'p005', title: '江雪', dynasty: '唐', author: '柳宗元', content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。', appreciation: '描绘了一幅寒江独钓图，表达了作者清高孤傲的品格。', tags: ['写景', '冬天'] },
  { id: 'p006', title: '咏鹅', dynasty: '唐', author: '骆宾王', content: '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。', appreciation: '相传是骆宾王七岁时所作，生动描绘了鹅的形象和动作。', tags: ['写景', '动物'] },
  { id: 'p007', title: '望庐山瀑布', dynasty: '唐', author: '李白', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', appreciation: '运用夸张和比喻的手法，描绘了庐山瀑布雄奇壮丽的景色。', tags: ['写景', '山水'] },
  { id: 'p008', title: '赠汪伦', dynasty: '唐', author: '李白', content: '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', appreciation: '表达了朋友之间深厚的友情，用桃花潭水的深来衬托友情的更深。', tags: ['友情', '送别'] },
  { id: 'p009', title: '早发白帝城', dynasty: '唐', author: '李白', content: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', appreciation: '表达了作者遇赦后愉快的心情，舟行如飞，心情畅快。', tags: ['写景', '抒情'] },
  { id: 'p010', title: '游子吟', dynasty: '唐', author: '孟郊', content: '慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。', appreciation: '歌颂了母爱的伟大，表达了游子对母亲的感恩之情。', tags: ['亲情', '感恩'] },
  { id: 'p011', title: '水调歌头', dynasty: '宋', author: '苏轼', content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。', appreciation: '表达了作者对人生哲理的思考和对亲人的思念，意境深远。', tags: ['哲理', '思乡'] },
  { id: 'p012', title: '念奴娇·赤壁怀古', dynasty: '宋', author: '苏轼', content: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。', appreciation: '描绘了赤壁古战场的壮阔景象，缅怀历史人物，感叹人生如梦。', tags: ['怀古', '豪放'] },
  { id: 'p013', title: '满江红', dynasty: '宋', author: '岳飞', content: '怒发冲冠，凭栏处、潇潇雨歇。抬望眼、仰天长啸，壮怀激烈。三十功名尘与土，八千里路云和月。', appreciation: '表达了岳飞精忠报国的壮志豪情，气势磅礴，感人至深。', tags: ['爱国', '励志'] },
  { id: 'p014', title: '虞美人', dynasty: '南唐', author: '李煜', content: '春花秋月何时了？往事知多少。小楼昨夜又东风，故国不堪回首月明中。', appreciation: '表达了亡国之君的哀愁，感情深沉，感人至深。', tags: ['抒情', '亡国'] },
  { id: 'p015', title: '沁园春·雪', dynasty: '现代', author: '毛泽东', content: '北国风光，千里冰封，万里雪飘。望长城内外，惟余莽莽；大河上下，顿失滔滔。', appreciation: '描绘了北国壮丽的雪景，表达了作者的豪情壮志和爱国情怀。', tags: ['写景', '爱国'] },
];

// ============ 单词数据 ============
const words = [
  { id: 'w001', word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果', example: 'I eat an apple every day.', tags: ['食物', '水果'] },
  { id: 'w002', word: 'book', phonetic: '/bʊk/', meaning: '书', example: 'This is a good book.', tags: ['学习', '物品'] },
  { id: 'w003', word: 'cat', phonetic: '/kæt/', meaning: '猫', example: 'I have a cute cat.', tags: ['动物'] },
  { id: 'w004', word: 'dog', phonetic: '/dɒɡ/', meaning: '狗', example: 'The dog is running.', tags: ['动物'] },
  { id: 'w005', word: 'egg', phonetic: '/eɡ/', meaning: '鸡蛋', example: 'I had eggs for breakfast.', tags: ['食物'] },
  { id: 'w006', word: 'fish', phonetic: '/fɪʃ/', meaning: '鱼', example: 'Fish live in water.', tags: ['动物', '食物'] },
];

// ============ 成语数据 ============
const idioms = [
  { id: 'i001', word: '画蛇添足', explanation: '画好了蛇，又添上脚。比喻做了多余的事，反而有害无益。', source: '《战国策·齐策二》', example: '他已经把事情做得很好了，就不要再画蛇添足了。', tags: ['寓言', '教训'] },
  { id: 'i002', word: '守株待兔', explanation: '守着树桩等待兔子撞上来。比喻不主动努力，而存万一的侥幸心理。', source: '《韩非子·五蠹》', example: '学习不能守株待兔，要主动进取。', tags: ['寓言', '教训'] },
  { id: 'i003', word: '亡羊补牢', explanation: '丢失了羊再去修补羊圈。比喻出了问题以后想办法补救，可以防止继续受损失。', source: '《战国策·楚策四》', example: '虽然这次考试没考好，但亡羊补牢，为时不晚。', tags: ['寓言', '励志'] },
  { id: 'i004', word: '胸有成竹', explanation: '画竹子之前心中已有了竹子的形象。比喻做事之前已有通盘的考虑和谋划。', source: '苏轼《文与可画筼筜谷偃竹记》', example: '他对这次比赛胸有成竹。', tags: ['励志', '准备'] },
  { id: 'i005', word: '卧薪尝胆', explanation: '睡觉睡在柴草上，吃饭睡觉都尝苦胆。形容人刻苦自励，发奋图强。', source: '《史记·越王勾践世家》', example: '我们要有卧薪尝胆的精神，才能取得成功。', tags: ['励志', '历史'] },
];

// ============ 公式数据 ============
const formulas = [
  { id: 'f001', name: '长方形面积', formula: 'S = a × b', subject: '数学', grade: '3', explanation: '长方形的面积等于长乘宽', tags: ['几何', '面积'] },
  { id: 'f002', name: '正方形面积', formula: 'S = a²', subject: '数学', grade: '3', explanation: '正方形的面积等于边长乘边长', tags: ['几何', '面积'] },
  { id: 'f003', name: '三角形面积', formula: 'S = ½ × a × h', subject: '数学', grade: '5', explanation: '三角形的面积等于底乘高除以二', tags: ['几何', '面积'] },
  { id: 'f004', name: '密度公式', formula: 'ρ = m / V', subject: '物理', grade: '8', explanation: '密度等于质量除以体积', tags: ['力学', '密度'] },
  { id: 'f005', name: '欧姆定律', formula: 'I = U / R', subject: '物理', grade: '9', explanation: '电流等于电压除以电阻', tags: ['电学', '电路'] },
  { id: 'f006', name: '速度公式', formula: 'v = s / t', subject: '物理', grade: '8', explanation: '速度等于路程除以时间', tags: ['力学', '运动'] },
];

// ============ 输出 data.js ============
let output = '// 自动生成于 ' + new Date().toISOString() + '\n';
output += '// 知识点数量：' + knowledgePoints.length + '  题库数量：' + quizBanks.length + '\n\n';
output += 'const poems = ' + JSON.stringify(poems, null, 2) + ';\n\n';
output += 'const words = ' + JSON.stringify(words, null, 2) + ';\n\n';
output += 'const idioms = ' + JSON.stringify(idioms, null, 2) + ';\n\n';
output += 'const formulas = ' + JSON.stringify(formulas, null, 2) + ';\n\n';
output += 'const knowledgePoints = ' + JSON.stringify(knowledgePoints, null, 2) + ';\n\n';
output += 'const quizBanks = ' + JSON.stringify(quizBanks, null, 2) + ';\n\n';
output += '// 挂载到 window.AppData\n';
output += 'window.AppData = window.AppData || {};\n';
output += 'window.AppData.poems = poems;\n';
output += 'window.AppData.words = words;\n';
output += 'window.AppData.idioms = idioms;\n';
output += 'window.AppData.formulas = formulas;\n';
output += 'window.AppData.knowledgePoints = knowledgePoints;\n';
output += 'window.AppData.quizBanks = quizBanks;\n';

const outputPath = path.join(__dirname, 'src', 'data.js');
fs.writeFileSync(outputPath, output, 'utf8');

console.log('✅ data.js 生成完毕！');
console.log('   知识点：' + knowledgePoints.length);
console.log('   题库：' + quizBanks.length);
console.log('   诗词：' + poems.length);
console.log('   单词：' + words.length);
console.log('   成语：' + idioms.length);
console.log('   公式：' + formulas.length);
console.log('输出路径：' + outputPath);

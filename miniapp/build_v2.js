/**
 * K12学习助手 - 完整题库生成脚本 V2
 * 目标：为每个年级的核心学科添加大量题目
 * 使用方法: node build_v2.js
 */

const fs = require('fs');
const path = require('path');

// ============ 辅助函数 ============
function makeId(prefix, num) {
  return prefix + '_' + String(num).padStart(4, '0');
}

// 安全的JSON字符串化（处理中文引号等）
function safe(str) {
  return JSON.stringify(str);
}

// ============ 章节结构定义 ============
// （同 build_data_full.js，保留章节结构）
const structure = {
  primary: {
    chinese: { // 语文 1-6
      1: { tb: '部编版一年级上', ch: ['我上学了','汉语拼音','识字','课文'] },
      2: { tb: '部编版一年级下', ch: ['识字','课文','口语交际'] },
      3: { tb: '部编版二年级上', ch: ['课文','识字','语文园地'] },
      4: { tb: '部编版二年级下', ch: ['课文','识字','口语交际'] },
      5: { tb: '部编版三年级上', ch: ['课文','习作','语文园地','快乐读书吧'] },
      6: { tb: '部编版三年级下', ch: ['课文','习作','语文园地'] },
    },
    math: { // 数学 1-6
      1: { tb: '人教版一年级上', ch: ['准备课','位置','1~5的认识和加减法','认识图形一','6~10的认识和加减法','11~20各数的认识','认识钟表','20以内的进位加法'] },
      2: { tb: '人教版一年级下', ch: ['认识图形二','20以内的退位减法','分类与整理','100以内数的认识','认识人民币','100以内的加法和减法一','找规律'] },
      3: { tb: '人教版二年级上', ch: ['长度单位','100以内的加法和减法二','角的初步认识','表内乘法一','观察物体一','表内乘法二','认识时间','数学广角'] },
      4: { tb: '人教版二年级下', ch: ['数据收集整理','表内除法一','图形的运动一','表内除法二','混合运算','有余数的除法','万以内数的认识','克和千克','数学广角'] },
      5: { tb: '人教版三年级上', ch: ['时分数','万以内的加法和减法一','测量','万以内的加法和减法二','倍的认识','多位数乘一位数','长方形和正方形','分数的初步认识','数学广角'] },
      6: { tb: '人教版三年级下', ch: ['位置与方向','除数是一位数的除法','复式统计表','两位数乘两位数','面积','年月日','小数的初步认识','数学广角'] },
    },
    english: { // 英语 3-6
      3: { tb: 'PEP三年级上', ch: ['Unit1 Hello','Unit2 Colours','Unit3 Look at me','Unit4 We love animals','Unit5 Let\'s eat','Unit6 Happy birthday'] },
      4: { tb: 'PEP三年级下', ch: ['Unit1 Welcome back','Unit2 My family','Unit3 At the zoo','Unit4 Where is my car','Unit5 Do you like pears','Unit6 How many'] },
      5: { tb: 'PEP四年级上', ch: ['Unit1 My classroom','Unit2 My schoolbag','Unit3 My friends','Unit4 My home','Unit5 Dinner\'s ready','Unit6 Meet my family'] },
      6: { tb: 'PEP四年级下', ch: ['Unit1 Our school','Unit2 What time is it','Unit3 Weather','Unit4 At the farm','Unit5 My clothes','Unit6 Shopping'] },
    }
  },
  junior: { // 初中 7-9
    chinese: {
      7: { tb: '部编版七年级上', ch: ['第一单元 四季美景','第二单元 至爱亲情','第三单元 学习生活','第四单元 人生之舟','第五单元 动物与人','第六单元 想象之翼'] },
      8: { tb: '部编版七年级下', ch: ['第一单元 群星闪耀','第二单元 家国情怀','第三单元 小人物','第四单元 修身正己','第五单元 哲理之思','第六单元 科幻探险'] },
      9: { tb: '部编版八年级上', ch: ['第一单元 新闻阅读','第二单元 人物刻画','第三单元 景物描写','第四单元 情感抒发','第五单元 事物说明','第六单元 文言文阅读'] },
    },
    math: {
      7: { tb: '人教版七年级上', ch: ['第一章 有理数','第二章 整式的加减','第三章 一元一次方程','第四章 几何图形初步'] },
      8: { tb: '人教版七年级下', ch: ['第五章 相交线与平行线','第六章 实数','第七章 平面直角坐标系','第八章 二元一次方程组','第九章 不等式与不等式组','第十章 数据的收集整理与描述'] },
      9: { tb: '人教版八年级上', ch: ['第十一章 三角形','第十二章 全等三角形','第十三章 轴对称','第十四章 整式的乘法与因式分解','第十五章 分式'] },
    },
    english: {
      7: { tb: '人教版七年级上', ch: ['Starter','Unit1 My name','Unit2 This is my sister','Unit3 Is this your pencil','Unit4 Where\'s my schoolbag','Unit5 Do you have a soccer ball','Unit6 Do you like bananas','Unit7 How much','Unit8 When is your birthday','Unit9 My favorite subject'] },
      8: { tb: '人教版七年级下', ch: ['Unit1 Can you play','Unit2 What time','Unit3 How do you get','Unit4 Don\'t eat in class','Unit5 Why do you like pandas','Unit6 I\'m watching TV','Unit7 It\'s raining','Unit8 Is there a post office','Unit9 What does he look like','Unit10 I\'d like some noodles'] },
      9: { tb: '人教版八年级上', ch: ['Unit1 Where did you go','Unit2 How often','Unit3 I\'m more outgoing','Unit4 What\'s the best','Unit5 Do you want to','Unit6 I\'m going to','Unit7 Will people','Unit8 How do you make','Unit9 Can you come','Unit10 If you go'] },
    },
    physics: {
      8: { tb: '人教版八年级上', ch: ['第一章 机械运动','第二章 声现象','第三章 物态变化','第四章 光现象','第五章 透镜及其应用','第六章 质量与密度'] },
      9: { tb: '人教版八年级下', ch: ['第七章 力','第八章 运动和力','第九章 压强','第十章 浮力','第十一章 功和机械能','第十二章 简单机械'] },
    },
    chemistry: {
      9: { tb: '人教版九年级上', ch: ['第一单元 走进化学世界','第二单元 我们周围的空气','第三单元 物质构成的奥秘','第四单元 自然界的水','第五单元 化学方程式','第六单元 碳和碳的氧化物','第七单元 燃料及其利用'] },
    },
  },
  senior: { // 高中 10-12
    chinese: {
      10: { tb: '部编版必修第一册', ch: ['第一单元 青春的价值','第二单元 劳动的价值','第三单元 生命的诗意','第四单元 家乡文化生活'] },
      11: { tb: '部编版必修第二册', ch: ['第一单元 社会镜像','第二单元 良知与悲悯','第三单元 多样化的文化','第四单元 信息时代的语文生活'] },
      12: { tb: '部编版选择性必修', ch: ['第一单元 古代散文','第二单元 古典小说','第三单元 现代戏剧','第四单元 学术论著'] },
    },
    math: {
      10: { tb: '人教版必修第一册', ch: ['第一章 集合与常用逻辑用语','第二章 一元二次函数方程和不等式','第三章 函数的概念与性质','第四章 指数函数与对数函数','第五章 三角函数'] },
      11: { tb: '人教版必修第二册', ch: ['第六章 平面向量及其应用','第七章 复数','第八章 立体几何初步','第九章 统计','第十章 概率'] },
      12: { tb: '人教版选择性必修', ch: ['第一章 空间向量与立体几何','第二章 直线和圆的方程','第三章 圆锥曲线的方程','第四章 数列','第五章 导数及其应用'] },
    },
    english: {
      10: { tb: '人教版必修第一册', ch: ['Unit1 Teenage Life','Unit2 Travelling Around','Unit3 Sports and Fitness','Unit4 Natural Disasters','Unit5 Languages Around the World'] },
      11: { tb: '人教版必修第二册', ch: ['Unit1 Cultural Heritage','Unit2 Wildlife Protection','Unit3 The Internet','Unit4 History and Traditions','Unit5 Music'] },
      12: { tb: '人教版选择性必修第一册', ch: ['Unit1 People of Achievement','Unit2 Looking into the Future','Unit3 Fascinating Parks','Unit4 Body Language','Unit5 Working the Land'] },
    },
    physics: {
      10: { tb: '人教版必修第一册', ch: ['第一章 运动的描述','第二章 匀变速直线运动','第三章 相互作用——力','第四章 运动和力的关系'] },
      11: { tb: '人教版必修第二册', ch: ['第五章 抛体运动','第六章 圆周运动','第七章 万有引力与天体运动','第八章 机械能守恒定律'] },
      12: { tb: '人教版必修第三册', ch: ['第九章 静电场','第十章 恒定电流','第十一章 磁场','第十二章 电磁感应'] },
    },
  }
};

// ============ 题目数据池 ============
// 按"年级-学科-章节索引"组织
const questionPool = {};

function reg(grade, subject, chapterIdx, q) {
  const key = grade + '-' + subject + '-' + chapterIdx;
  questionPool[key] = questionPool[key] || [];
  questionPool[key].push({ grade, subject, chapterIdx, ...q });
}

// -------- 小学语文题 --------
// 一年级上
reg(1,'语文',2,{ q:'"p"的发音部位是？', opts:['双唇音','唇齿音','舌尖中音','舌根音'], ans:'A', diff:'易', exp:'p是双唇音声母，发音时双唇先闭合再突然打开' });
reg(1,'语文',2,{ q:'下列哪个韵母是单韵母？', opts:['ai','ou','a','ie'], ans:'C', diff:'易', exp:'单韵母有a o e i u ü，a是单韵母' });
reg(1,'语文',2,{ q:'"yue"属于什么？', opts:['声母','韵母','整体认读音节','声调'], ans:'C', diff:'中', exp:'yue是16个整体认读音节之一' });
reg(1,'语文',3,{ q:'"人"字共有几画？', opts:['1画','2画','3画','4画'], ans:'B', diff:'易', exp:'"人"字共2画：撇、捺' });
reg(1,'语文',3,{ q:'下列哪个字是独体字？', opts:['星','河','山','明'], ans:'C', diff:'中', exp:'"山"是独体字，"星""河""明"都是合体字' });
reg(1,'语文',3,{ q:'"火"的笔顺正确的是？', opts:['点、撇、撇、捺','撇、点、撇、捺','点、点、撇、捺','捺、点、撇、撇'], ans:'A', diff:'中', exp:'"火"的正确笔顺是：点、撇、撇、捺' });
reg(1,'语文',0,{ q:'上学路上要注意什么？', opts:['可以闯红灯','要走人行横道','可以跟陌生人走','可以在马路上玩'], ans:'B', diff:'易', exp:'上学路上要走人行横道，注意交通安全' });

// 一年级下
reg(1,'语文',0,{ q:'"春"字可以组什么词？', opts:['春天','春见','春手','春口'], ans:'A', diff:'易', exp:'"春"可以组词：春天、春风、春节等' });
reg(1,'语文',0,{ q:'下列哪个字是左右结构？', opts:['花','河','田','日'], ans:'B', diff:'易', exp:'"河"是左右结构（氵+可），"花"是上下结构' });

// 二年级上
reg(2,'语文',0,{ q:'"碧绿"的"碧"字怎么写？', opts:['王白石','白王石','石王白','白石化'], ans:'A', diff:'中', exp:'"碧"字由"王、白、石"组成，上部是"王白"并列' });
reg(2,'语文',0,{ q:'下列词语中，没有错别字的是？', opts:['以经','已经','已前','已后'], ans:'B', diff:'易', exp:'"已经"是正确的写法，"以"和"已"用法不同' });

// 三年级上
reg(3,'语文',0,{ q:'"层林尽染"中"染"的意思是？', opts:['染色','好像染过一样','沾染','传染'], ans:'B', diff:'中', exp:'"层林尽染"形容秋天的树林像被染过颜色一样美丽' });
reg(3,'语文',0,{ q:'下列哪个是比喻句？', opts:['他跑得很快。','她像她妈妈。','月亮像一个大圆盘。','我喜欢读书。'], ans:'C', diff:'中', exp:'比喻句要有本体、喻体和比喻词，"月亮像大圆盘"是比喻' });

// -------- 小学数学题 --------
// 一年级
reg(1,'数学',2,{ q:'2 + 3 = ?', opts:['4','5','6','7'], ans:'B', diff:'易', exp:'2+3=5，可以用数手指的方法验证' });
reg(1,'数学',2,{ q:'5 - 2 = ?', opts:['2','3','4','5'], ans:'B', diff:'易', exp:'5-2=3，因为2+3=5，所以5-2=3' });
reg(1,'数学',4,{ q:'下列哪个是正方体？', opts:['篮球','魔方','乒乓球','足球'], ans:'B', diff:'易', exp:'魔方是正方体，有6个面，每个面都是正方形' });
reg(1,'数学',5,{ q:'7 + 2 = ?', opts:['8','9','10','11'], ans:'B', diff:'易', exp:'7+2=9' });
reg(1,'数学',5,{ q:'10 - 3 = ?', opts:['6','7','8','9'], ans:'B', diff:'易', exp:'10-3=7' });
reg(1,'数学',6,{ q:'15是由几个十和几个一组成的？', opts:['1个十5个一','5个十1个一','15个十','15个一'], ans:'A', diff:'中', exp:'15的十位是1（表示1个十），个位是5（表示5个一）' });
reg(1,'数学',7,{ q:'分针指向12，时针指向3，是几时？', opts:['3时','12时','6时','9时'], ans:'A', diff:'易', exp:'分针指向12，时针指向几就是几时' });
reg(1,'数学',7,{ q:'下列哪个时间最早？', opts:['8时','10时','6时','12时'], ans:'C', diff:'易', exp:'6时最早，其次是8时、10时、12时' });

// 二年级
reg(2,'数学',1,{ q:'下列哪个图形是长方形？', opts:['○','△','□','☆'], ans:'C', diff:'易', exp:'□是长方形（或正方形），○是圆形，△是三角形' });
reg(2,'数学',1,{ q:'13 - 5 = ?', opts:['7','8','9','10'], ans:'B', diff:'易', exp:'13-5=8，用破十法：10-5+3=8' });
reg(2,'数学',3,{ q:'按规律填数：2, 4, 6, ( ), 10', opts:['7','8','9','11'], ans:'B', diff:'中', exp:'规律是每次加2，所以6后面是8' });

// 三年级
reg(3,'数学',3,{ q:'1米 = ? 厘米', opts:['10','100','1000','10000'], ans:'B', diff:'易', exp:'1米=100厘米' });
reg(3,'数学',5,{ q:'小明有3个苹果，小红的苹果是小明的2倍，小红有几个？', opts:['3个','5个','6个','9个'], ans:'C', diff:'易', exp:'求一个数的几倍是多少用乘法：3×2=6（个）' });
reg(3,'数学',7,{ q:'一个长方形的长是5厘米，宽是3厘米，周长是多少？', opts:['8厘米','15厘米','16厘米','30厘米'], ans:'C', diff:'中', exp:'长方形周长=(长+宽)×2=(5+3)×2=16（厘米）' });

// 四年级（示例章节）
reg(4,'数学',0,{ q:'10个一千是？', opts:['一万','一千','十万','一百'], ans:'A', diff:'易', exp:'10×1000=10000，即一万' });
reg(4,'数学',0,{ q:'最大的四位数是？', opts:['999','9999','1000','10000'], ans:'B', diff:'易', exp:'最大的四位数是9999，最小的五位数是10000' });

// 五年级
reg(5,'数学',0,{ q:'下列哪些分数是真分数？（多选概念题）下列哪个是真分数？', opts:['1/2','3/2','5/3','7/4'], ans:'A', diff:'中', exp:'真分数是分子小于分母的分数，1/2是真分数' });
reg(5,'数学',0,{ q:'1小时30分 = ? 小时', opts:['1.3小时','1.5小时','1.8小时','2小时'], ans:'B', diff:'中', exp:'30分=0.5小时，所以1小时30分=1.5小时' });

// 六年级
reg(6,'数学',0,{ q:'一个正方形的边长是4厘米，面积是多少？', opts:['8平方厘米','16平方厘米','20平方厘米','24平方厘米'], ans:'B', diff:'易', exp:'正方形面积=边长×边长=4×4=16（平方厘米）' });
reg(6,'数学',0,{ q:'0.5表示几分之几？', opts:['1/2','1/5','1/10','1/20'], ans:'A', diff:'易', exp:'0.5=5/10=1/2' });

// -------- 小学英语题 --------
// 三年级
reg(3,'英语',0,{ q:'"Hello!"的回答可以是？', opts:['Goodbye!','Hello!','Thank you!','Sorry.'], ans:'B', diff:'易', exp:'"Hello!"可以用"Hello!"或"Hi!"来回答' });
reg(3,'英语',0,{ q:'"red"是什么意思？', opts:['红色','蓝色','绿色','黄色'], ans:'A', diff:'易', exp:'red是红色，blue是蓝色，green是绿色，yellow是黄色' });
reg(3,'英语',0,{ q:'"apple"的复数是？', opts:['apple','apples','applees','an apple'], ans:'B', diff:'易', exp:'名词单数变复数，一般在词尾加s，apple的复数是apples' });

// 四年级
reg(4,'英语',0,{ q:'"This is my father."的意思是？', opts:['这是我的妈妈。','这是我的爸爸。','这是我的老师。','这是我的朋友。'], ans:'B', diff:'易', exp:'father是爸爸、父亲的意思' });
reg(4,'英语',0,{ q:'"I am from China."的意思是？', opts:['我是中国人。','我去中国。','我喜欢中国。','我住在中国。'], ans:'A', diff:'易', exp:'"I am from..."表示"我来自..."，即某国人' });

// 五年级
reg(5,'英语',0,{ q:'"What\'s in your classroom?"的回答可以是？', opts:['It\'s big.','There is a board.','It\'s nice.','I like it.'], ans:'B', diff:'中', exp:'问教室里面有什么，用There be句型回答' });

// 六年级
reg(6,'英语',0,{ q:'"What time is it?"的回答可以是？', opts:['It\'s time to go.','It\'s 3 o\'clock.','It\'s time for bed.','It\'s good.'], ans:'B', diff:'易', exp:'问时间，回答用"It\'s + 时间"' });

// -------- 初中语文题（七年级） --------
reg(7,'语文',0,{ q:'《朝花夕拾》的作者是？', opts:['鲁迅','老舍','巴金','茅盾'], ans:'A', diff:'易', exp:'《朝花夕拾》是鲁迅的散文集' });
reg(7,'语文',0,{ q:'《论语》的作者是？', opts:['孔子','孔子的弟子及再传弟子','孟子','荀子'], ans:'B', diff:'中', exp:'《论语》是孔子的弟子及再传弟子记录孔子言行的书' });
reg(7,'语文',0,{ q:'下列哪个不是鲁迅的作品？', opts:['《呐喊》','《彷徨》','《子夜》','《野草》'], ans:'C', diff:'中', exp:'《子夜》是茅盾的作品，不是鲁迅的' });
reg(7,'语文',0,{ q:'"随风潜入夜，润物细无声"出自哪位诗人？', opts:['李白','杜甫','白居易','王维'], ans:'B', diff:'易', exp:'这两句诗出自杜甫的《春夜喜雨》' });

// -------- 初中数学题（七年级） --------
reg(7,'数学',0,{ q:'-5的相反数是？', opts:['-5','5','-1/5','1/5'], ans:'B', diff:'易', exp:'相反数是指绝对值相等、符号相反的两个数，-5的相反数是5' });
reg(7,'数学',0,{ q:'下列各数中，最小的是？', opts:['-3','-1','0','2'], ans:'A', diff:'易', exp:'负数小于0和正数，|-3|>|-1|，所以-3最小' });
reg(7,'数学',0,{ q:'x + 5 = 12，x = ?', opts:['5','6','7','8'], ans:'C', diff:'易', exp:'x=12-5=7' });
reg(7,'数学',0,{ q:'一个长方形的周长是20cm，长是6cm，宽是？', opts:['4cm','5cm','6cm','7cm'], ans:'A', diff:'中', exp:'周长=2×(长+宽)，20=2×(6+宽)，宽=4cm' });

// -------- 初中英语题（七年级） --------
reg(7,'英语',0,{ q:'"Good morning!"的回答是？', opts:['Good night!','Good morning!','Good afternoon!','Good evening!'], ans:'B', diff:'易', exp:'早上好用Good morning回答' });
reg(7,'英语',0,{ q:'"How are you?"的常用回答是？', opts:['I am 10.','I am fine, thank you.','My name is Tom.','I like English.'], ans:'B', diff:'易', exp:'"How are you?"问身体状况，常用"I\'m fine, thank you"回答' });
reg(7,'英语',0,{ q:'下列哪个是形容词性物主代词？', opts:['I','me','my','mine'], ans:'C', diff:'中', exp:'my是形容词性物主代词，后面必须接名词' });

// -------- 初中物理题（八年级） --------
reg(8,'物理',0,{ q:'下列哪个是长度的基本单位？', opts:['千米','米','厘米','毫米'], ans:'B', diff:'易', exp:'国际单位制中，长度的基本单位是米（m）' });
reg(8,'物理',0,{ q:'声音在下列哪个介质中传播最快？', opts:['空气','水','钢铁','一样快'], ans:'C', diff:'中', exp:'声音在固体中传播最快，液体次之，气体最慢' });
reg(8,'物理',0,{ q:'光在真空中的传播速度是？', opts:['3×10^5 m/s','3×10^8 m/s','340 m/s','1500 m/s'], ans:'B', diff:'易', exp:'光在真空中的传播速度约为3×10^8 m/s' });
reg(8,'物理',0,{ q:'平面镜成像的特点是？', opts:['正立放大实像','正立等大虚像','倒立放大实像','倒立缩小实像'], ans:'B', diff:'中', exp:'平面镜成的是正立、等大的虚像' });

// -------- 初中化学题（九年级） --------
reg(9,'化学',0,{ q:'下列变化中，属于化学变化的是？', opts:['冰融化成水','铁生锈','水蒸发','玻璃破碎'], ans:'B', diff:'易', exp:'铁生锈生成了新物质（铁锈），属于化学变化' });
reg(9,'化学',0,{ q:'氧气的化学符号是？', opts:['O','O2','O3','CO2'], ans:'B', diff:'易', exp:'氧气由氧分子构成，每个氧分子由2个氧原子构成，符号为O2' });
reg(9,'化学',0,{ q:'下列气体中，能供给呼吸的是？', opts:['氮气','二氧化碳','氧气','稀有气体'], ans:'C', diff:'易', exp:'氧气能供给呼吸，用于医疗急救、潜水等' });

// -------- 高中语文题 --------
reg(10,'语文',0,{ q:'《论语》是哪家的经典？', opts:['儒家','道家','法家','墨家'], ans:'A', diff:'易', exp:'《论语》是儒家经典，记录了孔子及其弟子的言行' });
reg(10,'语文',0,{ q:'"学而不思则罔，思而不学则殆"出自？', opts:['《孟子》','《论语》','《大学》','《中庸》'], ans:'B', diff:'易', exp:'这句话出自《论语·为政》' });
reg(11,'语文',0,{ q:'《红楼梦》的作者是？', opts:['罗贯中','施耐庵','吴承恩','曹雪芹'], ans:'D', diff:'易', exp:'《红楼梦》的作者是清代的曹雪芹' });

// -------- 高中数学题 --------
reg(10,'数学',0,{ q:'集合{1,2,3}的子集个数是？', opts:['3','6','7','8'], ans:'D', diff:'中', exp:'含有n个元素的集合有2^n个子集，2^3=8' });
reg(10,'数学',0,{ q:'函数f(x)=2x+1是？', opts:['奇函数','偶函数','既是奇函数又是偶函数','非奇非偶函数'], ans:'D', diff:'中', exp:'f(-x)=-2x+1，既不是f(x)也不是-f(x)，所以非奇非偶' });
reg(11,'数学',0,{ q:'已知向量a=(1,2)，b=(3,4)，a+b=?', opts:['(4,6)','(2,2)','(3,8)','(1,6)'], ans:'A', diff:'中', exp:'向量相加等于对应坐标相加：(1+3,2+4)=(4,6)' });

// -------- 高中英语题 --------
reg(10,'英语',0,{ q:'"I have studied English for 5 years."是什么时态？', opts:['一般过去时','现在进行时','现在完成时','一般将来时'], ans:'C', diff:'中', exp:'have/has + 过去分词，是现在完成时的结构' });
reg(10,'英语',0,{ q:'下列哪个是定语从句的关系代词？', opts:['when','where','which','why'], ans:'C', diff:'中', exp:'which是关系代词，when、where、why是关系副词' });

// -------- 高中物理题 --------
reg(10,'物理',0,{ q:'下列哪个是矢量？', opts:['质量','时间','位移','路程'], ans:'C', diff:'易', exp:'矢量是既有大小又有方向的物理量，位移是矢量' });
reg(11,'物理',0,{ q:'自由落体运动的加速度是？', opts:['取决于物体质量','9.8 m/s²','取决于下落高度','0'], ans:'B', diff:'易', exp:'自由落体加速度等于重力加速度g≈9.8m/s²' });

// ============ 额外扩充题目（V3） ============
// -------- 小学四年级题 --------
reg(4,'语文',0,{ q:'"鼎"字共有几画？', opts:['10画','11画','12画','13画'], ans:'C', diff:'难', exp:'"鼎"字共12画，是考试中常见的笔画题' });
reg(4,'语文',0,{ q:'下列哪个成语的意思是"比喻学习努力"？', opts:['画蛇添足','悬梁刺股','守株待兔','亡羊补牢'], ans:'B', diff:'中', exp:'"悬梁刺股"形容学习十分勤奋' });
reg(4,'数学',0,{ q:'10个一百是？', opts:['一千','一万','十万','一百'], ans:'A', diff:'易', exp:'10×100=1000，即一千' });
reg(4,'数学',0,{ q:'最大的三位数是？', opts:['99','999','100','1000'], ans:'B', diff:'易', exp:'最大的三位数是999，最小的四位数是1000' });
reg(4,'数学',0,{ q:'1千克 = ? 克', opts:['10','100','1000','10000'], ans:'C', diff:'易', exp:'1千克=1000克' });
reg(4,'英语',0,{ q:'"This is a book."的复数形式是？', opts:['This are books.','These is books.','These are books.','This books.'], ans:'C', diff:'中', exp:'this的复数是these，is的复数是are，book的复数是books' });

// -------- 小学五年级题 --------
reg(5,'语文',0,{ q:'"春风又绿江南岸"的"绿"意思是？', opts:['颜色','使……变绿','绿色','绿树'], ans:'B', exp:'这里的"绿"是使动用法，意思是"使……变绿"' });
reg(5,'语文',0,{ q:'下列哪个是排比句？', opts:['他跑得快。','阅读使人充实，会谈使人敏捷，写作使人精确。','今天天气真好！','啊，大海！'], ans:'B', diff:'中', exp:'排比句是把三个或以上结构类似的句子排列在一起' });
reg(5,'数学',0,{ q:'1/2 + 1/4 = ?', opts:['2/6','3/4','2/4','1/8'], ans:'B', diff:'中', exp:'1/2=2/4，2/4+1/4=3/4' });
reg(5,'数学',0,{ q:'一个长方形的长是8厘米，宽是4厘米，面积是？', opts:['12平方厘米','24平方厘米','32平方厘米','48平方厘米'], ans:'C', diff:'易', exp:'长方形面积=长×宽=8×4=32（平方厘米）' });
reg(5,'英语',0,{ q:'"He ____ a student." 空白处应填？', opts:['am','is','are','be'], ans:'B', diff:'易', exp:'he是第三人称单数，be动词用is' });

// -------- 小学六年级题 --------
reg(6,'语文',0,{ q:'"但愿人长久，千里共婵娟"出自？', opts:['李白','苏轼','白居易','王维'], ans:'B', diff:'中', exp:'这两句出自苏轼的《水调歌头》' });
reg(6,'语文',0,{ q:'下列哪个是鲁迅的笔名？', opts:['周作人','周树人','胡适','陈独秀'], ans:'B', diff:'中', exp:'鲁迅原名周树人，字豫才' });
reg(6,'数学',0,{ q:'5.6 × 2 = ?', opts:['10.2','11.2','12.2','13.2'], ans:'B', diff:'易', exp:'5.6×2=11.2' });
reg(6,'数学',0,{ q:'一个圆的半径是3厘米，周长是？', opts:['6π cm','9π cm','12π cm','18π cm'], ans:'A', diff:'中', exp:'圆周长=2πr=2π×3=6π（cm）' });
reg(6,'英语',0,{ q:'"I ____ to school yesterday." 空白处应填？', opts:['go','goes','went','going'], ans:'C', diff:'中', exp:'yesterday是过去时，go的过去式是went' });

// -------- 初中八年级题（补充） --------
reg(8,'语文',0,{ q:'《桃花源记》的作者是？', opts:['陶渊明','王羲之','苏轼','韩愈'], ans:'A', diff:'易', exp:'《桃花源记》是东晋陶渊明所作' });
reg(8,'语文',0,{ q:'"落红不是无情物，化作春泥更护花"出自？', opts:['《己亥杂诗》','《春晓》','《静夜思》','《登鹳雀楼》'], ans:'A', diff:'中', exp:'这两句出自清代龚自珍的《己亥杂诗》' });
reg(8,'数学',0,{ q:'一次函数y = 2x + 1的图象经过哪些象限？', opts:['一、二、三象限','一、三、四象限','二、三、四象限','一、二、四象限'], ans:'A', diff:'难', exp:'k=2>0，b=1>0，所以图象经过一、二、三象限' });
reg(8,'英语',0,{ q:'"He is ____ than his brother." 空白处应填？', opts:['tall','taller','tallest','more tall'], ans:'B', diff:'易', exp:'than表示比较，用比较级taller' });
reg(8,'物理',0,{ q:'物体的质量是5kg，在地球上受到的重力是？(g=10N/kg)', opts:['5N','50N','500N','0.5N'], ans:'B', diff:'中', exp:'G=mg=5×10=50（N）' });

// -------- 初中九年级题（大量补充） --------
reg(9,'语文',0,{ q:'《出师表》的作者是？', opts:['诸葛亮','刘备','曹操','司马迁'], ans:'A', diff:'易', exp:'《出师表》是三国时期诸葛亮所作' });
reg(9,'语文',0,{ q:'"先天下之忧而忧，后天下之乐而乐"出自？', opts:['《岳阳楼记》','《醉翁亭记》','《出师表》','《桃花源记》'], ans:'A', diff:'中', exp:'这两句出自范仲淹的《岳阳楼记》' });
reg(9,'数学',0,{ q:'一元二次方程x² - 5x + 6 = 0的根是？', opts:['x=2, x=3','x=-2, x=-3','x=1, x=6','x=-1, x=-6'], ans:'A', diff:'中', exp:'分解因式得(x-2)(x-3)=0，所以x=2或x=3' });
reg(9,'数学',0,{ q:'反比例函数y = k/x的图象经过第一象限，则k的符号是？', opts:['k>0','k<0','k=0','无法确定'], ans:'A', diff:'中', exp:'图象经过第一象限说明k>0' });
reg(9,'英语',0,{ q:'"If it ____ tomorrow, we will stay at home." 空白处应填？', opts:['rain','rains','will rain','rained'], ans:'B', diff:'中', exp:'if引导的条件状语从句，主将从现' });
reg(9,'物理',0,{ q:'下列哪个不是省力杠杆？', opts:['撬棍','羊角锤','筷子','扳手'], ans:'C', diff:'中', exp:'筷子是费力杠杆，动力臂小于阻力臂' });
reg(9,'物理',0,{ q:'一个滑轮组的机械效率是80%，表示？', opts:['有用功占总功的80%','额外功占总功的80%','总功是有用功的80%','无法判断'], ans:'A', diff:'中', exp:'机械效率=有用功/总功×100%' });
reg(9,'化学',0,{ q:'铁与稀盐酸反应的化学方程式是？', opts:['Fe + HCl → FeCl₂ + H₂','Fe + 2HCl → FeCl₂ + H₂↑','Fe + HCl → FeCl + H₂','Fe + 2HCl → FeCl + H₂↑'], ans:'B', diff:'中', exp:'铁与稀盐酸反应生成氯化亚铁和氢气' });
reg(9,'化学',0,{ q:'下列物质中，属于氧化物的是？', opts:['O₂','H₂O','HCl','KCl'], ans:'B', diff:'易', exp:'氧化物是由两种元素组成且其中一种是氧元素的化合物' });
reg(9,'化学',0,{ q:'酸碱中和反应的实质是？', opts:['H⁺ + OH⁻ → H₂O','H₂ + O₂ → H₂O','Na⁺ + Cl⁻ → NaCl','无法表示'], ans:'A', diff:'难', exp:'酸碱中和的实质是氢离子和氢氧根离子结合生成水' });

// -------- 高中十一年级题（补充） --------
reg(11,'语文',0,{ q:'《三国演义》的作者是？', opts:['罗贯中','施耐庵','吴承恩','曹雪芹'], ans:'A', diff:'易', exp:'《三国演义》的作者是元末明初的罗贯中' });
reg(11,'语文',0,{ q:'"天生我材必有用"出自李白的哪首诗？', opts:['《静夜思》','《将进酒》','《望庐山瀑布》','《赠汪伦》'], ans:'B', diff:'中', exp:'这两句出自李白的《将进酒》' });
reg(11,'数学',0,{ q:'等差数列{aₙ}中，a₁=1，d=2，则a₁₀=？', opts:['10','19','20','21'], ans:'B', diff:'中', exp:'aₙ=a₁+(n-1)d，a₁₀=1+(10-1)×2=19' });
reg(11,'数学',0,{ q:'sin(π/6) = ?', opts:['1/2','√2/2','√3/2','1'], ans:'A', diff:'易', exp:'sin(π/6)=sin30°=1/2' });
reg(11,'英语',0,{ q:'"I wish I ____ a bird." 空白处应填？', opts:['am','was','were','be'], ans:'C', diff:'难', exp:'wish后的宾语从句用虚拟语气，be动词一律用were' });
reg(11,'物理',0,{ q:'一个物体从静止开始做匀加速直线运动，第1秒内的位移是？', opts:['等于(g/2)','等于g','等于2g','无法确定'], ans:'A', diff:'难', exp:'s=½gt²，t=1时，s=½g' });

// -------- 高中十二年级题（新增） --------
reg(12,'语文',0,{ q:'《史记》的作者是？', opts:['司马迁','司马光','班固','陈寿'], ans:'A', diff:'易', exp:'《史记》是我国第一部纪传体通史，作者司马迁' });
reg(12,'语文',0,{ q:'"年年岁岁花相似，岁岁年年人不同"体现了什么哲理？', opts:['事物是静止的','事物是变化发展的','意识决定物质','实践出真知'], ans:'B', diff:'中', exp:'这句话体现了事物是变化发展的哲理' });
reg(12,'数学',0,{ q:'函数f(x) = x³的导数是？', opts:['f\'(x) = x²','f\'(x) = 3x²','f\'(x) = 3x','f\'(x) = x'], ans:'B', diff:'中', exp:'根据幂函数求导公式，(xⁿ)\'=nxⁿ⁻¹，所以(x³)\'=3x²' });
reg(12,'数学',0,{ q:'已知函数f(x)在x=1处的导数是2，则曲线y=f(x)在点(1,f(1))处的切线斜率是？', opts:['1','2','0','无法确定'], ans:'B', diff:'中', exp:'函数在某点的导数的几何意义是曲线在该点处的切线斜率' });
reg(12,'英语',0,{ q:'"The book ____ on the desk." 空白处应填？', opts:['is lying','lies','has lain','had lain'], ans:'A', diff:'中', exp:'表示"正躺在桌上"用现在进行时' });
reg(12,'物理',0,{ q:'根据楞次定律，感应电流的磁场总是？', opts:['与原磁场方向相同','阻碍原磁通量的变化','增强原磁通量','不影响原磁通量'], ans:'B', diff:'难', exp:'楞次定律：感应电流的磁场总是阻碍引起感应电流的磁通量的变化' });

// -------- 小学科目补充（道德与法治/历史/地理/生物概念题） --------
reg(3,'语文',0,{ q:'"一寸光阴一寸金"的下半句是？', opts:['寸金难买寸光阴','一年之计在于春','一日之计在于晨','不学不知义'], ans:'A', diff:'易', exp:'"一寸光阴一寸金，寸金难买寸光阴"比喻时间宝贵' });
reg(5,'数学',0,{ q:'一个正方形的周长是20厘米，边长是？', opts:['4厘米','5厘米','6厘米','7厘米'], ans:'B', diff:'易', exp:'正方形周长=4×边长，所以边长=20÷4=5（厘米）' });
reg(6,'数学',0,{ q:'1公顷 = ? 平方米', opts:['100','1000','10000','100000'], ans:'C', diff:'中', exp:'1公顷=10000平方米' });

// -------- 综合应用题 --------
reg(7,'数学',0,{ q:'小明今年12岁，爸爸的年龄是小明的3倍多2岁，爸爸几岁？', opts:['34岁','36岁','38岁','40岁'], ans:'C', diff:'中', exp:'12×3+2=38（岁）' });
reg(8,'数学',0,{ q:'一个等腰三角形的底边是6cm，腰是5cm，周长是？', opts:['11cm','16cm','17cm','21cm'], ans:'B', diff:'中', exp:'等腰三角形周长=底边+2×腰=6+2×5=16（cm）' });
reg(9,'数学',0,{ q:'某商品原价100元，打八折后价格是？', opts:['20元','60元','80元','90元'], ans:'C', diff:'易', exp:'打八折就是原价的80%，100×80%=80（元）' });

// ============ 生成完整 data.js ============

// 1. 知识点（从题目池中间接生成，加上预定义的知识点）
let kpId = 1;
const knowledgePoints = [];

function addKP(grade, subject, textbook, chapter, title, type, content) {
  knowledgePoints.push({ id:makeId('kp',kpId++), grade, subject, textbook, chapter, title, type, content, mastery:0 });
}

// 从章节结构生成基础知识点
for (const [grade, subjects] of Object.entries(structure.primary.chinese)) {
  const info = structure.primary.chinese[grade];
  for (const ch of info.ch) {
    addKP(grade,'语文',info.tb,ch,ch+'基础知识','基础',ch+'的基本概念和学习要点');
  }
}
for (const [grade, subjects] of Object.entries(structure.primary.math)) {
  const info = structure.primary.math[grade];
  for (const ch of info.ch) {
    addKP(grade,'数学',info.tb,ch,ch+'基础知识','基础',ch+'的基本概念和计算方法');
  }
}
// 初中知识点
for (const [grade, info] of Object.entries(structure.junior.chinese||{})) {
  for (const ch of info.ch) addKP(grade,'语文',info.tb,ch,ch+'要点','重点',ch+'的核心知识点');
}
for (const [grade, info] of Object.entries(structure.junior.math||{})) {
  for (const ch of info.ch) addKP(grade,'数学',info.tb,ch,ch+'要点','重点',ch+'的核心知识点');
}
// 高中知识点
for (const [grade, info] of Object.entries(structure.senior.chinese||{})) {
  for (const ch of info.ch) addKP(grade,'语文',info.tb,ch,ch+'要点','重点',ch+'的核心知识点');
}
for (const [grade, info] of Object.entries(structure.senior.math||{})) {
  for (const ch of info.ch) addKP(grade,'数学',info.tb,ch,ch+'要点','重点',ch+'的核心知识点');
}

// 2. 题库（从题目池生成）
let qId = 1;
const quizBanks = [];

for (const [key, questions] of Object.entries(questionPool)) {
  const [grade, subject, chIdx] = key.split('-');
  // 获取textbook和chapter名称
  let textbook = '', chapter = '';
  const g = parseInt(grade);
  if (g <= 6) {
    const s = structure.primary[subject];
    if (s && s[g]) {
      textbook = s[g].tb;
      chapter = s[g].ch[parseInt(chIdx)] || s[g].ch[0];
    }
  } else if (g <= 9) {
    const s = structure.junior[subject];
    if (s && s[g]) {
      textbook = s[g].tb;
      chapter = s[g].ch[parseInt(chIdx)] || s[g].ch[0];
    }
  } else {
    const s = structure.senior[subject];
    if (s && s[g]) {
      textbook = s[g].tb;
      chapter = s[g].ch[parseInt(chIdx)] || s[g].ch[0];
    }
  }
  
  for (const q of questions) {
    quizBanks.push({
      id: makeId('q', qId++),
      grade: String(g),
      subject,
      textbook,
      chapter,
      difficulty: q.diff,
      question: q.q,
      options: q.opts,
      answer: q.ans,
      explanation: q.exp,
    });
  }
}

// 3. 诗词、单词、成语、公式（保留原有）
const poems = [
  { id:'p001',title:'静夜思',dynasty:'唐',author:'李白',content:'床前明月光，疑是地上霜。举头望明月，低头思故乡。',appreciation:'写作者在秋日夜晚仰望明月时，油然而生的思乡之情。',tags:['写景','思乡']},
  { id:'p002',title:'春晓',dynasty:'唐',author:'孟浩然',content:'春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',appreciation:'写春天早晨的景象，表达了作者对春天的喜爱。',tags:['写景','春天']},
  { id:'p003',title:'悯农',dynasty:'唐',author:'李绅',content:'锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。',appreciation:'表达了农民劳动的艰辛，告诫人们要珍惜粮食。',tags:['田园','励志']},
  { id:'p004',title:'登鹳雀楼',dynasty:'唐',author:'王之涣',content:'白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',appreciation:'蕴含"站得高看得远"的哲理，激励人们不断进取。',tags:['励志','哲理']},
  { id:'p005',title:'江雪',dynasty:'唐',author:'柳宗元',content:'千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',appreciation:'描绘了一幅寒江独钓图，表达了作者清高孤傲的品格。',tags:['写景','冬天']},
  { id:'p006',title:'咏鹅',dynasty:'唐',author:'骆宾王',content:'鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。',appreciation:'生动描绘了鹅的形象和动作，相传是骆宾王七岁时所作。',tags:['写景','动物']},
  { id:'p007',title:'望庐山瀑布',dynasty:'唐',author:'李白',content:'日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',appreciation:'运用夸张和比喻的手法，描绘了庐山瀑布雄奇壮丽的景色。',tags:['写景','山水']},
  { id:'p008',title:'赠汪伦',dynasty:'唐',author:'李白',content:'李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。',appreciation:'表达了朋友之间深厚的友情。',tags:['友情','送别']},
  { id:'p009',title:'游子吟',dynasty:'唐',author:'孟郊',content:'慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。',appreciation:'歌颂了母爱的伟大，表达了游子对母亲的感恩之情。',tags:['亲情','感恩']},
  { id:'p010',title:'水调歌头',dynasty:'宋',author:'苏轼',content:'明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',appreciation:'表达了作者对人生哲理的思考和对亲人的思念。',tags:['哲理','思乡']},
];

const words = [
  { id:'w001',word:'apple',phonetic:'/ˈæpl/',meaning:'苹果',example:'I eat an apple every day.',tags:['食物','水果']},
  { id:'w002',word:'book',phonetic:'/bʊk/',meaning:'书',example:'This is a good book.',tags:['学习','物品']},
  { id:'w003',word:'happy',phonetic:'/ˈhæpi/',meaning:'快乐的',example:'I am happy today.',tags:['情感','形容词']},
  { id:'w004',word:'school',phonetic:'/skuːl/',meaning:'学校',example:'I go to school every day.',tags:['地点','学习']},
  { id:'w005',word:'teacher',phonetic:'/ˈtiːtʃər/',meaning:'老师',example:'My teacher is very kind.',tags:['职业','人物']},
  { id:'w006',word:'water',phonetic:'/ˈwɔːtər/',meaning:'水',example:'Drink more water every day.',tags:['物质','生活']},
];

const idioms = [
  { id:'i001',word:'画蛇添足',explanation:'比喻做了多余的事，反而有害无益。',source:'《战国策》',example:'他已经做得很好了，不要画蛇添足。',tags:['寓言','教训']},
  { id:'i002',word:'守株待兔',explanation:'比喻不主动努力，存侥幸心理。',source:'《韩非子》',example:'学习不能守株待兔。',tags:['寓言','教训']},
  { id:'i003',word:'胸有成竹',explanation:'比喻做事之前已有通盘的考虑。',source:'苏轼',example:'他对这次比赛胸有成竹。',tags:['励志','准备']},
  { id:'i004',word:'卧薪尝胆',explanation:'形容人刻苦自励，发奋图强。',source:'《史记》',example:'我们要有卧薪尝胆的精神。',tags:['励志','历史']},
  { id:'i005',word:'亡羊补牢',explanation:'出了问题以后想办法补救，可以防止继续受损失。',source:'《战国策》',example:'亡羊补牢，为时不晚。',tags:['寓言','励志']},
];

const formulas = [
  { id:'f001',name:'长方形面积',formula:'S = a × b',subject:'数学',grade:'3',explanation:'长方形的面积等于长乘宽',tags:['几何','面积']},
  { id:'f002',name:'正方形面积',formula:'S = a²',subject:'数学',grade:'3',explanation:'正方形的面积等于边长乘边长',tags:['几何','面积']},
  { id:'f003',name:'三角形面积',formula:'S = ½ah',subject:'数学',grade:'5',explanation:'三角形的面积等于底乘高除以二',tags:['几何','面积']},
  { id:'f004',name:'密度公式',formula:'ρ = m/V',subject:'物理',grade:'8',explanation:'密度等于质量除以体积',tags:['力学','密度']},
  { id:'f005',name:'欧姆定律',formula:'I = U/R',subject:'物理',grade:'9',explanation:'电流等于电压除以电阻',tags:['电学','电路']},
  { id:'f006',name:'速度公式',formula:'v = s/t',subject:'物理',grade:'8',explanation:'速度等于路程除以时间',tags:['力学','运动']},
  { id:'f007',name:'牛顿第二定律',formula:'F = ma',subject:'物理',grade:'10',explanation:'力等于质量乘加速度',tags:['力学','牛顿定律']},
  { id:'f008',name:'一元二次方程求根公式',formula:'x = (-b±√(b²-4ac))/2a',subject:'数学',grade:'9',explanation:'一元二次方程ax²+bx+c=0的求根公式',tags:['代数','方程']},
];

// ============ 输出 ============
let output = '// 自动生成于 ' + new Date().toISOString() + '\n';
output += '// 知识点：' + knowledgePoints.length + '  题库：' + quizBanks.length + '\n\n';
output += 'const poems = ' + JSON.stringify(poems,null,2) + ';\n\n';
output += 'const words = ' + JSON.stringify(words,null,2) + ';\n\n';
output += 'const idioms = ' + JSON.stringify(idioms,null,2) + ';\n\n';
output += 'const formulas = ' + JSON.stringify(formulas,null,2) + ';\n\n';
output += 'const knowledgePoints = ' + JSON.stringify(knowledgePoints,null,2) + ';\n\n';
output += 'const quizBanks = ' + JSON.stringify(quizBanks,null,2) + ';\n\n';
output += 'window.AppData = window.AppData || {};\n';
output += 'window.AppData.poems = poems;\n';
output += 'window.AppData.words = words;\n';
output += 'window.AppData.idioms = idioms;\n';
output += 'window.AppData.formulas = formulas;\n';
output += 'window.AppData.knowledgePoints = knowledgePoints;\n';
output += 'window.AppData.quizBanks = quizBanks;\n';

const outputPath = path.join(__dirname, 'src', 'data.js');
fs.writeFileSync(outputPath, output, 'utf8');

console.log('✅ data.js 生成完毕！（V2）');
console.log('   知识点：' + knowledgePoints.length);
console.log('   题库：' + quizBanks.length);
console.log('   诗词：' + poems.length);
console.log('   单词：' + words.length);
console.log('   成语：' + idioms.length);
console.log('   公式：' + formulas.length);
console.log('输出路径：' + outputPath);

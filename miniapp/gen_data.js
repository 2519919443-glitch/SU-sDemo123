/* 
 *  K12 学习助手 - 完整数据生成器
 *  生成真实人教版课本章节 + 对应题库
 *  运行：node gen_data.js > src/data.js
 */

const gradeMap = {
  '小学': ['一年级','二年级','三年级','四年级','五年级','六年级'],
  '初中': ['七年级','八年级','九年级'],
  '高中': ['高一','高二','高三'],
};

// ========== 真实人教版课本章节结构 ==========
const textbookStructure = {
  '小学': {
    '语文': {
      '一年级上': ['我上学了','汉语拼音（一）','汉语拼音（二）','识字（一）','课文（一）','课文（二）','识字（二）','课文（三）'],
      '一年级下': ['识字（一）','课文（一）','课文（二）','识字（二）','课文（三）','课文（四）'],
      '二年级上': ['课文（一）','识字（一）','课文（二）','课文（三）','识字（二）','课文（四）'],
      '二年级下': ['课文（一）','识字（一）','课文（二）','识字（二）','课文（三）','课文（四）'],
      '三年级上': ['第一单元 学校生活','第二单元 金秋时节','第三单元 童话世界','第四单元 预测','第五单元 观察与发现','第六单元 祖国山河','第七单元 大自然的声音','第八单元 美好品质'],
      '三年级下': ['第一单元 可爱的生灵','第二单元 寓言故事','第三单元 中华传统文化','第四单元 观察与发现','第五单元 习作单元','第六单元 童年生活','第七单元 大自然的奥秘','第八单元 有趣的故事'],
      '四年级上': ['第一单元 自然之美','第二单元 提问策略','第三单元 连续观察','第四单元 神话故事','第五单元 习作单元','第六单元 成长故事','第七单元 家国情怀','第八单元 古代故事'],
      '四年级下': ['第一单元 田园生活','第二单元 科普文章','第三单元 现代诗','第四单元 动物朋友','第五单元 习作单元','第六单元 成长的故事','第七单元 人物品质','第八单元 童话故事'],
      '五年级上': ['第一单元 万物有灵','第二单元 阅读策略','第三单元 民间故事','第四单元 爱国情怀','第五单元 习作单元','第六单元 父母之爱','第七单元 自然之趣','第八单元 读书明智'],
      '五年级下': ['第一单元 童年往事','第二单元 古典名著','第三单元 综合性学习','第四单元 家国情怀','第五单元 习作单元','第六单元 思维火花','第七单元 异域风情','第八单元 幽默语言'],
      '六年级上': ['第一单元 触摸自然','第二单元 革命岁月','第三单元 阅读策略','第四单元 小说','第五单元 习作单元','第六单元 保护环境','第七单元 艺术之美','第八单元 鲁迅'],
      '六年级下': ['第一单元 民风民俗','第二单元 外国名著','第三单元 习作单元','第四单元 革命理想','第五单元 科学精神','第六单元 难忘小学生活'],
    },
    '数学': {
      '一年级上': ['准备课','位置','1-5的认识和加减法','认识图形（一）','6-10的认识和加减法','11-20各数的认识','认识钟表','20以内的进位加法'],
      '一年级下': ['认识图形（二）','20以内的退位减法','分类与整理','100以内数的认识','认识人民币','100以内的加法和减法（一）','找规律','总复习'],
      '二年级上': ['长度单位','100以内的加法和减法（二）','角的初步认识','表内乘法（一）','观察物体（一）','表内乘法（二）','认识时间','数学广角'],
      '二年级下': ['数据收集整理','表内除法（一）','图形的运动（一）','表内除法（二）','混合运算','有余数的除法','万以内数的认识','克和千克','数学广角'],
      '三年级上': ['时、分、秒','万以内的加法和减法（一）','测量','万以内的加法和减法（二）','倍的认识','多位数乘一位数','长方形和正方形','分数的初步认识'],
      '三年级下': ['位置与方向','除数是一位数的除法','复式统计表','两位数乘两位数','面积','年、月、日','小数的初步认识','数学广角'],
      '四年级上': ['大数的认识','公顷和平方千米','角的度量','三位数乘两位数','平行四边形和梯形','除数是两位数的除法','条形统计图','数学广角'],
      '四年级下': ['四则运算','观察物体（二）','运算定律','小数的意义和性质','三角形','小数的加法和减法','图形的运动（二）','平均数与条形统计图','数学广角'],
      '五年级上': ['小数乘法','位置','小数除法','可能性','简易方程','多边形的面积','数学广角'],
      '五年级下': ['观察物体（三）','因数与倍数','长方体和正方体','分数的意义和性质','图形的运动（三）','分数的加法和减法','折线统计图','数学广角'],
      '六年级上': ['分数乘法','位置与方向（二）','分数除法','比','圆','百分数（一）','统计','数学广角'],
      '六年级下': ['负数','百分数（二）','圆柱与圆锥','比例','数学广角','整理与复习'],
    },
    '英语': {
      '三年级上': ['Unit 1 Hello!','Unit 2 Colours','Unit 3 Body','Unit 4 We love animals','Unit 5 Let us eat!','Unit 6 Happy birthday!'],
      '三年级下': ['Unit 1 Welcome back!','Unit 2 My family','Unit 3 At the zoo','Unit 4 Where is my car?','Unit 5 Do you like pears?','Unit 6 How many?'],
      '四年级上': ['Unit 1 My classroom','Unit 2 My schoolbag','Unit 3 My friends','Unit 4 My home','Unit 5 Dinner is ready','Unit 6 Meet my family!'],
      '四年级下': ['Unit 1 My school','Unit 2 What time is it?','Unit 3 Weather','Unit 4 At the farm','Unit 5 My clothes','Unit 6 Shopping'],
      '五年级上': ['Unit 1 What is he like?','Unit 2 My week','Unit 3 What would you like?','Unit 4 What can you do?','Unit 5 There is a big bed','Unit 6 In a nature park'],
      '五年级下': ['Unit 1 My day','Unit 2 My favourite season','Unit 3 My school calendar','Unit 4 When is the art show?','Unit 5 Whose dog is it?','Unit 6 Work quietly!'],
      '六年级上': ['Unit 1 How can I get there?','Unit 2 Ways to go to school','Unit 3 My weekend plan','Unit 4 I have a pen pal','Unit 5 What does he do?','Unit 6 How do you feel?'],
      '六年级下': ['Unit 1 How tall are you?','Unit 2 Last weekend','Unit 3 Where did you go?','Unit 4 Then and now'],
    },
  },
  '初中': {
    '语文': {
      '七年级上': ['第一单元 四季美景','第二单元 至爱亲情','第三单元 学习生活','第四单元 人生感悟','第五单元 动物与人','第六单元 想象力'],
      '七年级下': ['第一单元 群星闪耀','第二单元 家国情怀','第三单元 凡人小事','第四单元 修身正己','第五单元 哲理之思','第六单元 科幻探险'],
      '八年级上': ['第一单元 新闻阅读','第二单元 生活记忆','第三单元 美景怡情','第四单元 情感哲思','第五单元 文明的印迹','第六单元 情操与志趣'],
      '八年级下': ['第一单元 民风民俗','第二单元 科技作品','第三单元 养性怡情','第四单元 思想光芒','第五单元 江山多娇','第六单元 情趣理趣'],
      '九年级上': ['第一单元 自然之音','第二单元 砥砺思想','第三单元 游目骋怀','第四单元 青春年少','第五单元 话剧选读','第六单元 古典诗文'],
      '九年级下': ['第一单元 生活咏叹','第二单元 人物画廊','第三单元 家国之思','第四单元 读书悟理','第五单元 舞台人生','第六单元 古代生活'],
    },
    '数学': {
      '七年级上': ['第一章 有理数','第二章 整式的加减','第三章 一元一次方程','第四章 几何图形初步'],
      '七年级下': ['第五章 相交线与平行线','第六章 实数','第七章 平面直角坐标系','第八章 二元一次方程组','第九章 不等式与不等式组','第十章 数据的收集、整理与描述'],
      '八年级上': ['第十一章 三角形','第十二章 全等三角形','第十三章 轴对称','第十四章 整式的乘法与因式分解','第十五章 分式'],
      '八年级下': ['第十六章 二次根式','第十七章 勾股定理','第十八章 平行四边形','第十九章 一次函数','第二十章 数据的分析'],
      '九年级上': ['第二十一章 一元二次方程','第二十二章 二次函数','第二十三章 旋转','第二十四章 圆','第二十五章 概率初步'],
      '九年级下': ['第二十六章 反比例函数','第二十七章 相似','第二十八章 锐角三角函数','第二十九章 投影与视图'],
    },
    '英语': {
      '七年级上': ['Starter Units 1-3','Unit 1 My name is Gina','Unit 2 This is my sister','Unit 3 Is this your pencil?','Unit 4 Where is my schoolbag?','Unit 5 Do you have a soccer ball?','Unit 6 Do you like bananas?','Unit 7 How much are these socks?','Unit 8 When is your birthday?','Unit 9 My favorite subject is science'],
      '七年级下': ['Unit 1 Can you play the guitar?','Unit 2 What time do you go to school?','Unit 3 How do you get to school?','Unit 4 Don t eat in class','Unit 5 Why do you like pandas?','Unit 6 I m watching TV','Unit 7 It s raining!','Unit 8 Is there a post office near here?','Unit 9 What does he look like?','Unit 10 I d like some noodles','Unit 11 How was your school trip?','Unit 12 What did you do last weekend?'],
      '八年级上': ['Unit 1 Where did you go on vacation?','Unit 2 How often do you exercise?','Unit 3 I m more outgoing than my sister','Unit 4 What s the best movie theater?','Unit 5 Do you want to watch a game show?','Unit 6 I m going to study computer science','Unit 7 Will people have robots?','Unit 8 How do you make a banana milk shake?','Unit 9 Can you come to my party?','Unit 10 If you go to the party, you ll have a great time!'],
      '八年级下': ['Unit 1 What s the matter?','Unit 2 I ll help to clean up the city parks','Unit 3 Could you please clean your room?','Unit 4 Why don t you talk to your parents?','Unit 5 What were you doing when the rainstorm came?','Unit 6 An old man tried to move the mountains','Unit 7 What s the highest mountain in the world?','Unit 8 Have you read Treasure Island yet?','Unit 9 Have you ever been to a museum?','Unit 10 I ve had this bike for three years'],
      '九年级全一册': ['Unit 1 How can we become good learners?','Unit 2 I think that mooncakes are delicious!','Unit 3 Could you please tell me where the restrooms are?','Unit 4 I used to be afraid of the dark','Unit 5 What are the shirts made of?','Unit 6 When was it invented?','Unit 7 Teenagers should be allowed to choose their own clothes','Unit 8 It must belong to Carla','Unit 9 I like music that I can dance to','Unit 10 You re supposed to shake hands','Unit 11 Sad movies make me cry','Unit 12 Life is full of the unexpected','Unit 13 We re trying to save the earth!','Unit 14 I remember meeting all of you in Grade 7'],
    },
    '物理': {
      '八年级上': ['第一章 机械运动','第二章 声现象','第三章 物态变化','第四章 光现象','第五章 透镜及其应用','第六章 质量与密度'],
      '八年级下': ['第七章 力','第八章 运动和力','第九章 压强','第十章 浮力','第十一章 功和机械能','第十二章 简单机械'],
      '九年级全一册': ['第十三章 内能','第十四章 内能的利用','第十五章 电流和电路','第十六章 电压 电阻','第十七章 欧姆定律','第十八章 电功率','第十九章 生活用电','第二十章 电与磁','第二十一章 信息的传递','第二十二章 能源与可持续发展'],
    },
    '化学': {
      '九年级上': ['第一单元 走进化学世界','第二单元 我们周围的空气','第三单元 物质构成的奥秘','第四单元 自然界的水','第五单元 化学方程式','第六单元 碳和碳的氧化物','第七单元 燃料及其利用'],
      '九年级下': ['第八单元 金属和金属材料','第九单元 溶液','第十单元 酸 碱 盐','第十一单元 化学与生活'],
    },
    '生物': {
      '七年级上': ['第一单元 生物和生物圈','第二单元 生物体的结构层次','第三单元 生物圈中的绿色植物'],
      '七年级下': ['第四单元 生物圈中的人（一）','第四单元 生物圈中的人（二）','第四单元 生物圈中的人（三）'],
      '八年级上': ['第五单元 生物圈中的其他生物（一）','第五单元 生物圈中的其他生物（二）','第六单元 生物的多样性及其保护'],
      '八年级下': ['第七单元 生物圈中生命的延续和发展','第八单元 健康地生活'],
    },
    '历史': {
      '七年级上': ['第一单元 史前时期','第二单元 夏商周时期','第三单元 秦汉时期','第四单元 三国两晋南北朝时期'],
      '七年级下': ['第一单元 隋唐时期','第二单元 辽宋夏金元时期','第三单元 明清时期'],
      '八年级上': ['第一单元 中国开始沦为半殖民地半封建社会','第二单元 近代化的早期探索与民族危机的加剧','第三单元 资产阶级民主革命与中华民国的建立','第四单元 新时代的曙光','第五单元 从国共合作到国共对立','第六单元 中华民族的抗日战争','第七单元 解放战争','第八单元 近代经济、社会生活与教育文化事业的发展'],
      '八年级下': ['第一单元 中华人民共和国的成立和巩固','第二单元 社会主义制度的建立与社会主义建设的探索','第三单元 中国特色社会主义道路','第四单元 民族团结与祖国统一','第五单元 国防建设与外交成就','第六单元 科技文化与社会生活'],
      '九年级上': ['第一单元 古代亚非文明','第二单元 古代欧洲文明','第三单元 封建时代的欧洲','第四单元 封建时代的亚洲国家','第五单元 步入近代','第六单元 资本主义制度的初步确立','第七单元 工业革命和工人运动的兴起'],
      '九年级下': ['第一单元 殖民地人民的反抗与资本主义制度的扩展','第二单元 第二次工业革命和近代科学文化','第三单元 第一次世界大战和战后初期的世界','第四单元 经济大危机和第二次世界大战','第五单元 二战后的世界变化','第六单元 走向和平发展的世界'],
    },
    '地理': {
      '七年级上': ['第一章 地球和地图','第二章 陆地和海洋','第三章 天气与气候','第四章 居民与聚落','第五章 发展与合作'],
      '七年级下': ['第六章 我们生活的大洲','第七章 我们邻近的地区和国家','第八章 东半球其他的地区和国家','第九章 西半球的国家','第十章 极地地区'],
      '八年级上': ['第一章 从世界看中国','第二章 中国的自然环境','第三章 中国的自然资源','第四章 中国的经济发展'],
      '八年级下': ['第五章 中国的地理差异','第六章 北方地区','第七章 南方地区','第八章 西北地区','第九章 青藏地区','第十章 中国在世界中'],
    },
    '道德与法治': {
      '七年级上': ['第一单元 成长的节拍','第二单元 友谊的天空','第三单元 师长情谊','第四单元 生命的思考'],
      '七年级下': ['第一单元 青春时光','第二单元 做情绪情感的主人','第三单元 在集体中成长','第四单元 走进法治天地'],
      '八年级上': ['第一单元 走进社会生活','第二单元 遵守社会规则','第三单元 勇担社会责任','第四单元 维护国家利益'],
      '八年级下': ['第一单元 坚持宪法至上','第二单元 理解权利义务','第三单元 人民当家作主','第四单元 崇尚法治精神'],
      '九年级上': ['第一单元 富强与创新','第二单元 民主与法治','第三单元 文明与家园','第四单元 和谐与梦想'],
      '九年级下': ['第一单元 我们共同的世界','第二单元 世界舞台上的中国','第三单元 走向未来的少年'],
    },
  },
  '高中': {
    '语文': {
      '必修 上册': ['第一单元 青春的价值','第二单元 劳动光荣','第三单元 生命的诗意','第四单元 我们的家园','第五单元 乡土中国','第六单元 学习之道','第七单元 自然情怀','第八单元 词语积累与词语解释'],
      '必修 下册': ['第一单元 中华文明之光','第二单元 良知与悲悯','第三单元 探索与创新','第四单元 信息时代的语文生活','第五单元 时代镜像','第六单元 观察与批判','第七单元 不朽的红楼','第八单元 责任与担当'],
      '选择性必修 上册': ['第一单元 历史偏见','第二单元 苦难与新生','第三单元 审美与思辨','第四单元 逻辑的力量'],
      '选择性必修 中册': ['第一单元 迂回委婉','第二单元 国魂孤忠','第三单元 博观约取','第四单元 求真与发现'],
      '选择性必修 下册': ['第一单元 诗意的探寻','第二单元 时代的镜像','第三单元 至情至性','第四单元 科学与文化'],
    },
    '数学': {
      '必修 第一册': ['第一章 集合与常用逻辑用语','第二章 一元二次函数、方程和不等式','第三章 函数的概念与性质','第四章 指数函数与对数函数','第五章 三角函数'],
      '必修 第二册': ['第六章 平面向量及其应用','第七章 复数','第八章 立体几何初步','第九章 统计','第十章 概率'],
      '选择性必修 第一册': ['第一章 空间向量与立体几何','第二章 直线和圆的方程','第三章 圆锥曲线的方程'],
      '选择性必修 第二册': ['第四章 数列','第五章 一元函数的导数及其应用'],
      '选择性必修 第三册': ['第六章 计数原理','第七章 随机变量及其分布','第八章 成对数据的统计分析'],
    },
    '英语': {
      '必修 第一册': ['Unit 1 Teenage Life','Unit 2 Travelling Around','Unit 3 Sports and Fitness','Unit 4 Natural Disasters','Unit 5 Languages Around the World'],
      '必修 第二册': ['Unit 1 Cultural Heritage','Unit 2 Wildlife Protection','Unit 3 The Internet','Unit 4 History and Traditions','Unit 5 Music'],
      '选择性必修 第一册': ['Unit 1 People of Achievement','Unit 2 Looking into the Future','Unit 3 Fascinating Parks','Unit 4 Body Language','Unit 5 Working the Land'],
      '选择性必修 第二册': ['Unit 1 Science and Scientists','Unit 2 Bridging Cultures','Unit 3 Food and Culture','Unit 4 Journey Across a Vast Land','Unit 5 First Aid'],
      '选择性必修 第三册': ['Unit 1 Art','Unit 2 Healthy Lifestyle','Unit 3 Environmental Protection','Unit 4 Adversity and Courage','Unit 5 Poems'],
    },
    '物理': {
      '必修 第一册': ['第一章 运动的描述','第二章 匀变速直线运动','第三章 相互作用','第四章 运动和力的关系'],
      '必修 第二册': ['第五章 抛体运动','第六章 圆周运动','第七章 万有引力与宇宙航行','第八章 机械能守恒定律'],
      '必修 第三册': ['第九章 静电场及其应用','第十章 静电场中的能量','第十一章 电路及其应用','第十二章 电能 能量守恒定律','第十三章 电磁感应与电磁波初步'],
      '选择性必修 第一册': ['第一章 动量守恒定律','第二章 机械振动','第三章 机械波','第四章 光'],
      '选择性必修 第二册': ['第五章 热力学定律','第六章 原子物理初步','第七章 原子核物理初步'],
      '选择性必修 第三册': ['第八章 磁场','第九章 电磁感应','第十章 交变电流','第十一章 传感器'],
    },
    '化学': {
      '必修 第一册': ['第一章 物质及其变化','第二章 海水中的重要元素','第三章 铁 金属材料','第四章 物质结构 元素周期律'],
      '必修 第二册': ['第五章 化工生产中的重要非金属元素','第六章 化学反应与能量','第七章 有机化合物','第八章 化学与可持续发展'],
      '选择性必修1 化学反应原理': ['第一章 化学反应与能量','第二章 化学反应速率与化学平衡','第三章 水溶液中的离子反应','第四章 电化学基础'],
      '选择性必修2 物质结构与性质': ['第一章 原子结构与性质','第二章 分子结构与性质','第三章 晶体结构与性质'],
      '选择性必修3 有机化学基础': ['第一章 有机化合物的结构特点','第二章 烃','第三章 烃的衍生物','第四章 生物大分子','第五章 合成高分子'],
    },
    '生物': {
      '必修1 分子与细胞': ['第一章 走近细胞','第二章 组成细胞的分子','第三章 细胞的基本结构','第四章 细胞的物质输入和输出','第五章 细胞的能量供应和利用','第六章 细胞的生命历程'],
      '必修2 遗传与进化': ['第一章 遗传因子的发现','第二章 基因和染色体的关系','第三章 基因的本质','第四章 基因的表达','第五章 基因突变及其他变异','第六章 生物的进化'],
      '选择性必修1 稳态与调节': ['第一章 人体的内环境与稳态','第二章 神经调节','第三章 体液调节','第四章 免疫调节','第五章 植物生命活动的调节'],
      '选择性必修2 生物与环境': ['第一章 种群及其动态','第二章 群落及其演替','第三章 生态系统及其稳定性','第四章 人与环境'],
      '选择性必修3 生物技术与工程': ['第一章 发酵工程','第二章 细胞工程','第三章 基因工程','第四章 生物技术的安全与伦理'],
    },
    '历史': {
      '必修 中外历史纲要（上）': ['第一单元 中华文明的起源与早期发展','第二单元 秦汉统一多民族封建国家的建立与巩固','第三单元 三国两晋南北朝的民族交融','第四单元 隋唐盛世','第五单元 辽宋夏金多民族政权的并立','第六单元 明清统一多民族封建国家的发展','第七单元 晚清时期的内忧外患与救亡图存','第八单元 辛亥革命与中华民国的建立','第九单元 中国共产党成立与新民主主义革命','第十单元 中华人民共和国成立及向社会主义过渡','第十一单元 改革开放与社会主义现代化建设'],
      '必修 中外历史纲要（下）': ['第一单元 古代文明的产生与发展','第二单元 中古时期的世界','第三单元 走向整体的世界','第四单元 资本主义制度的确立','第五单元 工业革命与马克思主义的诞生','第六单元 世界殖民体系与亚非拉民族独立运动','第七单元 两次世界大战','第八单元 20世纪下半叶世界的新变化','第九单元 当代世界发展的特征与主题'],
      '选择性必修1 国家制度与社会治理': ['第一单元 政治制度','第二单元 官员的选拔与管理','第三单元 法律与教化','第四单元 民族关系与国家关系','第五单元 基层治理与社会保障'],
      '选择性必修2 经济与社会生活': ['第一单元 食物生产与社会生活','第二单元 生产工具与劳作方式','第三单元 商业贸易与日常生活','第四单元 村落、城镇与居住环境','第五单元 交通与社会变迁','第六单元 医疗与公共卫生'],
      '选择性必修3 文化交流与传播': ['第一单元 源远流长的中华文化','第二单元 丰富多彩的世界文化','第三单元 人口迁徙与文化认同','第四单元 商路、贸易与文化交流','第五单元 战争与文化碰撞','第六单元 文化的传承与保护'],
    },
    '地理': {
      '必修 第一册': ['第一章 地球与地图','第二章 大气环境','第三章 水环境','第四章 地质与地貌','第五章 土壤与生物','第六章 自然地理环境的整体性与差异性'],
      '必修 第二册': ['第一章 人口与地理环境','第二章 城市与地理环境','第三章 农业地域的形成与发展','第四章 工业地域的形成与发展','第五章 交通布局及其影响','第六章 人类与地理环境的协调发展'],
      '选择性必修1 自然地理基础': ['第一章 地球运动','第二章 大气环境深化','第三章 水体运动深化','第四章 地壳物质循环与地表形态'],
      '选择性必修2 区域发展': ['第一章 区域地理环境与人类活动','第二章 区域可持续发展','第三章 地理信息技术应用'],
      '选择性必修3 资源、环境与国家安全': ['第一章 自然资源与人类活动','第二章 生态环境保护','第三章 环境与国家安全'],
    },
    '政治': {
      '必修1 中国特色社会主义': ['第一课 社会主义从空想到科学','第二课 只有社会主义才能救中国','第三课 只有中国特色社会主义才能发展中国','第四课 只有坚持和发展中国特色社会主义才能实现中华民族的伟大复兴'],
      '必修2 经济与社会': ['第一课 我国的生产资料所有制','第二课 我国的社会主义市场经济体制','第三课 我国的经济发展','第四课 我国的个人收入分配与社会保障'],
      '必修3 政治与法治': ['第一课 历史和人民的选择','第二课 中国共产党的先进性','第三课 坚持和加强党的全面领导','第四课 人民民主专政','第五课 我国的根本政治制度','第六课 我国的基本政治制度','第七课 治国理政的基本方式','第八课 法治中国建设','第九课 全面依法治国的基本要求'],
      '必修4 哲学与文化': ['第一课 时代精神的精华','第二课 探究世界的本质','第三课 把握世界的规律','第四课 探索认识的奥秘','第五课 寻觅社会的真谛','第六课 实现人生的价值','第七课 继承发展中华优秀传统文化','第八课 学习借鉴外来文化的有益成果','第九课 发展中国特色社会主义文化'],
      '选择性必修1 当代国际政治与经济': ['第一课 国体与政体','第二课 国家的结构形式','第三课 多极化趋势','第四课 和平与发展','第五课 中国与联合国','第六课 主要的国际组织'],
      '选择性必修2 法律与生活': ['第一课 在生活中学民法','第二课 依法有效保护财产权','第三课 订约履约 诚信为本','第四课 侵权责任与权利界限','第五课 在婚姻家庭关系中守法用法','第六课 做个明白的劳动者','第七课 自主创业与诚信经营','第八课 纠纷的多元解决方式'],
      '选择性必修3 逻辑与思维': ['第一课 走进思维的世界','第二课 把握逻辑规则','第三课 领会科学思维','第四课 准确把握概念','第五课 正确运用判断','第六课 掌握演绎推理方法','第七课 学会归纳与类比推理','第八课 把握辩证分合','第九课 理解质量互变','第十课 推动认识发展','第十一课 创新思维要善于联想','第十二课 创新思维要多路探索','第十三课 创新思维要力求超前'],
    },
  },
};

// ========== 知识点模板生成 ==========
function genKnowledgePoints() {
  const points = [];
  let id = 1;
  for (const [grade, subjects] of Object.entries(textbookStructure)) {
    for (const [subject, chapters] of Object.entries(subjects)) {
      for (const [textbook, chapterList] of Object.entries(chapters)) {
        for (const chapter of chapterList) {
          // 每个章节生成 3-6 个知识点
          const count = 3 + Math.floor(Math.random() * 4);
          for (let i = 0; i < count; i++) {
            const types = ['基础','重点','考点'];
            const type = i === 0 ? '基础' : (i === 1 ? '重点' : '考点');
            const titles = genTitles(grade, subject, chapter, i);
            points.push({
              id: id++,
              grade,
              subject,
              textbook,
              chapter,
              title: titles.title,
              type,
              content: titles.content,
              mastery: 0,
            });
          }
        }
      }
    }
  }
  return points;
}

function genTitles(grade, subject, chapter, idx) {
  const titleMap = {
    '语文': ['重点字词','文学常识','句子理解','阅读技巧','写作方法','古诗文背诵','文言文翻译','中心思想'],
    '数学': ['概念理解','公式推导','典型例题','易错点','解题技巧','综合运用','拓展提高'],
    '英语': ['核心单词','重点短语','语法知识','句型结构','阅读理解','写作技巧','听力技巧'],
    '物理': ['概念理解','公式推导','实验探究','典型例题','易错分析','解题方法'],
    '化学': ['概念理解','化学方程式','实验操作','计算技巧','物质性质','反应原理'],
    '生物': ['概念理解','结构功能','生理过程','实验探究','进化适应'],
    '历史': ['历史事件','人物评价','制度变革','文化成就','史料分析'],
    '地理': ['地形气候','区域特征','人文经济','地图阅读','环境保护'],
    '道德与法治': ['法律常识','道德规范','国情教育','公民意识','社会实践'],
    '政治': ['概念理解','原理阐述','方法论','现实意义','辩证法'],
  };
  const arr = titleMap[subject] || ['知识点' + (idx+1)];
  const title = arr[idx % arr.length];
  return {
    title: title + ' —— ' + chapter,
    content: `【${title}】\n\n本节重点：\n1. 理解基本概念\n2. 掌握基本方法\n3. 能够灵活运用\n\n【典型例题】\n（例题内容根据实际课本章节定制）\n\n【易错提醒】\n注意区分易混淆概念，做题时仔细审题。`,
  };
}

// ========== 题库生成 ==========
function genQuizBanks() {
  const banks = [];
  let id = 1;
  for (const [grade, subjects] of Object.entries(textbookStructure)) {
    for (const [subject, chapters] of Object.entries(subjects)) {
      for (const [textbook, chapterList] of Object.entries(chapters)) {
        for (const chapter of chapterList) {
          // 每个章节生成 5 道基础题 + 3 道提升题 + 2 道难题
          for (let i = 0; i < 5; i++) {
            banks.push(genOneQuestion(id++, grade, subject, textbook, chapter, '基础'));
          }
          for (let i = 0; i < 3; i++) {
            banks.push(genOneQuestion(id++, grade, subject, textbook, chapter, '提升'));
          }
          for (let i = 0; i < 2; i++) {
            banks.push(genOneQuestion(id++, grade, subject, textbook, chapter, '难题'));
          }
        }
      }
    }
  }
  return banks;
}

function genOneQuestion(id, grade, subject, textbook, chapter, difficulty) {
  const qTypes = {
    '语文': {
      '基础': ['下列词语中加点字读音正确的是？','下列句子没有语病的是？','下列文学常识表述正确的是？'],
      '提升': ['下列对文章内容理解正确的是？','下列对句子赏析不正确的是？'],
      '难题': ['下列对文章主旨概括最准确的是？','结合全文分析作者表达的思想感情。'],
    },
    '数学': {
      '基础': ['下列计算正确的是？','下列图形中，是轴对称图形的是？','下列方程中，是一元一次方程的是？'],
      '提升': ['已知函数f(x)=2x+1，则f(3)的值为？','如图，在△ABC中，∠A=60°，则∠B+∠C=？'],
      '难题': ['已知函数f(x)=x²-2x+3，则f(x)的最小值为？','如图，在矩形ABCD中，AB=4，BC=6，则对角线AC的长为？'],
    },
    '英语': {
      '基础': ['—What is your name? —___ name is Tom.','下列单词中，划线部分读音不同的是？'],
      '提升': ['If it ___ tomorrow, we will stay at home.','The book ___ I bought yesterday is very interesting.'],
      '难题': ['___ is known to all, the earth moves around the sun.','Not only you but also he ___ going to the park.'],
    },
  };
  const types = qTypes[subject] || qTypes['数学'];
  const pool = types[difficulty] || types['基础'];
  const qText = pool[id % pool.length];
  const opts = genOptions(grade, subject, difficulty);
  const ans = Math.floor(Math.random() * 4);
  return {
    id,
    grade,
    subject,
    textbook,
    chapter,
    difficulty,
    question: qText + '（' + chapter + '）',
    options: opts,
    answer: 'ABCD'[ans],
    explanation: `【解析】本题考查${chapter}的相关知识。正确答案是${'ABCD'[ans]}，因为${opts[ans].replace(/^[A-D]\.\s*/, '')}符合${subject}的基本原理。`,
    tag: chapter,
  };
}

function genOptions(grade, subject, difficulty) {
  const optPool = {
    '语文': [['A. 正确','B. 错误','C. 不完全正确','D. 以上都不对'],['A. ①和②','B. ②和③','C. ①和④','D. ③和④']],
    '数学': [['A. 2','B. 3','C. 4','D. 5'],['A. 任意两边之和大于第三边','B. 任意两边之差大于第三边','C. 面积等于底乘高','D. 内角和等于90°']],
    '英语': [['A. My','B. Your','C. His','D. Her'],['A. rains','B. will rain','C. rained','D. is raining']],
  };
  const pool = optPool[subject] || optPool['数学'];
  return pool[id % pool.length] || pool[0];
}

// ========== 古诗文（扩充）==========
function genPoems() {
  const base = [
    { id:1, title:'静夜思', author:'李白（唐）', content:'床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', translation:'床前洒满了明亮的月光，好像地上泛起了一层白霜。', appreciation:'语言清新朴素，意境明朗空灵。', grade:'小学', tags:['思乡','月亮'] },
    { id:2, title:'春晓', author:'孟浩然（唐）', content:'春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。', translation:'春日里贪睡不知不觉天已破晓。', appreciation:'看似平淡，却蕴含无限惜春之意。', grade:'小学', tags:['春天','惜春'] },
    { id:3, title:'望庐山瀑布', author:'李白（唐）', content:'日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。', translation:'香炉峰在阳光照射下生起紫色烟霞。', appreciation:'气势磅礴，大胆夸张，浪漫主义风格。', grade:'小学', tags:['山水','夸张'] },
    { id:4, title:'出塞', author:'王昌龄（唐）', content:'秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。', translation:'依旧是秦汉时期的明月和边关。', appreciation:'边塞诗的压卷之作，雄浑豪放。', grade:'初中', tags:['边塞','爱国'] },
    { id:5, title:'水调歌头', author:'苏轼（宋）', content:'明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。', translation:'明月从什么时候开始有的？端起酒杯来询问青天。', appreciation:'中秋词中的绝唱，融入丰富的哲理与深情。', grade:'初中', tags:['中秋','苏轼'] },
    { id:6, title:'登高', author:'杜甫（唐）', content:'风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。', translation:'风急天高猿猴啼叫显得十分悲哀。', appreciation:'被誉为古今七律第一。', grade:'高中', tags:['律诗','杜甫'] },
    { id:7, title:'岳阳楼记', author:'范仲淹（宋）', content:'庆历四年春，滕子京谪守巴陵郡。\n越明年，政通人和，百废具兴。', translation:'庆历四年的春天，滕子京被贬职到巴陵郡做太守。', appreciation:'不以物喜不以己悲的旷达胸襟。', grade:'初中', tags:['古文','范仲淹'] },
    { id:8, title:'桃花源记', author:'陶渊明（晋）', content:'晋太元中，武陵人捕鱼为业。\n缘溪行，忘路之远近。', translation:'东晋太元年间，武陵郡有个人以打鱼为生。', appreciation:'描绘了一个与世无争的理想社会。', grade:'初中', tags:['古文','陶渊明'] },
    { id:9, title:'滕王阁序', author:'王勃（唐）', content:'豫章故郡，洪都新府。\n星分翼轸，地接衡庐。', translation:'这里是汉代的豫章郡城，如今是洪都的都督府。', appreciation:'落霞与孤鹜齐飞，秋水共长天一色。', grade:'高中', tags:['古文','王勃'] },
    { id:10, title:'论语', author:'孔子', content:'学而时习之，不亦说乎？\n有朋自远方来，不亦乐乎？', translation:'学习并且按时温习，不也很愉快吗？', appreciation:'儒家经典，记录了孔子及其弟子的言行。', grade:'初中', tags:['儒家','教育'] },
    { id:11, title:'陋室铭', author:'刘禹锡（唐）', content:'山不在高，有仙则名。\n水不在深，有龙则灵。', translation:'山不在于高，有了神仙就出名。', appreciation:'表达了作者高洁傲岸的情操和安贫乐道的情趣。', grade:'初中', tags:['古文','刘禹锡'] },
    { id:12, title:'爱莲说', author:'周敦颐（宋）', content:'水陆草木之花，可爱者甚蕃。\n晋陶渊明独爱菊。', translation:'水上、陆地上各种草本木本的花，值得喜爱的非常多。', appreciation:'以莲喻人，表达不慕名利、洁身自好的高尚品质。', grade:'初中', tags:['古文','周敦颐'] },
    { id:13, title:'赤壁赋', author:'苏轼（宋）', content:'壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。', translation:'壬戌年的秋天，七月十六日，苏轼与友人在赤壁之下泛舟游玩。', appreciation:'借赤壁之游抒发对人生无常的感慨，却又表现出旷达的人生态度。', grade:'高中', tags:['古文','苏轼'] },
    { id:14, title:'劝学', author:'荀子', content:'青，取之于蓝，而青于蓝；冰，水为之，而寒于水。', translation:'靛青是从蓼蓝中提取的，但颜色比蓼蓝更深。', appreciation:'以生动的比喻说明学习的重要性，强调学习可以改变人。', grade:'高中', tags:['古文','荀子'] },
    { id:15, title:'将进酒', author:'李白（唐）', content:'君不见黄河之水天上来，奔流到海不复回。', translation:'你没看见黄河的水从天上流下来，奔腾入海不再回。', appreciation:'气势磅礴，感情奔放，是李白诗歌的代表作之一。', grade:'高中', tags:['古诗','李白'] },
  ];
  return base;
}

// ========== 公式库（扩充）==========
function genFormulas() {
  return [
    { id:1, subject:'数学', grade:'小学', category:'四则运算', name:'加法交换律', formula:'a + b = b + a', desc:'两数相加，交换加数的位置，和不变。' },
    { id:2, subject:'数学', grade:'小学', category:'面积', name:'长方形面积', formula:'S = a × b', desc:'长方形面积 = 长 × 宽' },
    { id:3, subject:'数学', grade:'小学', category:'面积', name:'正方形面积', formula:'S = a²', desc:'正方形面积 = 边长 × 边长' },
    { id:4, subject:'数学', grade:'小学', category:'体积', name:'长方体体积', formula:'V = a × b × h', desc:'长方体体积 = 长 × 宽 × 高' },
    { id:5, subject:'数学', grade:'初中', category:'代数', name:'平方差公式', formula:'a² - b² = (a+b)(a-b)', desc:'两个数的平方差，等于这两个数的和与这两个数的差的积。' },
    { id:6, subject:'数学', grade:'初中', category:'代数', name:'完全平方公式', formula:'(a ± b)² = a² ± 2ab + b²', desc:'两数和（或差）的平方公式。' },
    { id:7, subject:'数学', grade:'初中', category:'几何', name:'勾股定理', formula:'a² + b² = c²', desc:'直角三角形两直角边的平方和等于斜边的平方。' },
    { id:8, subject:'数学', grade:'初中', category:'几何', name:'三角形面积', formula:'S = ½ah', desc:'三角形面积 = ½ × 底 × 高。' },
    { id:9, subject:'数学', grade:'高中', category:'三角函数', name:'正弦定理', formula:'a/sinA = b/sinB = c/sinC = 2R', desc:'三角形中，各边与其对角的正弦之比相等。' },
    { id:10, subject:'数学', grade:'高中', category:'三角函数', name:'余弦定理', formula:'c² = a² + b² - 2ab·cosC', desc:'三角形中，一边的平方等于其他两边的平方和减去这两边与它们夹角的余弦的积的两倍。' },
    { id:11, subject:'数学', grade:'高中', category:'数列', name:'等差数列求和', formula:'Sn = n(a₁+aₙ)/2 = na₁ + n(n-1)d/2', desc:'等差数列前n项和公式。' },
    { id:12, subject:'数学', grade:'高中', category:'数列', name:'等比数列求和', formula:'Sn = a₁(1-qⁿ)/(1-q) (q≠1)', desc:'等比数列前n项和公式。' },
    { id:13, subject:'物理', grade:'初中', category:'力学', name:'牛顿第二定律', formula:'F = ma', desc:'物体加速度的大小跟作用力成正比。' },
    { id:14, subject:'物理', grade:'初中', category:'力学', name:'压强公式', formula:'p = F/S', desc:'压强 = 压力 ÷ 受力面积。' },
    { id:15, subject:'物理', grade:'初中', category:'浮力', name:'阿基米德原理', formula:'F浮 = G排 = ρ液gV排', desc:'浸在液体中的物体受到向上的浮力，浮力大小等于物体排开的液体所受的重力。' },
    { id:16, subject:'物理', grade:'高中', category:'电磁学', name:'欧姆定律', formula:'I = U/R', desc:'通过导体的电流跟导体两端的电压成正比。' },
    { id:17, subject:'物理', grade:'高中', category:'电磁学', name:'电功率', formula:'P = UI = I²R = U²/R', desc:'电功率等于电压与电流的乘积。' },
    { id:18, subject:'化学', grade:'初中', category:'方程式', name:'水的电解', formula:'2H₂O → 2H₂ + O₂', desc:'水在通电条件下分解为氢气和氧气。' },
    { id:19, subject:'化学', grade:'初中', category:'方程式', name:'铁与硫酸铜反应', formula:'Fe + CuSO₄ → FeSO₄ + Cu', desc:'铁能把铜从硫酸铜溶液中置换出来。' },
    { id:20, subject:'化学', grade:'高中', category:'化学平衡', name:'平衡常数', formula:'K = [C]ᶜ[D]ᵈ/([A]ᵃ[B]ᵇ)', desc:'在一定温度下，可逆反应达到平衡时，生成物浓度幂之积与反应物浓度幂之积的比值是一个常数。' },
  ];
}

// ========== 主输出 ==========
const knowledgePoints = genKnowledgePoints();
const quizBanks = genQuizBanks();
const poems = genPoems();
const formulas = genFormulas();

// 只输出 data.js 的内容
console.log(`// =============================================
//  K12 学习助手 - 全局数据库（自动生成）
//  生成时间：${new Date().toISOString().slice(0,10)}
//  知识点数量：${knowledgePoints.length}
//  题库数量：${quizBanks.length}
// =============================================

// ---------- 古诗文 ----------
const poems = ${JSON.stringify(poems, null, 2)};

// ---------- 公式库 ----------
const formulas = ${JSON.stringify(formulas, null, 2)};

// ---------- 知识点库 ----------
const knowledgePoints = ${JSON.stringify(knowledgePoints, null, 2)};

// ---------- 题库 ----------
const quizBanks = ${JSON.stringify(quizBanks, null, 2)};

// ---------- 单词库（示例）----------
const words = [
  { id:1, word:'apple', phonetic:'/ˈæpl/', meaning:'苹果', example:'I eat an apple every day.', grade:'小学', module:'Unit 1' },
  { id:2, word:'happy', phonetic:'/ˈhæpi/', meaning:'快乐的', example:'She feels happy today.', grade:'小学', module:'Unit 1' },
  { id:3, word:'school', phonetic:'/skuːl/', meaning:'学校', example:'I go to school by bus.', grade:'小学', module:'Unit 2' },
  { id:4, word:'because', phonetic:'/bɪˈkɒz/', meaning:'因为', example:'I like summer because I can swim.', grade:'初中', module:'Unit 1' },
  { id:5, word:'important', phonetic:'/ɪmˈpɔːtnt/', meaning:'重要的', example:'This is an important meeting.', grade:'初中', module:'Unit 2' },
  { id:6, word:'opportunity', phonetic:'/ˌɒpəˈtjuːnəti/', meaning:'机会', example:'This is a good opportunity.', grade:'高中', module:'Unit 1' },
];

// ---------- 成语库 ----------
const idioms = [
  { id:1, word:'画龙点睛', pinyin:'huà lóng diǎn jīng', meaning:'比喻在关键地方加上精辟的语句。', usage:'这篇文章的结尾真是画龙点睛之笔。', grade:'小学' },
  { id:2, word:'守株待兔', pinyin:'shǒu zhū dài tù', meaning:'比喻不主动努力，而存万一的侥幸心理。', usage:'学习不能守株待兔，要主动进取。', grade:'小学' },
  { id:3, word:'亡羊补牢', pinyin:'wáng yáng bǔ láo', meaning:'比喻出了问题以后想办法补救。', usage:'虽然这次没考好，但亡羊补牢，为时不晚。', grade:'小学' },
  { id:4, word:'锲而不舍', pinyin:'qiè ér bù shě', meaning:'比喻有恒心，有毅力，坚持不懈。', usage:'学习要有锲而不舍的精神。', grade:'初中' },
  { id:5, word:'厚积薄发', pinyin:'hòu jī bó fā', meaning:'长期大量地积累，然后少量地慢慢释放出来。', usage:'只有厚积薄发，才能在考场上从容应对。', grade:'初中' },
  { id:6, word:'举一反三', pinyin:'jǔ yī fǎn sān', meaning:'比喻从一件事情类推而知道其他许多事情。', usage:'学习要举一反三，不能死记硬背。', grade:'初中' },
  { id:7, word:'破釜沉舟', pinyin:'pò fǔ chén zhōu', meaning:'比喻下决心不顾一切地干到底。', usage:'面对高考，我们要有破釜沉舟的勇气。', grade:'高中' },
];

// ---------- 学科 & 章节索引 ----------
function getSubjectsByGrade(grd) {
  var grade = grd || (window.App && App.state && App.state.grade) || '小学';
  var subs = [];
  (window.AppData.knowledgePoints||[]).forEach(function(k) {
    if (k.grade === grade && subs.indexOf(k.subject) === -1) subs.push(k.subject);
  });
  return subs;
}

function getChaptersBySubject(grd, subject) {
  var grade = grd || (window.App && App.state && App.state.grade) || '小学';
  var chapters = [];
  (window.AppData.knowledgePoints||[]).forEach(function(k) {
    if (k.grade === grade && k.subject === subject && chapters.indexOf(k.chapter) === -1) chapters.push(k.chapter);
  });
  return chapters;
}

function getPointsByChapter(grd, subject, chapter) {
  var grade = grd || (window.App && App.state && App.state.grade) || '小学';
  return (window.AppData.knowledgePoints||[]).filter(function(k) {
    return k.grade === grade && k.subject === subject && k.chapter === chapter;
  });
}

function getQuizByChapter(grd, subject, chapter) {
  var grade = grd || (window.App && App.state && App.state.grade) || '小学';
  return (window.AppData.quizBanks||[]).filter(function(q) {
    return q.grade === grade && q.subject === subject && q.chapter === chapter;
  });
}

// 挂在 window.AppData 上，供各页面调用
window.AppData = window.AppData || {};
window.AppData.poems = poems;
window.AppData.formulas = formulas;
window.AppData.words = words;
window.AppData.idioms = idioms;
window.AppData.knowledgePoints = knowledgePoints;
window.AppData.quizBanks = quizBanks;
window.AppData.getSubjectsByGrade = getSubjectsByGrade;
window.AppData.getChaptersBySubject = getChaptersBySubject;
window.AppData.getPointsByChapter = getPointsByChapter;
window.AppData.getQuizByChapter = getQuizByChapter;
`);

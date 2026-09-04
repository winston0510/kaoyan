export interface KnowledgeItem {
  title: string;
  content: string;
  tags?: string[];
}

export interface KnowledgeSection {
  name: string;
  items: KnowledgeItem[];
}

export interface KnowledgePart {
  name: string;
  sections: KnowledgeSection[];
}

export interface FlashCard {
  q: string;
  a: string;
}

export interface FlashCardGroup {
  name: string;
  cards: FlashCard[];
}

export interface KnowledgeTopic {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  unit?: string;
  parts: KnowledgePart[];
  tips: string[];
  cardGroups: FlashCardGroup[];
}

const P1 = (sections: KnowledgeSection[]): KnowledgePart => ({ name: '高等数学', sections });
const P2 = (sections: KnowledgeSection[]): KnowledgePart => ({ name: '线性代数', sections });
const sec = (name: string, items: KnowledgeItem[]): KnowledgeSection => ({ name, items });
const item = (title: string, content: string, tags?: string[]): KnowledgeItem => ({ title, content, tags });

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: 'math2-knowledge',
    name: '考研数学二',
    subtitle: '高等数学 78% · 线性代数 22%',
    icon: '📐',
    color: '#2ECC71',
    parts: [
      P1([
        sec('一、极限与连续', [
          item('两个重要极限', [
            '$$\\lim_{x\\to 0}\\frac{\\sin x}{x}=1\\qquad\\qquad\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^{x}=e\\ \\Longleftrightarrow\\ \\lim_{x\\to 0}(1+x)^{\\frac{1}{x}}=e$$'
          ].join('\n')),
          item('等价无穷小（x→0，乘除因子可直接替换）', [
            '$\\sin x\\sim x$，$\\tan x\\sim x$',
            '$\\arcsin x\\sim x$，$\\arctan x\\sim x$',
            '$1-\\cos x\\sim \\frac{1}{2}x^2$，$\\ln(1+x)\\sim x$',
            '$e^x-1\\sim x$，$a^x-1\\sim x\\ln a$',
            '$(1+x)^{\\alpha}-1\\sim \\alpha x$，$x-\\sin x\\sim \\frac{1}{6}x^3$',
            '$\\tan x-x\\sim \\frac{1}{3}x^3$，$x-\\arctan x\\sim \\frac{1}{3}x^3$',
            '$\\arcsin x-x\\sim \\frac{1}{6}x^3$，$\\tan x-\\sin x\\sim \\frac{1}{2}x^3$',
            '$1-\\cos^{\\alpha}x\\sim \\frac{\\alpha}{2}x^2$，$x-\\ln(1+x)\\sim \\frac{1}{2}x^2$'
          ].join('\n')),
          item('常用极限工具', [
            '幂指函数：$u(x)^{v(x)}=e^{v(x)\\ln u(x)}$',
            '夹逼准则、单调有界准则',
            '洛必达法则：$\\displaystyle\\lim\\frac{f(x)}{g(x)}\\xrightarrow{\\ \\frac{0}{0}\\ \\text{或}\\ \\frac{\\infty}{\\infty}\\ }\\lim\\frac{f\'(x)}{g\'(x)}$（先检验未定式，再可重复使用）'
          ].join('\n')),
          item('连续与间断', [
            '间断点四类：可去（左右极限相等但不等于函数值或无定义）、跳跃（左右极限存在但不相等）、无穷（极限为 ∞）、振荡（极限不存在且非 ∞）',
            '闭区间连续函数性质：有界性定理、最值定理、介值定理、零点定理（证明方程有根的通用武器）'
          ].join('\n'))
        ]),
        sec('二、导数与微分', [
          item('基本求导公式', [
            '$(C)\'=0$，$(\\sec x)\'=\\sec x\\tan x$',
            '$(x^{\\mu})\'=\\mu x^{\\mu-1}$，$(\\csc x)\'=-\\csc x\\cot x$',
            '$(\\sin x)\'=\\cos x$，$(\\arcsin x)\'=\\frac{1}{\\sqrt{1-x^2}}$',
            '$(\\cos x)\'=-\\sin x$，$(\\arccos x)\'=-\\frac{1}{\\sqrt{1-x^2}}$',
            '$(\\tan x)\'=\\sec^2 x$，$(\\arctan x)\'=\\frac{1}{1+x^2}$',
            '$(\\cot x)\'=-\\csc^2 x$，$(\\operatorname{arccot} x)\'=-\\frac{1}{1+x^2}$',
            '$(e^x)\'=e^x$，$(a^x)\'=a^x\\ln a$',
            '$(\\ln x)\'=\\frac{1}{x}$，$(\\log_a x)\'=\\frac{1}{x\\ln a}$'
          ].join('\n')),
          item('求导法则', [
            '四则运算：$(uv)\'=u\'v+uv\'$；$\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}$',
            '复合函数链式法则：$\\frac{dy}{dx}=\\frac{dy}{du}\\cdot\\frac{du}{dx}$',
            '反函数：$y\'_x=\\frac{1}{x\'_y}$',
            '隐函数：方程两边对 x 求导，把 y 视为 x 的函数',
            '参数方程：$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}$',
            '对数求导法（连乘、幂指函数首选）'
          ].join('\n')),
          item('高阶导数', [
            '莱布尼茨公式：$(uv)^{(n)}=\\displaystyle\\sum_{k=0}^{n}C_n^k\\,u^{(k)}v^{(n-k)}$',
            '$(\\sin x)^{(n)}=\\sin\\left(x+\\frac{n\\pi}{2}\\right)$，$(\\cos x)^{(n)}=\\cos\\left(x+\\frac{n\\pi}{2}\\right)$',
            '$(e^{ax})^{(n)}=a^n e^{ax}$，$(\\ln x)^{(n)}=\\frac{(-1)^{n-1}(n-1)!}{x^n}$'
          ].join('\n'))
        ]),
        sec('三、微分中值定理与泰勒公式', [
          item('三大中值定理', [
            '罗尔定理：[a,b] 连续 + (a,b) 可导 + $f(a)=f(b)$ ⟹ 存在 $\\xi\\in(a,b)$ 使 $f\'(\\xi)=0$',
            '拉格朗日中值：连续 + 可导 ⟹ $f(b)-f(a)=f\'(\\xi)(b-a)$（可写 $\\Delta y=f\'(\\xi)\\Delta x$）',
            '柯西中值：两函数连续 + 可导，$g\'(x)\\neq0$ ⟹ $\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f\'(\\xi)}{g\'(\\xi)}$',
            '记忆：拉格朗日是罗尔的推广，柯西是拉格朗日的推广'
          ].join('\n')),
          item('泰勒公式（麦克劳林展开，x→0）', [
            '$$e^x=1+x+\\frac{x^2}{2!}+\\cdots+\\frac{x^n}{n!}+o(x^n)$$',
            '$$\\sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\cdots+(-1)^{n}\\frac{x^{2n+1}}{(2n+1)!}+o(x^{2n+2})$$',
            '$$\\cos x=1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\cdots+(-1)^{n}\\frac{x^{2n}}{(2n)!}+o(x^{2n+1})$$',
            '$$\\ln(1+x)=x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\cdots+(-1)^{n-1}\\frac{x^n}{n}+o(x^n)$$',
            '$$(1+x)^{\\alpha}=1+\\alpha x+\\frac{\\alpha(\\alpha-1)}{2!}x^2+\\cdots+C_{\\alpha}^{n}x^n+o(x^n)$$',
            '$$\\frac{1}{1-x}=1+x+x^2+x^3+\\cdots+x^n+o(x^n)\\quad(|x|<1)$$',
            '$$\\arctan x=x-\\frac{x^3}{3}+\\frac{x^5}{5}-\\cdots$$',
            '记忆口诀：单调性一阶导，凹凸性二阶导；展开前几项，极限好化简。'
          ].join('\n'))
        ]),
        sec('四、导数的应用', [
          item('单调、极值、最值', [
            '单调区间：解 $f\'(x)$ 的符号区间',
            '极值：① 充分条件一：$f\'(x)$ 在 $x_0$ 两侧变号（左正右负极大，左负右正极小）；② 充分条件二：$f\'(x_0)=0$ 且 $f\'\'(x_0)\\neq0$，$f\'\'(x_0)<0$ 极大、$>0$ 极小',
            '最值：驻点、不可导点、端点三处取值比较'
          ].join('\n')),
          item('凹凸、渐近线、曲率', [
            '凹凸与拐点：$f\'\'(x)>0$ 凹（下凸），$f\'\'(x)<0$ 凸；拐点处 $f\'\'(x_0)=0$ 或不存在且 $f\'\'$ 在该点两侧变号',
            '水平渐近线：$\\lim_{x\\to\\infty}f(x)=b$ ⟹ $y=b$',
            '垂直渐近线：$\\lim_{x\\to x_0^{\\pm}}f(x)=\\infty$ ⟹ $x=x_0$',
            '斜渐近线：$k=\\lim_{x\\to\\infty}\\frac{f(x)}{x}$（有限），$b=\\lim_{x\\to\\infty}[f(x)-kx]$（有限），则 $y=kx+b$',
            '曲率：$K=\\frac{|y\'\'|}{(1+y\'^2)^{3/2}}$，曲率半径 $R=\\frac{1}{K}$'
          ].join('\n'))
        ]),
        sec('五、不定积分', [
          item('基本积分公式', [
            '$\\displaystyle\\int x^{\\mu}dx=\\frac{x^{\\mu+1}}{\\mu+1}+C\\ (\\mu\\neq-1)$，$\\displaystyle\\int\\frac{1}{x}dx=\\ln|x|+C$',
            '$\\displaystyle\\int\\sin x\\,dx=-\\cos x+C$，$\\displaystyle\\int\\cos x\\,dx=\\sin x+C$',
            '$\\displaystyle\\int\\sec^2x\\,dx=\\tan x+C$，$\\displaystyle\\int\\csc^2x\\,dx=-\\cot x+C$',
            '$\\displaystyle\\int\\sec x\\tan x\\,dx=\\sec x+C$，$\\displaystyle\\int\\csc x\\cot x\\,dx=-\\csc x+C$',
            '$\\displaystyle\\int\\frac{dx}{1+x^2}=\\arctan x+C$，$\\displaystyle\\int\\frac{dx}{\\sqrt{1-x^2}}=\\arcsin x+C$',
            '$\\displaystyle\\int e^x dx=e^x+C$，$\\displaystyle\\int a^x dx=\\frac{a^x}{\\ln a}+C$',
            '$\\displaystyle\\int\\tan x\\,dx=-\\ln|\\cos x|+C$，$\\displaystyle\\int\\cot x\\,dx=\\ln|\\sin x|+C$',
            '$\\displaystyle\\int\\sec x\\,dx=\\ln|\\sec x+\\tan x|+C$，$\\displaystyle\\int\\csc x\\,dx=\\ln|\\csc x-\\cot x|+C$',
            '$\\displaystyle\\int\\frac{dx}{x^2+a^2}=\\frac{1}{a}\\arctan\\frac{x}{a}+C$，$\\displaystyle\\int\\frac{dx}{\\sqrt{a^2-x^2}}=\\arcsin\\frac{x}{a}+C$',
            '$\\displaystyle\\int\\sqrt{a^2-x^2}\\,dx=\\frac{x}{2}\\sqrt{a^2-x^2}+\\frac{a^2}{2}\\arcsin\\frac{x}{a}+C$',
            '$\\displaystyle\\int\\frac{dx}{x^2-a^2}=\\frac{1}{2a}\\ln\\left|\\frac{x-a}{x+a}\\right|+C$，$\\displaystyle\\int\\frac{dx}{\\sqrt{x^2\\pm a^2}}=\\ln\\left|x+\\sqrt{x^2\\pm a^2}\\right|+C$'
          ].join('\n')),
          item('积分方法与技巧', [
            '第一类换元（凑微分）：$\\int f[\\varphi(x)]\\,\\varphi\'(x)\\,dx=\\int f(u)\\,du$',
            '第二类换元（三角代换）：$\\sqrt{a^2-x^2}\\to x=a\\sin t$；$\\sqrt{a^2+x^2}\\to x=a\\tan t$；$\\sqrt{x^2-a^2}\\to x=a\\sec t$；倒代换处理高次分母',
            '分部积分：$\\int u\\,dv=uv-\\int v\\,du$（选 u 优先级：反对幂指三）',
            '有理函数积分：部分分式分解',
            '万能代换：$t=\\tan\\frac{x}{2}$（如 $\\int\\frac{dx}{a\\sin x+b\\cos x}$）'
          ].join('\n'))
        ]),
        sec('六、定积分', [
          item('基本性质与公式', [
            '牛顿-莱布尼茨公式：$\\displaystyle\\int_a^b f(x)\\,dx=F(b)-F(a)$（换元须换限、分部积分带限）',
            '奇偶性：$f$ 奇 ⟹ $\\int_{-a}^a f=0$；$f$ 偶 ⟹ $\\int_{-a}^a f=2\\int_0^a f$',
            '区间再现：$\\displaystyle\\int_a^b f(x)\\,dx=\\int_a^b f(a+b-x)\\,dx$（含 sinx/cosx 混合积分首选）',
            '周期函数：周期为 $T$ 则 $\\int_a^{a+T}f=\\int_0^T f$'
          ].join('\n')),
          item('华里士公式（点火公式）', [
            '$$\\int_0^{\\pi/2}\\sin^n x\\,dx=\\int_0^{\\pi/2}\\cos^n x\\,dx=\\begin{cases}\\dfrac{(n-1)!!}{n!!}\\cdot\\dfrac{\\pi}{2}, & n\\text{为偶数}\\\\[4pt]\\dfrac{(n-1)!!}{n!!}, & n\\text{为奇数}\\end{cases}$$',
            '记忆：偶数"点火"最后乘 π/2，奇数不乘'
          ].join('\n'), ['高频']),
          item('变上限积分', [
            '$$\\frac{d}{dx}\\int_a^{\\varphi(x)}f(t)\\,dt=f(\\varphi(x))\\,\\varphi\'(x)$$',
            '注意：被积函数含 x 时要先换元把 x 移出积分号'
          ].join('\n')),
          item('反常积分 p-判别', [
            '无穷限：$\\int_1^{+\\infty}\\frac{dx}{x^p}$，$p>1$ 收敛、$p\\le1$ 发散',
            '瑕积分：$\\int_0^1\\frac{dx}{x^p}$，$p<1$ 收敛、$p\\ge1$ 发散',
            '比较判别法 + 等价无穷小使用'
          ].join('\n')),
          item('几何应用', [
            '面积：$A=\\displaystyle\\int_a^b \\left|f(x)-g(x)\\right|\\,dx$',
            '旋转体体积（绕 x 轴）：$V=\\pi\\displaystyle\\int_a^b f(x)^2\\,dx$',
            '旋转体体积（绕 y 轴，柱壳法）：$V=2\\pi\\displaystyle\\int_a^b x\\,f(x)\\,dx$（$0\\le a<b$，$f(x)\\ge0$）',
            '弧长：$s=\\displaystyle\\int_a^b\\sqrt{1+y\'^2}\\,dx$',
            '旋转体侧面积：$S=2\\pi\\displaystyle\\int_a^b f(x)\\sqrt{1+y\'^2}\\,dx$'
          ].join('\n'), ['高频'])
        ]),
        sec('七、微分方程', [
          item('一阶方程', [
            '可分离变量：$\\dfrac{dy}{dx}=g(x)h(y)$，分离后两边积分',
            '齐次方程：$\\dfrac{dy}{dx}=f\\left(\\dfrac{y}{x}\\right)$，令 $u=\\dfrac{y}{x}$',
            '一阶线性：$y\'+P(x)y=Q(x)$，用通解公式',
            '伯努利：$y\'+P(x)y=Q(x)y^{n}\\ (n\\neq0,1)$，令 $z=y^{1-n}$ 化一阶线性'
          ].join('\n')),
          item('一阶线性通解公式', [
            '$$\\boxed{\\,y=e^{-\\int P(x)\\,dx}\\left[\\int Q(x)\\,e^{\\int P(x)\\,dx}\\,dx+C\\right]\\,}$$'
          ].join('\n'), ['必背']),
          item('二阶常系数齐次方程', [
            '方程 $y\'\'+py\'+qy=0$，特征方程 $r^2+pr+q=0$：',
            '不等实根 $r_1\\neq r_2$：$y=C_1e^{r_1 x}+C_2e^{r_2 x}$',
            '二重根 $r_1=r_2=r$：$y=(C_1+C_2x)e^{rx}$',
            '共轭复根 $\\alpha\\pm\\beta i$：$y=e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$'
          ].join('\n')),
          item('二阶常系数非齐次方程特解设法', [
            '右端 $f(x)=e^{\\lambda x}P_m(x)$：设 $y^*=x^{k}e^{\\lambda x}Q_m(x)$，其中 $k$ 为 $\\lambda$ 作为特征根的重数（0、1 或 2）',
            '右端 $f(x)=e^{\\lambda x}\\big[P_l(x)\\cos\\omega x+Q_n(x)\\sin\\omega x\\big]$：设 $y^*=x^{k}e^{\\lambda x}\\big[R_m(x)\\cos\\omega x+S_m(x)\\sin\\omega x\\big]$，$m=\\max\\{l,n\\}$，$k$ 按 $\\lambda+\\omega i$ 是否特征根取 0 或 1'
          ].join('\n'), ['易错']),
          item('可降阶方程', [
            '$y\'\'=f(x)$：连续积分两次',
            '$y\'\'=f(x,y\')$：令 $p=y\'$ 降为一阶',
            '$y\'\'=f(y,y\')$：令 $p=y\'$，$y\'\'=p\\frac{dp}{dy}$'
          ].join('\n'))
        ]),
        sec('八、多元函数微分学', [
          item('偏导数与全微分', [
            '全微分：$dz=f_x\'(x,y)dx+f_y\'(x,y)dy$',
            '多元复合函数链式法则（树形图法）',
            '隐函数求导：$F(x,y)=0$ 时 $y\'=-\\dfrac{F_x}{F_y}$；$F(x,y,z)=0$ 时 $\\dfrac{\\partial z}{\\partial x}=-\\dfrac{F_x}{F_z}$'
          ].join('\n')),
          item('无条件极值（AC−B² 判别法）', [
            '设 $A=f_{xx}\'\'$，$B=f_{xy}\'\'$，$C=f_{yy}\'\'$，在驻点处取值：',
            '$AC-B^2>0$ 且 $A<0$ ⟹ 极大；$AC-B^2>0$ 且 $A>0$ ⟹ 极小',
            '$AC-B^2<0$ ⟹ 非极值；$AC-B^2=0$ ⟹ 另行判别'
          ].join('\n'), ['高频']),
          item('条件极值', [
            '拉格朗日乘数法：$L(x,y,\\lambda)=f(x,y)+\\lambda\\varphi(x,y)$',
            '解 $\\begin{cases}L_x=0\\\\L_y=0\\\\\\varphi=0\\end{cases}$ 求出驻点，再代入实际问题判定'
          ].join('\n'))
        ]),
        sec('九、二重积分', [
          item('直角坐标与极坐标', [
            '直角坐标：X 型 $\\int_a^b dx\\int_{\\varphi_1(x)}^{\\varphi_2(x)}f\\,dy$；Y 型 $\\int_c^d dy\\int_{\\psi_1(y)}^{\\psi_2(y)}f\\,dx$；关键是交换积分次序',
            '极坐标：$x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ dx\\,dy=r\\,dr\\,d\\theta$',
            '被积函数含 $x^2+y^2$ 或积分域为圆/环/扇时优先用极坐标'
          ].join('\n')),
          item('对称性（奇偶性）', [
            '域关于 x 轴对称，被积函数对 y 奇/偶可简化；域关于 y 轴对称，对 x 奇/偶',
            '域关于 $y=x$ 对称时 $\\iint f(x,y)=\\iint f(y,x)$'
          ].join('\n'))
        ])
      ]),
      P2([
        sec('一、行列式', [
          item('常用公式与性质', [
            '$$|AB|=|A||B|,\\quad |A^T|=|A|,\\quad |kA|=k^n|A|,\\quad |A^{-1}|=\\frac{1}{|A|},\\quad |A^*|=|A|^{n-1}$$',
            '上（下）三角行列式 = 主对角线元素之积',
            '范德蒙德行列式：$V=\\prod_{1\\le j<i\\le n}(x_i-x_j)$',
            '按行（列）展开定理；克拉默法则',
            '常用技巧：行/列加减、提因子、拆项、递推法、加边法'
          ].join('\n'))
        ]),
        sec('二、矩阵', [
          item('逆矩阵', [
            '定义：$AB=BA=E$ 则 $B=A^{-1}$',
            '运算律：$(AB)^{-1}=B^{-1}A^{-1}$，$(kA)^{-1}=\\frac{1}{k}A^{-1}$，$(A^T)^{-1}=(A^{-1})^T$，$(A^{-1})^{-1}=A$',
            '可逆条件：$|A|\\neq0$；$A\\sim E$；$r(A)=n$；齐次方程组只有零解等'
          ].join('\n')),
          item('伴随矩阵', [
            '$$AA^*=A^*A=|A|E,\\qquad A^*=|A|A^{-1}\\ (A\\text{可逆时})$$',
            '$$(A^*)^*= |A|^{n-2}A\\ (n\\ge2),\\qquad (A^*)^T=(A^T)^*$$'
          ].join('\n')),
          item('矩阵的秩', [
            '$$r(AB)\\le\\min\\{r(A),r(B)\\},\\qquad r(A+B)\\le r(A)+r(B)$$',
            '$$r(A)+r(B)-n\\le r(AB)\\ \\ (\\text{西尔维斯特不等式})$$',
            '$$r\\begin{pmatrix}A&0\\\\0&B\\end{pmatrix}=r(A)+r(B)$$',
            'r(A*) 分段结论：',
            '$$r(A^*)=\\begin{cases}n, & r(A)=n\\\\1, & r(A)=n-1\\\\0, & r(A)<n-1\\end{cases}$$',
            '初等变换不改变秩；$r(A)=r(A^T)=r(A^TA)$（实数域）'
          ].join('\n'), ['高频'])
        ]),
        sec('三、向量', [
          item('线性相关与无关', [
            '$k_1\\alpha_1+\\cdots+k_s\\alpha_s=0$ 只有零解 ⟺ 无关；有非零解 ⟺ 相关',
            '判定：个数 > 维数必相关；含零向量必相关；部分相关 ⟹ 整体相关；整体无关 ⟹ 部分无关',
            '向量组等价、极大无关组、向量组的秩 = 矩阵的秩',
            '增广向量：$r(\\alpha_1,\\cdots,\\alpha_s,\\beta)=r(\\alpha_1,\\cdots,\\alpha_s)$ ⟺ $\\beta$ 可由 $\\alpha_1\\cdots\\alpha_s$ 线性表示'
          ].join('\n')),
          item('施密特正交化', [
            '$$\\beta_1=\\alpha_1,\\qquad\\beta_2=\\alpha_2-\\frac{(\\alpha_2,\\beta_1)}{(\\beta_1,\\beta_1)}\\beta_1,\\qquad\\beta_3=\\alpha_3-\\frac{(\\alpha_3,\\beta_1)}{(\\beta_1,\\beta_1)}\\beta_1-\\frac{(\\alpha_3,\\beta_2)}{(\\beta_2,\\beta_2)}\\beta_2$$',
            '最后将 $\\beta_1\\beta_2\\beta_3$ 单位化。'
          ].join('\n'))
        ]),
        sec('四、线性方程组', [
          item('解的情况判据', [
            '设 $A$ 为 $m\\times n$ 矩阵，$r=r(A)$，$\\bar r=r(A\\mid b)$：',
            '$\\bar r>r$：无解',
            '$\\bar r=r=n$：唯一解（克拉默法则适用）',
            '$\\bar r=r<n$：无穷多解，通解 = 特解 + 齐次通解，基础解系含 $n-r$ 个向量',
            '齐次方程组 $Ax=0$ 有非零解 ⟺ $r(A)<n$；只有零解 ⟺ $r(A)=n$',
            '基础解系中的向量数 = $n-r(A)$',
            '克拉默法则：系数行列式 $D\\neq0$ 时唯一解 $x_i=\\dfrac{D_i}{D}$'
          ].join('\n'), ['高频'])
        ]),
        sec('五、特征值与特征向量', [
          item('特征值与特征向量', [
            '特征方程：$|\\lambda E-A|=0$',
            '$$\\sum_{i=1}^{n}\\lambda_i=\\operatorname{tr}(A)\\ \\text{（迹）},\\qquad \\prod_{i=1}^{n}\\lambda_i=|A|$$',
            '转移：$A^{-1}$ 特征值 $\\lambda^{-1}$；$A^*$ 特征值 $\\frac{|A|}{\\lambda}$；$A^k$ 特征值 $\\lambda^k$；$f(A)$ 特征值 $f(\\lambda)$（同一特征向量）',
            'AB 与 BA 有相同的非零特征值'
          ].join('\n')),
          item('相似对角化', [
            '$A\\sim\\Lambda$ ⟺ $A$ 有 n 个线性无关特征向量 ⟺ 对每个特征值：几何重数 = 代数重数',
            '不同特征值对应特征向量必线性无关'
          ].join('\n')),
          item('实对称矩阵', [
            '特征值全为实数',
            '不同特征值对应的特征向量正交',
            '必可正交相似对角化：存在正交矩阵 $Q$，使 $Q^{-1}AQ=Q^{T}AQ=\\Lambda$',
            '步骤：求特征值 → 特征向量 → 施密特正交化 → 单位化 → 拼成 $Q$'
          ].join('\n'), ['高频'])
        ]),
        sec('六、二次型', [
          item('基本概念', [
            '矩阵表示：$f(x_1,\\cdots,x_n)=x^TAx$，$A$ 为实对称矩阵',
            '合同：存在可逆矩阵 $C$ 使 $B=C^{T}AC$，记 $A\\simeq B$；实对称矩阵：相似 ⟹ 合同，合同 ⇏ 相似',
            '惯性定理：正惯性指数 $p$、负惯性指数 $q$ 唯一',
            '化标准形：① 配方法（可逆线性变换）；② 正交变换法（特征值即标准形系数）'
          ].join('\n')),
          item('正定二次型（等价条件）', [
            '1. 顺序主子式全 > 0',
            '2. 特征值全 > 0',
            '3. 正惯性指数 = n（与 E 合同）',
            '4. 存在可逆 C 使 $A=C^{T}C$',
            '5. 对任意 $x\\neq0$ 恒有 $x^{T}Ax>0$',
            '半正定：所有主子式 ≥ 0'
          ].join('\n'), ['高频', '易错'])
        ])
      ])
    ],
    tips: [
      '等价无穷小只能在乘除因子中替换，加减中须谨慎（除非验证更高阶）',
      '洛必达前必须先验证 0/0 或 ∞/∞ 未定式',
      '变上限积分求导注意被积函数含 x 时要先换元把 x 移出积分号',
      '华里士公式只能用于 0 到 π/2 区间',
      '微分方程特解中 x^k 的 k 由"λ 是否特征根、是几重根"决定，最容易丢分',
      '旋转体体积绕 x 轴用垫圈法 $\\pi\\int y^2 dx$，绕 y 轴柱壳法 $2\\pi\\int xy\\,dx$，别混',
      '$|A^*|=|A|^{n-1}$ 与 $r(A^*)$ 分段结论配套记忆',
      '特征值性质 $\\sum\\lambda=\\text{tr}(A)$ 常用来快速求缺失特征值',
      '正定判定：顺序主子式（不是所有主子式）全 > 0',
      '实对称矩阵不同特征值特征向量正交，重根要"施密特"正交化'
    ],
    cardGroups: [
      {
        name: '极限与连续',
        cards: [
          { q: '写出两个重要极限。', a: '$\\lim\\limits_{x\\to0}\\dfrac{\\sin x}{x}=1$；$\\lim\\limits_{x\\to\\infty}\\left(1+\\dfrac{1}{x}\\right)^{x}=e$（等价形式 $\\lim\\limits_{x\\to0}(1+x)^{1/x}=e$）。' },
          { q: '写出 $x\\to0$ 时与 x 等价的六个基本无穷小。', a: '$\\sin x\\sim x$，$\\tan x\\sim x$，$\\arcsin x\\sim x$，$\\arctan x\\sim x$，$\\ln(1+x)\\sim x$，$e^{x}-1\\sim x$。' },
          { q: '$1-\\cos x$ 与 $(1+x)^{\\alpha}-1$ 在 $x\\to0$ 时分别等价于什么？', a: '$1-\\cos x\\sim\\dfrac{1}{2}x^{2}$；$(1+x)^{\\alpha}-1\\sim\\alpha x$。' },
          { q: '$x\\to0$ 时，$x-\\sin x$、$\\tan x-x$、$\\tan x-\\sin x$ 分别等价于什么？', a: '$x-\\sin x\\sim\\dfrac{x^{3}}{6}$；$\\tan x-x\\sim\\dfrac{x^{3}}{3}$；$\\tan x-\\sin x\\sim\\dfrac{x^{3}}{2}$。' },
          { q: '间断点分为哪几类？各自特征是什么？', a: '可去（左右极限存在且相等，但不等于函数值或无定义）；跳跃（左右极限存在但不相等）；无穷（极限为 ∞）；振荡（极限不存在且非 ∞）。' },
          { q: '闭区间上连续函数的四大性质是什么？', a: '有界性、最值定理、介值定理、零点定理。' }
        ]
      },
      {
        name: '导数与微分',
        cards: [
          { q: '写出 $\\arcsin x$、$\\arctan x$、$\\tan x$ 的导数。', a: '$(\\arcsin x)\'=\\dfrac{1}{\\sqrt{1-x^{2}}}$；$(\\arctan x)\'=\\dfrac{1}{1+x^{2}}$；$(\\tan x)\'=\\sec^{2}x$。' },
          { q: '写出 $\\sec x$、$\\csc x$ 的导数。', a: '$(\\sec x)\'=\\sec x\\tan x$；$(\\csc x)\'=-\\csc x\\cot x$。' },
          { q: '参数方程 $\\begin{cases}x=x(t)\\\\y=y(t)\\end{cases}$ 的导数 $\\dfrac{dy}{dx}$ 如何求？', a: '$\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}$（二阶导 $\\dfrac{d^{2}y}{dx^{2}}=\\dfrac{d}{dt}\\left(\\dfrac{dy}{dx}\\right)\\Big/\\dfrac{dx}{dt}$）。' },
          { q: '莱布尼茨公式 n 阶导数形式是什么？', a: '$(uv)^{(n)}=\\displaystyle\\sum_{k=0}^{n}C_{n}^{k}\\,u^{(k)}v^{(n-k)}$。' }
        ]
      },
      {
        name: '微分中值定理与泰勒',
        cards: [
          { q: '罗尔定理的三个条件与结论？', a: '[a,b] 连续、(a,b) 可导、f(a)=f(b) ⟹ 存在 $\\xi\\in(a,b)$ 使 $f\'(\\xi)=0$。' },
          { q: '拉格朗日中值定理结论？', a: '连续+可导 ⟹ $f(b)-f(a)=f\'(\\xi)(b-a)$，即存在中间点斜率等于割线斜率。' },
          { q: '写出常用麦克劳林展开：$e^{x}$、$\\ln(1+x)$、$(1+x)^{\\alpha}$ 的展开式。', a: '$e^{x}=1+x+\\dfrac{x^{2}}{2!}+\\cdots+\\dfrac{x^{n}}{n!}+o(x^{n})$；$\\ln(1+x)=x-\\dfrac{x^{2}}{2}+\\dfrac{x^{3}}{3}-\\cdots$；$(1+x)^{\\alpha}=1+\\alpha x+\\dfrac{\\alpha(\\alpha-1)}{2!}x^{2}+\\cdots$。' },
          { q: '写出 $\\sin x$、$\\cos x$ 的麦克劳林展开前几项。', a: '$\\sin x=x-\\dfrac{x^{3}}{3!}+\\dfrac{x^{5}}{5!}-\\cdots$；$\\cos x=1-\\dfrac{x^{2}}{2!}+\\dfrac{x^{4}}{4!}-\\cdots$。' }
        ]
      },
      {
        name: '导数的应用',
        cards: [
          { q: '极值的二阶充分条件？', a: '$f\'(x_{0})=0$ 时：$f\'\'(x_{0})<0$ ⟹ 极大值；$f\'\'(x_{0})>0$ ⟹ 极小值；$f\'\'(x_{0})=0$ 改用一阶导变号判别。' },
          { q: '函数凹凸性与 f′、f″ 的关系？', a: 'f″>0 ⟹ 凹（下凸，切线在曲线下方）；f″<0 ⟹ 凸；拐点处 f″=0 或不存在且 f″ 在该点两侧变号。' },
          { q: '求斜渐近线 y=kx+b 的公式？', a: '$k=\\lim\\limits_{x\\to\\infty}\\dfrac{f(x)}{x}$（有限），$b=\\lim\\limits_{x\\to\\infty}\\big[f(x)-kx\\big]$（有限）。水平渐近线是 k=0 的特例。' },
          { q: '曲率公式？', a: '$K=\\dfrac{|y\'\'|}{(1+y\'^{2})^{3/2}}$，曲率半径 $R=\\dfrac{1}{K}$。' }
        ]
      },
      {
        name: '积分',
        cards: [
          { q: '$\\int\\sec x\\,dx$、$\\int\\tan x\\,dx$、$\\int\\cot x\\,dx$ 的结果？', a: '$\\int\\sec x\\,dx=\\ln|\\sec x+\\tan x|+C$；$\\int\\tan x\\,dx=-\\ln|\\cos x|+C$；$\\int\\cot x\\,dx=\\ln|\\sin x|+C$。' },
          { q: '$\\int\\frac{dx}{x^{2}+a^{2}}$、$\\int\\frac{dx}{\\sqrt{a^{2}-x^{2}}}$、$\\int\\frac{dx}{\\sqrt{x^{2}\\pm a^{2}}}$ 的结果？', a: '$\\dfrac{1}{a}\\arctan\\dfrac{x}{a}+C$；$\\arcsin\\dfrac{x}{a}+C$；$\\ln|x+\\sqrt{x^{2}\\pm a^{2}}|+C$。' },
          { q: '分部积分公式？选 u 的优先级口诀？', a: '$\\int u\\,dv=uv-\\int v\\,du$；口诀"反对幂指三"（三角函数、指数优先作 dv）。' },
          { q: '华里士公式（点火公式）写出来？', a: '$\\int_{0}^{\\pi/2}\\sin^{n}x\\,dx=\\int_{0}^{\\pi/2}\\cos^{n}x\\,dx=\\begin{cases}\\dfrac{(n-1)!!}{n!!}\\cdot\\dfrac{\\pi}{2},&n\\text{偶}\\\\\\dfrac{(n-1)!!}{n!!},&n\\text{奇}\\end{cases}$' },
          { q: '变上限积分求导公式？', a: '$\\dfrac{d}{dx}\\int_{a}^{\\varphi(x)}f(t)\\,dt=f(\\varphi(x))\\,\\varphi\'(x)$。' },
          { q: '奇函数、偶函数在对称区间 [-a,a] 上的定积分结论？', a: '奇函数 $\\int_{-a}^{a}f=0$；偶函数 $\\int_{-a}^{a}f=2\\int_{0}^{a}f$。' },
          { q: '区间再现公式？', a: '$\\int_{a}^{b}f(x)\\,dx=\\int_{a}^{b}f(a+b-x)\\,dx$。' },
          { q: '反常积分 $\\int_{1}^{+\\infty}\\frac{dx}{x^{p}}$ 与 $\\int_{0}^{1}\\frac{dx}{x^{p}}$ 的收敛条件？', a: '无穷限 $p>1$ 收敛；瑕积分（0 点）$p<1$ 收敛。' },
          { q: '旋转体体积：绕 x 轴与绕 y 轴（柱壳法）的公式？', a: '绕 x 轴 $V=\\pi\\int_{a}^{b}y^{2}dx=\\pi\\int_{a}^{b}f(x)^{2}dx$；绕 y 轴 $V=2\\pi\\int_{a}^{b}xy\\,dx=2\\pi\\int_{a}^{b}xf(x)\\,dx$。' },
          { q: '平面曲线 y=f(x) 在 [a,b] 上的弧长公式？', a: '$s=\\int_{a}^{b}\\sqrt{1+y\'^{2}}\\,dx$。' }
        ]
      },
      {
        name: '微分方程',
        cards: [
          { q: '一阶线性微分方程 $y\'+P(x)y=Q(x)$ 的通解公式？', a: '$y=e^{-\\int P(x)dx}\\left[\\int Q(x)e^{\\int P(x)dx}dx+C\\right]$。' },
          { q: '二阶常系数齐次方程的特征根对应通解（三种情形）？', a: '不等实根 $C_{1}e^{r_{1}x}+C_{2}e^{r_{2}x}$；二重根 $(C_{1}+C_{2}x)e^{rx}$；共轭复根 $\\alpha\\pm\\beta i$：$e^{\\alpha x}(C_{1}\\cos\\beta x+C_{2}\\sin\\beta x)$。' },
          { q: '$y\'\'+py\'+qy=e^{\\lambda x}P_{m}(x)$ 的特解应设为什么形式？', a: '$y^{*}=x^{k}e^{\\lambda x}Q_{m}(x)$，其中 $Q_{m}$ 是与 $P_{m}$ 同次多项式，$k$ 为 λ 作为特征根的重数（0/1/2）。' }
        ]
      },
      {
        name: '多元函数与二重积分',
        cards: [
          { q: '二元函数无条件极值的 AC−B² 判别法？', a: '驻点处 $A=f_{xx},B=f_{xy},C=f_{yy}$：$AC-B^{2}>0$ 且 $A<0$ 极大、$A>0$ 极小；$AC-B^{2}<0$ 非极值；$=0$ 另判。' },
          { q: '二重积分极坐标变换公式？', a: '$x=r\\cos\\theta$，$y=r\\sin\\theta$，$dx\\,dy=r\\,dr\\,d\\theta$；含 $x^{2}+y^{2}$ 或圆域优先用极坐标。' },
          { q: '拉格朗日乘数法求解条件极值的步骤？', a: '构造 $L=f(x,y)+\\lambda\\varphi(x,y)$，解 $\\begin{cases}L_{x}=0\\\\L_{y}=0\\\\\\varphi=0\\end{cases}$ 求出驻点，再代入实际问题判定。' }
        ]
      },
      {
        name: '行列式与矩阵',
        cards: [
          { q: '$|AB|,\\ |A^{T}|,\\ |kA|,\\ |A^{-1}|,\\ |A^{*}|$ 与 $|A|$ 的关系？', a: '$|AB|=|A||B|$；$|A^{T}|=|A|$；$|kA|=k^{n}|A|$；$|A^{-1}|=\\dfrac{1}{|A|}$；$|A^{*}|=|A|^{n-1}$。' },
          { q: '伴随矩阵基本关系式？$(A^{*})^{*}$？', a: '$AA^{*}=A^{*}A=|A|E$；$(A^{*})^{*}=|A|^{n-2}A\\ (n\\ge2)$。' },
          { q: '$r(A^{*})$ 与 $r(A)$ 的分段关系？', a: '$r(A)=n\\Rightarrow r(A^{*})=n$；$r(A)=n-1\\Rightarrow r(A^{*})=1$；$r(A)<n-1\\Rightarrow r(A^{*})=0$。' },
          { q: '矩阵秩的几个常用不等式？', a: '$r(AB)\\le\\min\\{r(A),r(B)\\}$；$r(A+B)\\le r(A)+r(B)$；$r(A)+r(B)-n\\le r(AB)$（西尔维斯特）。' }
        ]
      },
      {
        name: '向量与方程组',
        cards: [
          { q: '$\\beta$ 能由向量组 $\\alpha_{1},\\cdots,\\alpha_{s}$ 线性表示的充要条件（用秩表达）？', a: '$r(\\alpha_{1},\\cdots,\\alpha_{s},\\beta)=r(\\alpha_{1},\\cdots,\\alpha_{s})$。' },
          { q: '非齐次方程组 $Ax=b$ 无解、唯一解、无穷多解的秩条件？（A 为 m×n，$r=r(A)$）', a: '$\\bar r>r$ 无解；$\\bar r=r=n$ 唯一解；$\\bar r=r<n$ 无穷多解，基础解系含 $n-r$ 个向量。' },
          { q: '基础解系中向量个数？', a: '$n-r(A)$ 个（未知量个数 − 系数矩阵秩）。' },
          { q: '施密特正交化公式（两个向量情形）？', a: '$\\beta_{1}=\\alpha_{1}$，$\\beta_{2}=\\alpha_{2}-\\dfrac{(\\alpha_{2},\\beta_{1})}{(\\beta_{1},\\beta_{1})}\\beta_{1}$，再各自单位化。' }
        ]
      },
      {
        name: '特征值与二次型',
        cards: [
          { q: '特征值的两个基本性质？', a: '$\\sum\\lambda_{i}=\\operatorname{tr}(A)$；$\\prod\\lambda_{i}=|A|$。' },
          { q: '$A^{-1}$、$A^{*}$、$A^{k}$ 的特征值分别是什么？', a: '$\\lambda^{-1}$、$\\dfrac{|A|}{\\lambda}$、$\\lambda^{k}$（对应同一特征向量）。' },
          { q: 'n 阶矩阵 A 可相似对角化的充要条件？', a: 'A 有 n 个线性无关特征向量 ⟺ 每个特征值的几何重数（无关特征向量数）= 代数重数（特征根重数）。' },
          { q: '实对称矩阵的三个重要性质？', a: '特征值全为实数；不同特征值对应特征向量正交；必可正交对角化（存在正交矩阵 Q 使 $Q^{T}AQ=\\Lambda$）。' },
          { q: '二次型正定的等价判定条件（至少 3 个）？', a: '① 顺序主子式全 > 0；② 特征值全 > 0；③ 正惯性指数 = n；④ 存在可逆 C 使 $A=C^{T}C$；⑤ $\\forall x\\neq0$，$x^{T}Ax>0$。' },
          { q: '正定二次型的矩阵 A 与单位矩阵有什么关系？相似与合同的关系？', a: 'A 与 E 合同（$A\\simeq E$）；实对称矩阵相似 ⟹ 合同，但合同不一定相似。' }
        ]
      }
    ]
  },
  {
    id: 'gaoshu-18-lectures',
    name: '高等数学十八讲',
    subtitle: '参考清华孝哥《高数十八讲》总结框架整理 · 数二范围第1~15讲',
    icon: '📕',
    color: '#16A085',
    parts: [
      {
        name: '一、极限与连续（第1~2讲）',
        sections: [
          sec('第1讲 函数、极限与连续', [
            item('函数三要素与四大性质', [
              '三要素：定义域、对应法则、值域（两函数等价 ⟺ 前两者相同）',
              '奇偶性：奇函数 $f(-x)=-f(x)$、偶函数 $f(-x)=f(x)$；奇×奇=偶、偶×偶=偶、奇×偶=奇',
              '周期性：$f(x+T)=f(x)$；单调性：定义法或求导法判定',
              '有界性：$|f(x)|\\le M$；闭区间上连续的函数必有界'
            ].join('\n')),
            item('极限的定义与性质', [
              '$\\varepsilon$-$\\delta$ 语言定义 $\\lim_{x\\to x_0}f(x)=A$；数列对应 $\\varepsilon$-$N$ 语言',
              '性质：唯一性、局部有界性、局部保号性',
              '四则运算法则成立的前提是各极限存在；复合运算外函数连续时极限可内移',
              '$\\lim_{x\\to x_0}f(x)$ 存在 ⟺ 左右极限存在且相等（分段点、绝对值点必查）'
            ].join('\n')),
            item('极限计算三板斧（等价代换 / 洛必达 / 泰勒）', [
              '等价无穷小（$x\\to0$）：$\\sin x\\sim x$，$\\tan x\\sim x$，$\\arcsin x\\sim x$，$\\arctan x\\sim x$，$\\ln(1+x)\\sim x$，$e^x-1\\sim x$，$1-\\cos x\\sim \\frac{x^2}{2}$，$(1+x)^{\\alpha}-1\\sim\\alpha x$',
              '洛必达法则：仅限 $\\frac{0}{0}$ 或 $\\frac{\\infty}{\\infty}$ 型，先验证再使用，可重复',
              '泰勒展开：$e^x,\\sin x,\\cos x,\\ln(1+x),(1+x)^{\\alpha}$ 五个基本展开能解决绝大多数未定式',
              '七种未定式：$\\frac{0}{0}$、$\\frac{\\infty}{\\infty}$、$0\\cdot\\infty$、$\\infty-\\infty$、$1^{\\infty}$、$0^0$、$\\infty^0$；幂指函数一律 $u^v=e^{v\\ln u}$'
            ].join('\n'), ['高频']),
            item('连续与间断', [
              '连续定义：$\\lim_{x\\to x_0}f(x)=f(x_0)$；左连续 + 右连续 ⟺ 连续',
              '间断点分类：第一类（可去、跳跃）/ 第二类（无穷、振荡）',
              '闭区间连续函数：有界性定理、最值定理、介值定理、零点定理'
            ].join('\n'))
          ]),
          sec('第2讲 数列极限', [
            item('数列极限定义与性质', [
              '$\\varepsilon$-$N$ 语言；收敛数列必有界、极限唯一',
              '子列：收敛数列的任何子列收敛于同一极限',
              '证发散的常用手段：找到两个收敛于不同极限的子列，或证明无界'
            ].join('\n')),
            item('单调有界准则（递推数列）', [
              '单调递增有上界 ⟹ 收敛；单调递减有下界 ⟹ 收敛',
              '递推型 $x_{n+1}=f(x_n)$：先证单调（作差或作比）再证有界，设极限为 $a$，对递推式两边取极限解方程',
              '常见模型：$\\ln(1+x_n)$、$\\sqrt{2+x_n}$、均值型递推'
            ].join('\n'), ['高频']),
            item('夹逼准则与定积分定义', [
              '夹逼：$y_n\\le x_n\\le z_n$ 且两侧同极限 ⟹ $x_n$ 收敛于同极限',
              '典型夹逼：$\\sum$ 或连乘含 $n$ 项且分子分母同阶',
              '定积分定义：$\\lim_{n\\to\\infty}\\frac{1}{n}\\sum_{k=1}^{n}f\\left(\\frac{k}{n}\\right)=\\int_0^1 f(x)\\,dx$（求和—定积分互转）'
            ].join('\n'), ['高频'])
          ])
        ]
      },
      {
        name: '二、一元函数微分学（第3~7讲）',
        sections: [
          sec('第3讲 一元函数微分学的概念', [
            item('导数与微分的定义', [
              '$f\'(x_0)=\\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}=\\lim_{x\\to x_0}\\frac{f(x)-f(x_0)}{x-x_0}$',
              '左导数 = 右导数 ⟺ 可导',
              '几何意义：切线斜率 $k=f\'(x_0)$；切线方程 $y-y_0=f\'(x_0)(x-x_0)$',
              '微分：$dy=f\'(x_0)\\Delta x=f\'(x_0)dx$（增量线性主部）'
            ].join('\n')),
            item('可导、可微、连续的关系', [
              '一元函数：可导 ⟺ 可微；可导 ⟹ 连续；连续 $\\nRightarrow$ 可导（如 $y=|x|$ 在原点）',
              '连续但不可导的典型：尖点、切线垂直于 x 轴的点（$f\'(x_0)=\\infty$）',
              '判定抽象函数可导性必须回到定义，不能直接用求导法则'
            ].join('\n')),
            item('导数定义的考点形式', [
              '分式极限：$\\lim_{h\\to0}\\frac{f(x_0+ah)-f(x_0+bh)}{h}=(a-b)f\'(x_0)$（$f$ 在 $x_0$ 可导时）',
              '函数在一点可导的考题：构造 $f(x_0+h)-f(x_0)$ 的比式极限',
              '分段函数分段点可导性：先验证连续，再分别求左右导数'
            ].join('\n'))
          ]),
          sec('第4讲 一元函数微分学的计算', [
            item('求导公式与法则（速记）', [
              '基本导数表：幂 $\\mu x^{\\mu-1}$、指数 $a^x\\ln a$、对数 $\\frac{1}{x\\ln a}$、三角与反三角',
              '四则：$(uv)\'=u\'v+uv\'$；$\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}$',
              '复合链式：$\\frac{dy}{dx}=\\frac{dy}{du}\\cdot\\frac{du}{dx}$（层层求导）'
            ].join('\n')),
            item('五类题型求导法', [
              '复合函数：由外到内逐层求导相乘',
              '隐函数：方程两端对 x 求导，把 y 看作 x 的函数，解出 $y\'$',
              '参数方程：$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}$；二阶 $\\frac{d^2y}{dx^2}=\\left.\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)\\middle/\\frac{dx}{dt}\\right.$',
              '对数求导法：连乘连除、幂指函数 $y=u(x)^{v(x)}$ 先取对数再求导',
              '反函数求导：$\\frac{dy}{dx}=\\frac{1}{dx/dy}$'
            ].join('\n')),
            item('高阶导数', [
              '莱布尼茨公式：$(uv)^{(n)}=\\sum_{k=0}^{n}C_n^k\\,u^{(k)}v^{(n-k)}$',
              '常用公式：$(\\sin x)^{(n)}=\\sin\\left(x+\\frac{n\\pi}{2}\\right)$，$(e^{ax})^{(n)}=a^n e^{ax}$，$(\\ln x)^{(n)}=\\frac{(-1)^{n-1}(n-1)!}{x^n}$',
              '泰勒展开法：$f^{(n)}(0)=n!\\cdot a_n$（展开式中 $x^n$ 的系数）'
            ].join('\n'))
          ]),
          sec('第5讲 微分学的应用（一）——几何应用', [
            item('单调性、极值、最值', [
              '极值必要条件：$f\'(x_0)=0$ 或 $f\'(x_0)$ 不存在（驻点 + 不可导点）',
              '一阶判别法（极值第一充分条件）：左右导数变号',
              '二阶判别法：$f\'(x_0)=0$ 且 $f\'\'(x_0)>0$ 极小、$f\'\'(x_0)<0$ 极大',
              '闭区间最值 = 比较（驻点、不可导点、端点）的函数值'
            ].join('\n')),
            item('凹凸性与拐点', [
              '$f\'\'(x)>0$ 凹（下凸）、$f\'\'(x)<0$ 凸（上凸）',
              '拐点：$f\'\'(x_0)=0$（或不存在）且两侧 $f\'\'$ 变号',
              '凹凸变换点即拐点，注意不可导点也可能为拐点'
            ].join('\n')),
            item('渐近线与曲率', [
              '水平渐近线：$\\lim_{x\\to\\pm\\infty}f(x)=A$；铅直渐近线：$\\lim_{x\\to x_0^\\pm}f(x)=\\infty$',
              '斜渐近线：$k=\\lim_{x\\to\\infty}\\frac{f(x)}{x}$，$b=\\lim_{x\\to\\infty}[f(x)-kx]$',
              '曲率：$K=\\frac{|y\'\'|}{(1+y\'^2)^{3/2}}$，曲率半径 $R=\\frac{1}{K}$'
            ].join('\n'))
          ]),
          sec('第6讲 微分学的应用（二）——中值定理、微分等式与微分不等式', [
            item('三大中值定理与泰勒中值', [
              '罗尔：[a,b] 连续 + (a,b) 可导 + $f(a)=f(b)$ ⟹ $\\exists\\xi$ 使 $f\'(\\xi)=0$',
              '拉格朗日：$f(b)-f(a)=f\'(\\xi)(b-a)$',
              '柯西：$\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f\'(\\xi)}{g\'(\\xi)}$',
              '泰勒中值定理（带拉格朗日余项）：联系 $f$ 与 $f^{(n)}$ 的工具'
            ].join('\n')),
            item('微分等式证明框架（证明存在 ξ 使 F(ξ, ξ\')=0）', [
              '目标式移项、变形，凑成一个函数 $G(x)$ 的导数',
              '经典构造：$f\'(x)+kf(x)=0$ ⟹ $G(x)=e^{kx}f(x)$；$f\'(x)\\cdot g(x)+f(x)g\'(x)=0$ ⟹ $G(x)=f(x)g(x)$',
              '验证 $G(x)$ 在区间端点等值 ⟹ 罗尔定理直接得证',
              '多个中值的题：整体用柯西或分区间两次拉格朗日'
            ].join('\n'), ['高频']),
            item('微分不等式证明的四种武器', [
              '移项构造函数 + 单调性（最常见）',
              '拉格朗日中值定理直接估计 $f(b)-f(a)$',
              '泰勒展开 + 余项符号判断',
              '柯西中值定理处理分式型不等式'
            ].join('\n'))
          ]),
          sec('第7讲 微分学的应用（三）——物理应用与经济应用', [
            item('相关变化率与最优化', [
              '相关变化率：找出几何或物理关系式 → 对时间 t 求导 → 代入已知时刻数据',
              '最优化问题：建立目标函数 → 求导找驻点 → 判定极值 → 回答实际意义'
            ].join('\n')),
            item('经济应用（数二了解，数三为主）', [
              '边际函数：边际收益 $R\'(q)$、边际成本 $C\'(q)$、边际利润 $L\'(q)=R\'(q)-C\'(q)$',
              '需求价格弹性：$E=\\frac{p}{Q}\\frac{dQ}{dp}$',
              '最大利润条件：$R\'(q)=C\'(q)$（边际收益 = 边际成本）'
            ].join('\n'))
          ])
        ]
      },
      {
        name: '三、一元函数积分学（第8~12讲）',
        sections: [
          sec('第8讲 一元函数积分学的概念与性质', [
            item('定积分定义', [
              '四步曲：分割、近似、求和、取极限',
              '$\\int_a^b f(x)\\,dx=\\lim_{\\lambda\\to0}\\sum_{i=1}^{n}f(\\xi_i)\\Delta x_i$',
              '几何意义：曲边梯形面积的代数和',
              '可积性：连续 ⟹ 可积；只有有限个第一类间断 ⟹ 可积；无界必不可积'
            ].join('\n')),
            item('定积分基本性质', [
              '线性、区间可加性、保号性、估值定理',
              '奇偶性：对称区间上奇函数积分为 0、偶函数为半区间 2 倍',
              '周期性：$\\int_a^{a+T}f(x)\\,dx=\\int_0^T f(x)\\,dx$',
              '积分中值定理：$\\exists\\xi\\in[a,b]$ 使 $\\int_a^b f(x)\\,dx=f(\\xi)(b-a)$'
            ].join('\n')),
            item('变上限积分函数', [
              '$F(x)=\\int_a^x f(t)\\,dt$ ⟹ $F\'(x)=f(x)$（$f$ 连续时）',
              '复合型：$\\frac{d}{dx}\\int_a^{\\varphi(x)}f(t)\\,dt=f(\\varphi(x))\\varphi\'(x)$',
              '连续函数的原函数必存在，变上限积分即其统一构造'
            ].join('\n'), ['高频'])
          ]),
          sec('第9讲 一元函数积分学的计算', [
            item('不定积分三大方法', [
              '基本公式表：幂、指、对、三角、反三角及凑微分常见的恒等变形',
              '换元法：第一类（凑微分）；第二类（三角代换、根式代换、倒代换）',
              '分部积分：$\\int u\\,dv=uv-\\int v\\,du$，u 的优先顺序"反对幂三指"'
            ].join('\n')),
            item('定积分计算技巧', [
              '牛顿-莱布尼茨公式：$\\int_a^b f(x)\\,dx=F(b)-F(a)$',
              '对称区间先看奇偶性；周期函数化归基本周期段',
              '对称公式：$\\int_0^{\\pi}x f(\\sin x)\\,dx=\\frac{\\pi}{2}\\int_0^{\\pi}f(\\sin x)\\,dx$',
              '华里士（点火）公式：$\\int_0^{\\pi/2}\\sin^n x\\,dx=\\int_0^{\\pi/2}\\cos^n x\\,dx=\\begin{cases}\\frac{(n-1)!!}{n!!}\\cdot\\frac{\\pi}{2},&n\\text{ 偶}\\\\ \\frac{(n-1)!!}{n!!},&n\\text{ 奇}\\end{cases}$'
            ].join('\n'), ['高频']),
            item('反常积分', [
              '两类：无穷区间积分、无界函数（瑕积分）',
              '收敛判别：比较判别法、极限比较判别法',
              'p-判别：$\\int_1^{+\\infty}\\frac{dx}{x^p}$ 收敛 ⟺ $p>1$；$\\int_0^1\\frac{dx}{x^p}$ 收敛 ⟺ $p<1$'
            ].join('\n'))
          ]),
          sec('第10讲 积分学的应用（一）——几何应用', [
            item('平面图形面积', [
              '直角坐标：$S=\\int_a^b|f(x)-g(x)|\\,dx$',
              '极坐标：$S=\\frac{1}{2}\\int_{\\alpha}^{\\beta}r^2(\\theta)\\,d\\theta$',
              '参数方程：$S=\\int_{\\alpha}^{\\beta}y(t)\\,x\'(t)\\,dt$（注意方向与符号）'
            ].join('\n')),
            item('旋转体体积', [
              '绕 x 轴（垫片法）：$V=\\pi\\int_a^b f^2(x)\\,dx$',
              '绕 y 轴（壳法）：$V=2\\pi\\int_a^b x f(x)\\,dx$',
              '截面法一般化：$V=\\int A(x)\\,dx$（A(x) 为截面面积）'
            ].join('\n'), ['高频']),
            item('弧长与旋转曲面侧面积', [
              '直角坐标弧长：$s=\\int_a^b\\sqrt{1+y\'^2}\\,dx$',
              '参数方程弧长：$s=\\int_{\\alpha}^{\\beta}\\sqrt{x\'^2+y\'^2}\\,dt$',
              '极坐标弧长：$s=\\int_{\\alpha}^{\\beta}\\sqrt{r^2+r\'^2}\\,d\\theta$',
              '旋转曲面侧面积：$S=2\\pi\\int_a^b f(x)\\sqrt{1+f\'^2}\\,dx$（了解）'
            ].join('\n'))
          ]),
          sec('第11讲 积分学的应用（二）——积分等式与积分不等式', [
            item('积分等式证明五招', [
              '直接计算：分部积分 / 换元把两边化成同一形式',
              '积分中值定理（f 连续时）',
              '变量替换：u=a+b-x 类镜像代换',
              '灵活使用周期性与奇偶性',
              '对已知等式求导 / 两边求导还原函数'
            ].join('\n')),
            item('积分不等式证明', [
              '估值定理 + 被积函数单调性放缩',
              '绝对值不等式：$\\left|\\int_a^b f\\right|\\le\\int_a^b|f|$',
              '柯西-施瓦茨不等式：$\\left(\\int_a^b fg\\right)^2\\le\\int_a^b f^2\\cdot\\int_a^b g^2$',
              '构造变上限函数，用导数单调性证'
            ].join('\n')),
            item('积分中值定理的推广', [
              '第一积分中值定理：$\\int_a^b f(x)g(x)\\,dx=f(\\xi)\\int_a^b g(x)\\,dx$（$g(x)$ 不变号）',
              '推广形式常与放缩、极限结合，用于证明含积分的等式与不等式'
            ].join('\n'))
          ]),
          sec('第12讲 积分学的应用（三）——物理应用与经济应用', [
            item('物理应用（数二考纲要求部分）', [
              '变力做功：$W=\\int_a^b F(x)\\,dx$',
              '抽水做功：$W=\\int_a^b \\rho g\\,A(x)\\,x\\,dx$（x 为提升高度）',
              '侧压力：$P=\\int_a^b \\rho g\\,x\\cdot l(x)\\,dx$（x 为深度，l(x) 为宽度）',
              '质心（形心）：$\\bar x=\\frac{\\int_a^b x f(x)\\,dx}{\\int_a^b f(x)\\,dx}$'
            ].join('\n'), ['高频']),
            item('经济应用（数三为主，数二了解）', [
              '由边际函数反推总量：$R(q)=\\int_0^q R\'(x)\\,dx$',
              '消费者剩余 / 生产者剩余的几何意义（曲线与价格线围成面积）'
            ].join('\n'))
          ])
        ]
      },
      {
        name: '四、多元函数与微分方程（第13~15讲）',
        sections: [
          sec('第13讲 多元函数微分学', [
            item('偏导数、全微分、可微', [
              '$f_x(x_0,y_0)=\\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x,y_0)-f(x_0,y_0)}{\\Delta x}$',
              '全微分：$dz=f_x\\,dx+f_y\\,dy$',
              '关系链：偏导数连续 ⟹ 可微 ⟹ 连续；可微 ⟹ 偏导数存在（反之均不成立）'
            ].join('\n')),
            item('复合函数求导（链式法则）', [
              '$z=f(u,v)$，$u=u(x,y)$，$v=v(x,y)$：$z_x=f_u\\cdot u_x+f_v\\cdot v_x$',
              '抽象函数记法：$f_1\'$ 表示对第一个中间变量求偏导',
              '中间变量只有单变量时得全导数：$\\frac{dz}{dx}=f_u\\frac{du}{dx}+f_v\\frac{dv}{dx}$'
            ].join('\n'), ['高频']),
            item('隐函数求导', [
              '$F(x,y,z)=0$ 确定 $z=z(x,y)$：两边对 x 求偏导得 $F_x+F_z z_x=0$，从而 $z_x=-\\frac{F_x}{F_z}$',
              '方程组确定的隐函数用微分法联立求解'
            ].join('\n')),
            item('无条件极值与条件极值', [
              '驻点：$f_x=0$，$f_y=0$；配合 $AC-B^2$ 判别法（$A=f_{xx}$，$B=f_{xy}$，$C=f_{yy}$）',
              '$AC-B^2>0$ 且 $A>0$ 极小、$A<0$ 极大；$AC-B^2<0$ 非极值；$=0$ 另判',
              '条件极值：拉格朗日乘数法 $L=f(x,y)+\\lambda\\varphi(x,y)$'
            ].join('\n'), ['高频'])
          ]),
          sec('第14讲 二重积分', [
            item('概念与性质', [
              '$\\iint_D f(x,y)\\,d\\sigma=\\lim_{\\lambda\\to0}\\sum_{i=1}^{n}f(\\xi_i,\\eta_i)\\Delta\\sigma_i$',
              '线性、区域可加性、保号性、二重积分中值定理',
              '对称性：D 关于 y 轴对称时看 x 的奇偶性，关于 x 轴对称时看 y 的奇偶性（奇零偶倍）'
            ].join('\n')),
            item('直角坐标计算', [
              'X 型：$\\iint_D f\\,dxdy=\\int_a^b dx\\int_{\\varphi_1(x)}^{\\varphi_2(x)}f(x,y)\\,dy$',
              'Y 型：$\\iint_D f\\,dxdy=\\int_c^d dy\\int_{\\psi_1(y)}^{\\psi_2(y)}f(x,y)\\,dx$',
              '选择标准：积分区间表达简单、内层原函数好求；务必先画积分区域'
            ].join('\n')),
            item('极坐标计算', [
              '$x=r\\cos\\theta$，$y=r\\sin\\theta$，$d\\sigma=r\\,dr\\,d\\theta$',
              '先定 $\\theta$（射线扫过的范围），再定 $r$（沿射线穿入穿出）',
              '圆域、被积函数含 $x^2+y^2$ 或 $\\sqrt{x^2+y^2}$ 优先极坐标'
            ].join('\n'), ['高频']),
            item('对称性与应用', [
              '轮换对称：区域关于直线 $y=x$ 对称时 $\\iint_D f(x,y)=\\iint_D f(y,x)$',
              '应用：区域面积 $A=\\iint_D 1\\,d\\sigma$；形心 $\\bar x=\\frac{1}{A}\\iint_D x\\,d\\sigma$，$\\bar y=\\frac{1}{A}\\iint_D y\\,d\\sigma$'
            ].join('\n'))
          ]),
          sec('第15讲 微分方程', [
            item('一阶方程', [
              '可分离变量：$\\frac{dy}{dx}=f(x)g(y)$，分离后两边积分',
              '齐次方程：$\\frac{dy}{dx}=\\varphi\\left(\\frac{y}{x}\\right)$，令 $u=\\frac{y}{x}$ 化可分离',
              '一阶线性：$y\'+P(x)y=Q(x)$ ⟹ $y=e^{-\\int P\\,dx}\\left(\\int Q e^{\\int P\\,dx}\\,dx+C\\right)$',
              '伯努利方程：$y\'+P(x)y=Q(x)y^n$，令 $z=y^{1-n}$ 化一阶线性'
            ].join('\n'), ['高频']),
            item('可降阶方程', [
              '$y^{(n)}=f(x)$：逐次积分 n 次',
              '$y\'\'=f(x,y\')$（缺 y）：令 $p=y\'$，化为 p 的一阶方程',
              '$y\'\'=f(y,y\')$（缺 x）：令 $p=y\'$，$y\'\'=p\\frac{dp}{dy}$'
            ].join('\n')),
            item('二阶常系数线性方程', [
              '齐次：特征方程 $r^2+pr+q=0$；两异实根、重根、共轭复根对应三类通解',
              '非齐次通解 = 对应齐次通解 + 一个特解 $y^*$',
              '特解设法：$f(x)=e^{\\lambda x}P_m(x)$ 型设 $y^*=x^k e^{\\lambda x}Q_m(x)$，$k$ 等于 $\\lambda$ 作为特征根的重数',
              '$f(x)=e^{\\alpha x}[P_m\\cos\\beta x+Q_n\\sin\\beta x]$ 型设 $y^*=x^k e^{\\alpha x}[R_l\\cos\\beta x+S_l\\sin\\beta x]$'
            ].join('\n'), ['高频']),
            item('微分方程应用', [
              '几何问题：由切线斜率、法线、面积体积条件建立微分方程',
              '物理问题：运动过程、冷却定律、增长衰减模型',
              '由通解反求方程：对通解求导消去任意常数'
            ].join('\n'))
          ])
        ]
      }
    ],
    tips: [
      '极限题先判型再动手：等价无穷小只能整体替换乘除因子，加减因子慎用（需泰勒展开确认首项是否抵消）。',
      '幂指函数 $u^v$ 一律换底 $e^{v\\ln u}$ 处理，几乎可避开所有 $1^{\\infty}$ 型歧义。',
      '中值定理证明题选定理：两点函数值之差用拉格朗日，函数值的比用柯西，先验证端点等值再上罗尔。',
      '构造辅助函数万能思路：把要证的等式移项，尝试写成 $(e^{kx}F(x))\'$ 或 $(x^k F(x))\'$ 的导数形式。',
      '分部积分按“反对幂三指”排序：反三角、对数、幂、三角、指数，靠前者作 $u$ 更省力。',
      '二重积分计算三步骤：先画图 → 判对称化简 → 选坐标系（圆域 / 含 $x^2+y^2$ 用极坐标）再定限。',
      '二阶非齐次特解设法口诀：指数看 $\\lambda$ 是否特征根、多项式看重根次数，k 取重数后再待定系数。',
      '显式出现的抽象函数（表达式未知）一律用定义与性质思考，不盲目套学过的具体函数结论。'
    ],
    cardGroups: [
      {
        name: '极限与数列极限（第1~2讲）',
        cards: [
          { q: '等价无穷小代换中，加减因子可以直接替换吗？', a: '一般不可以。等价无穷小只能对乘除因子整体替换；加减项的消去需用泰勒展开判断首项是否抵消。' },
          { q: '七种未定式是哪些？幂指函数怎么处理？', a: '$\\frac{0}{0}$、$\\frac{\\infty}{\\infty}$、$0\\cdot\\infty$、$\\infty-\\infty$、$1^{\\infty}$、$0^0$、$\\infty^0$；幂指函数一律 $u^v=e^{v\\ln u}$。' },
          { q: '间断点如何分类？', a: '第一类（左右极限均存在）：可去（相等但≠函数值或无定义）、跳跃（不相等）；第二类：无穷、振荡。' },
          { q: '递推数列 $x_{n+1}=f(x_n)$ 求极限的经典流程？', a: '先证单调（作差/作比），再证有界；设极限为 a，对递推式两边取极限解方程（解得多个根时依赖单调性舍根）。' },
          { q: '含 n 项和的数列极限，两种通用处理？', a: '夹逼准则（各项同阶、有界可夹）；定积分定义 $\\lim\\frac{1}{n}\\sum f\\left(\\frac{k}{n}\\right)=\\int_0^1 f$。' }
        ]
      },
      {
        name: '一元函数微分学（第3~7讲）',
        cards: [
          { q: '一元函数可导、可微、连续的关系？', a: '可导 ⟺ 可微；可导 ⟹ 连续；但连续推不出可导（如 $y=|x|$ 在原点）。' },
          { q: '参数方程求二阶导？', a: '$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}$；$\\frac{d^2y}{dx^2}=\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)\\div\\frac{dx}{dt}$（先对 t 求导再除以 $\\frac{dx}{dt}$）。' },
          { q: '极值的二阶充分条件？', a: '$f\'(x_0)=0$ 且 $f\'\'(x_0)>0$ 极小、$f\'\'(x_0)<0$ 极大；$f\'\'(x_0)=0$ 时退化用一阶判别。' },
          { q: '拐点的判定？', a: '$f\'\'(x_0)=0$（或不存在）且 $x_0$ 两侧 $f\'\'$ 变号，则 $(x_0,f(x_0))$ 为拐点。' },
          { q: '证明存在 ξ 使 $f\'+kf=0$，辅助函数怎么构造？', a: '目标式乘 $e^{kx}$：设 $G(x)=e^{kx}f(x)$，则 $G\'(x)=e^{kx}(f\'+kf)$；G 两端等值时罗尔定理即证。' }
        ]
      },
      {
        name: '一元函数积分学（第8~12讲）',
        cards: [
          { q: '积分中值定理内容？', a: '$f$ 在 [a,b] 连续 ⟹ $\\exists\\xi\\in[a,b]$ 使 $\\int_a^b f(x)\\,dx=f(\\xi)(b-a)$。' },
          { q: '变上限积分求导公式？', a: '$\\frac{d}{dx}\\int_a^{\\varphi(x)} f(t)\\,dt=f(\\varphi(x))\\cdot\\varphi\'(x)$。' },
          { q: '华里士（点火）公式结论？', a: '$\\int_0^{\\pi/2}\\sin^n x\\,dx=\\int_0^{\\pi/2}\\cos^n x\\,dx$：n 偶 $=\\frac{(n-1)!!}{n!!}\\cdot\\frac{\\pi}{2}$，n 奇 $=\\frac{(n-1)!!}{n!!}$。' },
          { q: '反常积分 p-判别结论？', a: '$\\int_1^{+\\infty}\\frac{dx}{x^p}$ 收敛 ⟺ $p>1$；$\\int_0^1\\frac{dx}{x^p}$ 收敛 ⟺ $p<1$。' },
          { q: '分部积分的 u 优先顺序？', a: '反对幂三指：反三角、对数、幂函数、三角、指数。排位靠前者作 u，靠后者凑 dv。' }
        ]
      },
      {
        name: '多元函数与微分方程（第13~15讲）',
        cards: [
          { q: '多元函数的连续 / 可微 / 偏导存在关系链？', a: '偏导数连续 ⟹ 可微 ⟹ 连续，且可微 ⟹ 偏导存在；其余方向均不成立（有经典反例）。' },
          { q: '无条件极值 AC−B² 判别法？', a: '$AC-B^2>0$ 且 $A>0$ 极小、$A<0$ 极大；$AC-B^2<0$ 非极值；$AC-B^2=0$ 需另行判断。' },
          { q: '二重积分极坐标变换？', a: '$x=r\\cos\\theta$，$y=r\\sin\\theta$，$d\\sigma=r\\,dr\\,d\\theta$；圆域或含 $x^2+y^2$ 优先使用。' },
          { q: '一阶线性方程通解公式？', a: '$y=e^{-\\int P\\,dx}\\left(\\int Q\\,e^{\\int P\\,dx}dx+C\\right)$（先求 $e^{\\int P\\,dx}$ 再套公式）。' },
          { q: '二阶常系数非齐次特解设法关键？', a: '看 $f(x)$ 形式设 $y^*=x^k e^{\\lambda x}Q_m(x)$，其中 $k$ = $\\lambda$ 作为特征根的重数（0/1/2），Q 为同次多项式待定系数。' }
        ]
      }
    ]
  },
  {
    id: 'circuit-knowledge',
    name: '考研电路',
    subtitle: '直流电路 · 动态电路 · 正弦稳态 · 复频域',
    icon: '⚡',
    color: '#F39C12',
    parts: [
      {
        name: '电路基础',
        sections: [
          sec('一、电路模型与基本定律', [
            item('基尔霍夫电流定律 KCL', [
              '任一时刻，流入节点的电流之和等于流出之和：',
              '$\\sum i_{\\text{in}}=\\sum i_{\\text{out}}\\ \\Longleftrightarrow\\ \\sum i=0$（流入为正）',
              '推广：对任意闭合面（广义节点）同样成立',
              '本质：电荷守恒定律；属拓扑约束，与元件性质无关'
            ].join('\n'), ['高频', '基础']),
            item('基尔霍夫电压定律 KVL', [
              '任一时刻，沿任一回路各段电压代数和为零：',
              '$\\sum u=0$（电压参考方向与绕行方向一致为正）',
              '只与回路路径有关，元件线性或非线性均适用',
              '本质：能量守恒定律'
            ].join('\n'), ['高频', '基础']),
            item('欧姆定律与功率', [
              '线性电阻：$u=Ri$（关联参考方向）；$u=-Ri$（非关联参考方向）',
              '功率 $p=ui$：$p>0$ 吸收功率，$p<0$ 发出功率',
              '电阻功率恒非负：$p=i^{2}R=\\dfrac{u^{2}}{R}\\ge 0$',
              '1 度电 $=3.6\\times10^{6}\\,\\text{J}$'
            ].join('\n')),
            item('理想电源的特性', [
              '理想电压源：端电压恒定，电流由外电路决定；不允许短路',
              '理想电流源：电流恒定，端电压由外电路决定；不允许开路',
              '实际电源模型等效：$U_{S}=R_{0}I_{S}$（电压源串内阻 ⇔ 电流源并内阻）'
            ].join('\n'))
          ]),
          sec('二、电阻电路等效变换', [
            item('电阻串并联与分压分流', [
              '串联：$R=R_{1}+R_{2}+\\cdots+R_{n}$',
              '并联：$\\dfrac{1}{R}=\\dfrac{1}{R_{1}}+\\dfrac{1}{R_{2}}+\\cdots+\\dfrac{1}{R_{n}}$；两电阻 $R=\\dfrac{R_{1}R_{2}}{R_{1}+R_{2}}$',
              '分压：$U_{1}=\\dfrac{R_{1}}{R_{1}+R_{2}}U$',
              '分流：$I_{1}=\\dfrac{R_{2}}{R_{1}+R_{2}}I$'
            ].join('\n'), ['高频']),
            item('Y-△（星三角）等效变换', [
              '△→Y：$R_{1}=\\dfrac{R_{12}R_{31}}{R_{12}+R_{23}+R_{31}}$，其余按循环对应',
              'Y→△：$R_{12}=\\dfrac{R_{1}R_{2}+R_{2}R_{3}+R_{3}R_{1}}{R_{3}}$，其余按循环对应',
              '对称时：$R_{\\triangle}=3R_{Y}$'
            ].join('\n')),
            item('含受控源电路的等效', [
              '受控源不能置零：等效变换、求等效电阻时必须保留',
              '求输入电阻：外加电源法 $R_{in}=\\dfrac{U}{I}$',
              '独立源置零规则：电压源短路、电流源开路'
            ].join('\n'), ['易错'])
          ]),
          sec('三、电路定理', [
            item('叠加定理', [
              '线性电路多独立源共同作用 = 各独立源单独作用效果的代数和',
              '某电源单独作用时：其余电压源短路、电流源开路；受控源保留',
              '注意：功率不可叠加，$P\\neq P_{1}+P_{2}$'
            ].join('\n'), ['高频', '易错']),
            item('戴维南与诺顿定理', [
              '任何线性含源二端网络对外用一个电源等效：',
              '戴维南：开路电压 $U_{oc}$ 串联等效电阻 $R_{eq}$',
              '诺顿：短路电流 $I_{sc}$ 并联等效电阻 $R_{eq}$',
              '关系：$R_{eq}=\\dfrac{U_{oc}}{I_{sc}}$'
            ].join('\n'), ['高频']),
            item('最大功率传输定理', [
              '$R_{L}=R_{eq}$ 时负载获得最大功率：$P_{L\\max}=\\dfrac{U_{oc}^{2}}{4R_{eq}}$',
              '注意：此时效率仅 50%，并非传输效率最高的状态'
            ].join('\n'), ['易错']),
            item('替代定理与互易定理', [
              '替代：某支路电压 $u$、电流 $i$ 已知时，可用电压源 $u$ 或电流源 $i$ 替代，不影响外电路',
              '互易（三种形式）：线性不含受控源网络中，激励与响应互换位置数值不变',
              '含受控源、回转器的网络不满足互易定理'
            ].join('\n'))
          ])
        ]
      },
      {
        name: '动态与交流电路',
        sections: [
          sec('四、动态电路', [
            item('电容与电感的 VCR', [
              '电容：$i_{C}=C\\dfrac{du_{C}}{dt}$，储能 $w_{C}=\\dfrac{1}{2}Cu_{C}^{2}$',
              '电感：$u_{L}=L\\dfrac{di_{L}}{dt}$，储能 $w_{L}=\\dfrac{1}{2}Li_{L}^{2}$',
              '电容电压、电感电流具有"记忆"性质'
            ].join('\n'), ['基础']),
            item('换路定则', [
              '$u_{C}(0^{+})=u_{C}(0^{-})$，$i_{L}(0^{+})=i_{L}(0^{-})$',
              '$t=0^{+}$ 等效：C → 电压源 $u_{C}(0^{+})$；L → 电流源 $i_{L}(0^{+})$',
              '特例：$u_{C}(0)=0$ 时电容短路；$i_{L}(0)=0$ 时电感开路',
              '其余电量（$i_{C}$、$u_{L}$ 等）换路瞬间可以跳变'
            ].join('\n'), ['高频', '易错']),
            item('一阶电路三要素法', [
              '$f(t)=f(\\infty)+\\big[f(0^{+})-f(\\infty)\\big]e^{-t/\\tau}$，$t\\ge 0$',
              '时间常数：$\\tau=RC$ 或 $\\tau=\\dfrac{L}{R}$（$R$ 为从储能元件看进去的等效电阻）',
              '三要素：初值 $f(0^{+})$、稳态值 $f(\\infty)$、时间常数 $\\tau$',
              '工程上 $t=5\\tau$ 时认为过渡过程结束'
            ].join('\n'), ['高频']),
            item('零输入 / 零状态 / 全响应', [
              '零输入响应：无外施激励，仅由初始储能引起',
              '零状态响应：初始储能为零，仅由外施激励引起',
              '全响应 = 零输入响应 + 零状态响应'
            ].join('\n')),
            item('二阶电路（RLC 串联）', [
              '衰减系数 $\\alpha=\\dfrac{R}{2L}$，谐振角频率 $\\omega_{0}=\\dfrac{1}{\\sqrt{LC}}$',
              '$\\alpha>\\omega_{0}$ 过阻尼（非振荡）；$\\alpha=\\omega_{0}$ 临界阻尼；$\\alpha<\\omega_{0}$ 欠阻尼（衰减振荡）',
              '$R=0$ 时无阻尼等幅振荡'
            ].join('\n'))
          ]),
          sec('五、正弦稳态电路', [
            item('正弦量与相量', [
              '$u=\\sqrt{2}U\\cos(\\omega t+\\varphi_{u})$，$U$ 为有效值',
              '相量：$\\dot{U}=U\\angle\\varphi_{u}$；相量法仅适用于同频率正弦量',
              '有效值与幅值：$U=\\dfrac{U_{m}}{\\sqrt{2}}$'
            ].join('\n'), ['高频']),
            item('阻抗与导纳', [
              '$Z=R+jX$：$X>0$ 感性（$X=\\omega L$），$X<0$ 容性（$X=-\\dfrac{1}{\\omega C}$）',
              '模 $|Z|=\\sqrt{R^{2}+X^{2}}$；导纳 $Y=\\dfrac{1}{Z}=G+jB$',
              '串联 $Z=Z_{1}+Z_{2}$；并联 $Y=Y_{1}+Y_{2}$'
            ].join('\n'), ['高频']),
            item('RLC 谐振', [
              '串联谐振（电压谐振）：$X_{L}=X_{C}$，$\\omega_{0}=\\dfrac{1}{\\sqrt{LC}}$，$Z=R$ 最小',
              '品质因数 $Q=\\dfrac{\\omega_{0}L}{R}=\\dfrac{1}{\\omega_{0}CR}$；谐振时 $U_{L}=U_{C}=QU$',
              '并联谐振（电流谐振）：导纳最小，支路电流可为总电流的 $Q$ 倍',
              '通频带 $BW=\\dfrac{f_{0}}{Q}$'
            ].join('\n'), ['高频']),
            item('正弦稳态功率', [
              '有功 $P=UI\\cos\\varphi$，无功 $Q=UI\\sin\\varphi$，视在 $S=UI$，$S=\\sqrt{P^{2}+Q^{2}}$',
              '功率因数提高：并联电容 $C=\\dfrac{P(\\tan\\varphi_{1}-\\tan\\varphi_{2})}{\\omega U^{2}}$'
            ].join('\n'), ['易错'])
          ]),
          sec('六、耦合电感与理想变压器', [
            item('耦合电感', [
              '耦合系数 $k=\\dfrac{M}{\\sqrt{L_{1}L_{2}}}$（$0\\le k\\le1$，$k=1$ 为全耦合）',
              '同名端：电流同时流入同名端时磁通相助，互感电压前取正号',
              '去耦等效：T 型等效去耦，同侧并接取 $+M$、异侧取 $-M$'
            ].join('\n'), ['易错']),
            item('理想变压器', [
              '变比 $n=\\dfrac{N_{1}}{N_{2}}=\\dfrac{U_{1}}{U_{2}}=\\dfrac{I_{2}}{I_{1}}$',
              '阻抗变换 $Z_{1}=n^{2}Z_{2}$；理想条件：无损耗、全耦合、电感无穷大'
            ].join('\n'), ['高频']),
            item('含耦合电感的电路计算', [
              '互感可用受控源等效：$\\dot{U}_{M}=j\\omega M\\dot{I}$',
              '串联顺接 $L=L_{1}+L_{2}+2M$，反接 $L=L_{1}+L_{2}-2M$'
            ].join('\n'))
          ]),
          sec('七、三相电路', [
            item('对称三相电源与连接方式', [
              'Y 接：$U_{l}=\\sqrt{3}U_{p}$（线电压超前相电压 $30^{\\circ}$），$I_{l}=I_{p}$',
              '△ 接：$U_{l}=U_{p}$，$I_{l}=\\sqrt{3}I_{p}$（线电流滞后相电流 $30^{\\circ}$）',
              '对称条件：幅值相等、频率相同、相位互差 $120^{\\circ}$'
            ].join('\n'), ['高频']),
            item('对称三相电路的计算', [
              '一相计算法：取 A 相，$U_{p}=\\dfrac{U_{l}}{\\sqrt{3}}$，按单相求解后推广到其余两相',
              '中线作用：Y 接不对称负载时保持各相电压对称；中线不允许接熔断器'
            ].join('\n'), ['基础']),
            item('三相电路的功率', [
              '$P=\\sqrt{3}U_{l}I_{l}\\cos\\varphi=3U_{p}I_{p}\\cos\\varphi$（$\\varphi$ 为相电压与相电流相位差）',
              '$Q=\\sqrt{3}U_{l}I_{l}\\sin\\varphi$；可用二瓦特表法测量三相功率'
            ].join('\n'))
          ]),
          sec('八、二端口网络', [
            item('二端口方程与参数', [
              'Z 参数（开路阻抗参数）：$\\dot{U}_{1}=Z_{11}\\dot{I}_{1}+Z_{12}\\dot{I}_{2}$，$\\dot{U}_{2}=Z_{21}\\dot{I}_{1}+Z_{22}\\dot{I}_{2}$',
              'Y 参数（短路导纳参数）：$Y=Z^{-1}$',
              'H 参数（混合参数）、A 参数（传输参数）；互易二端口 $Z_{12}=Z_{21}$，对称再加 $Z_{11}=Z_{22}$'
            ].join('\n'), ['高频']),
            item('二端口的等效与连接', [
              '级联用 A 参数相乘；串联用 Z 参数相加；并联用 Y 参数相加',
              '含受控源（回转器等）的二端口 $Z_{12}\\neq Z_{21}$，不满足互易'
            ].join('\n'))
          ]),
          sec('九、复频域分析（拉普拉斯变换）', [
            item('常用拉氏变换对', [
              '$1\\rightleftharpoons\\dfrac{1}{s}$；$e^{-at}\\rightleftharpoons\\dfrac{1}{s+a}$',
              '$\\sin\\omega t\\rightleftharpoons\\dfrac{\\omega}{s^{2}+\\omega^{2}}$；$\\cos\\omega t\\rightleftharpoons\\dfrac{s}{s^{2}+\\omega^{2}}$',
              '$t\\rightleftharpoons\\dfrac{1}{s^{2}}$；$\\delta(t)\\rightleftharpoons1$'
            ].join('\n'), ['高频']),
            item('拉氏变换的重要性质', [
              '微分：$f\'(t)\\rightleftharpoons sF(s)-f(0^{-})$；积分：$\\int_{0}^{t}f(\\tau)\\,d\\tau\\rightleftharpoons\\dfrac{F(s)}{s}$',
              '初值定理：$f(0^{+})=\\lim_{s\\to\\infty}sF(s)$',
              '终值定理：$f(\\infty)=\\lim_{s\\to0}sF(s)$（$sF(s)$ 的极点须全在左半平面）'
            ].join('\n'), ['高频']),
            item('运算法求解动态电路', [
              '复频域元件模型：L → $sL$ 串联电压源 $Li_{L}(0^{-})$；C → $\\dfrac{1}{sC}$ 串联电压源 $\\dfrac{u_{C}(0^{-})}{s}$',
              '步骤：画运算电路 → 按直流方法列方程 → 部分分式展开 → 拉氏反变换',
              '网络函数 $H(s)=\\dfrac{R(s)}{E(s)}$ 仅由电路结构与参数决定，与激励无关'
            ].join('\n'))
          ])
        ]
      }
    ],
    tips: [
      'KCL 本质是电荷守恒、KVL 本质是能量守恒，二者均为拓扑约束，与元件性质无关。',
      '叠加定理只对线性电路成立，且功率不可叠加：$P\\neq P_{1}+P_{2}$。',
      '最大功率传输条件 $R_{L}=R_{eq}$ 时效率仅 50%，工程上常取折中以兼顾效率。',
      '换路定则只保证 $u_{C}$ 与 $i_{L}$ 换路瞬间不突变；$i_{C}$、$u_{L}$ 可以跳变。',
      '直流稳态时电容相当于开路、电感相当于短路——求稳态值的关键。',
      '串联谐振是电压谐振（$U_{L}=U_{C}=QU$），并联谐振是电流谐振，$Q$ 表达式不同。',
      '互易定理仅适用于线性、不含受控源（不含回转器）的网络；含受控源时 $Z_{12}\\neq Z_{21}$。',
      '终值定理要求 $sF(s)$ 的极点全部位于左半平面（电路稳定），否则终值不存在。'
    ],
    cardGroups: [
      {
        name: '基本定律与等效变换',
        cards: [
          { q: 'KCL 与 KVL 的本质分别是什么？', a: 'KCL 本质是电荷守恒，KVL 本质是能量守恒；二者都是拓扑约束，与元件性质无关。' },
          { q: '线性电阻的功率计算公式？', a: '$p=ui=i^{2}R=\\dfrac{u^{2}}{R}$（关联参考方向）；$p\\ge0$ 恒吸收功率。' },
          { q: '电阻分压、分流公式？', a: '$U_{1}=\\dfrac{R_{1}}{R_{1}+R_{2}}U$；$I_{1}=\\dfrac{R_{2}}{R_{1}+R_{2}}I$（分流与电阻成反比）。' },
          { q: '对称三相负载 Y-△ 变换关系？', a: '$R_{\\triangle}=3R_{Y}$，即 $R_{Y}=\\dfrac{R_{\\triangle}}{3}$。' },
          { q: '含受控源电路求等效电阻的基本方法？', a: '外加电源法 $R_{in}=\\dfrac{U}{I}$；受控源必须保留，独立源置零（电压源短路、电流源开路）。' }
        ]
      },
      {
        name: '电路定理',
        cards: [
          { q: '叠加定理的注意事项？', a: '仅线性电路成立；某电源单独作用时其余置零（电压源短路、电流源开路），受控源保留；功率不可叠加。' },
          { q: '戴维南与诺顿等效关系？', a: '戴维南 = $U_{oc}$ 串联 $R_{eq}$；诺顿 = $I_{sc}$ 并联 $R_{eq}$；$R_{eq}=\\dfrac{U_{oc}}{I_{sc}}$。' },
          { q: '最大功率传输条件与最大功率？', a: '$R_{L}=R_{eq}$ 时 $P_{L\\max}=\\dfrac{U_{oc}^{2}}{4R_{eq}}$，此时效率仅 50%。' },
          { q: '互易定理成立的条件？', a: '线性、不含受控源、不含回转器的网络（满足 $Z_{12}=Z_{21}$），激励与响应互换位置数值不变。' }
        ]
      },
      {
        name: '动态电路',
        cards: [
          { q: '换路定则的内容？', a: '$u_{C}(0^{+})=u_{C}(0^{-})$、$i_{L}(0^{+})=i_{L}(0^{-})$；$i_{C}$、$u_{L}$ 可跳变。' },
          { q: '一阶电路三要素法？', a: '$f(t)=f(\\infty)+[f(0^{+})-f(\\infty)]e^{-t/\\tau}$，$\\tau=RC$ 或 $\\tau=\\dfrac{L}{R}$。' },
          { q: '直流稳态时电容、电感等效为什么？', a: '电容开路、电感短路。' },
          { q: 'RLC 串联二阶电路的三种响应？', a: '衰减系数 $\\alpha=\\dfrac{R}{2L}$ 与 $\\omega_{0}=\\dfrac{1}{\\sqrt{LC}}$ 比较：$\\alpha>\\omega_{0}$ 过阻尼，相等临界阻尼，$\\alpha<\\omega_{0}$ 欠阻尼（衰减振荡）。' },
          { q: '全响应如何分解？', a: '全响应 = 零输入响应 + 零状态响应。' }
        ]
      },
      {
        name: '正弦稳态电路',
        cards: [
          { q: '阻抗虚部正负各代表什么？', a: '$X>0$ 感性（$X=\\omega L$），$X<0$ 容性（$X=-\\dfrac{1}{\\omega C}$）。' },
          { q: '串联谐振的特点？', a: '$\\omega_{0}=\\dfrac{1}{\\sqrt{LC}}$，$Z=R$ 最小、电流最大，$U_{L}=U_{C}=QU$（电压谐振）。' },
          { q: '提高功率因数的方法？', a: '并联电容 $C=\\dfrac{P(\\tan\\varphi_{1}-\\tan\\varphi_{2})}{\\omega U^{2}}$，使 $\\cos\\varphi$ 提高。' },
          { q: 'P、Q、S 的关系？', a: '$S=\\sqrt{P^{2}+Q^{2}}=UI$，功率因数 $\\cos\\varphi=\\dfrac{P}{S}$。' }
        ]
      },
      {
        name: '三相与耦合电路',
        cards: [
          { q: 'Y 接对称三相电：线电压与相电压？', a: '$U_{l}=\\sqrt{3}U_{p}$，线电压超前对应相电压 $30^{\\circ}$。' },
          { q: '△ 接对称三相电：线电流与相电流？', a: '$I_{l}=\\sqrt{3}I_{p}$，线电流滞后对应相电流 $30^{\\circ}$。' },
          { q: '理想变压器阻抗变换？', a: '$Z_{1}=n^{2}Z_{2}$，$n=\\dfrac{N_{1}}{N_{2}}=\\dfrac{U_{1}}{U_{2}}=\\dfrac{I_{2}}{I_{1}}$。' },
          { q: '耦合电感同名端的含义？', a: '电流同时流入（或流出）同名端时两线圈磁通相助，互感电压取正号；耦合系数 $k=\\dfrac{M}{\\sqrt{L_{1}L_{2}}}$。' },
          { q: '三相功率公式？', a: '$P=\\sqrt{3}U_{l}I_{l}\\cos\\varphi=3U_{p}I_{p}\\cos\\varphi$（$\\varphi$ 为相电压与相电流夹角）。' }
        ]
      },
      {
        name: '二端口与复频域',
        cards: [
          { q: '互易二端口与对称二端口的条件？', a: '互易：$Z_{12}=Z_{21}$；对称：互易基础上再加 $Z_{11}=Z_{22}$。' },
          { q: '二端口级联、串联、并联分别用什么参数？', a: '级联用 A 参数相乘；串联用 Z 参数相加；并联用 Y 参数相加。' },
          { q: '常用拉氏变换对（1、e^{-at}、sinωt、δ(t)）？', a: '$1\\leftrightarrow\\dfrac{1}{s}$；$e^{-at}\\leftrightarrow\\dfrac{1}{s+a}$；$\\sin\\omega t\\leftrightarrow\\dfrac{\\omega}{s^{2}+\\omega^{2}}$；$\\delta(t)\\leftrightarrow1$。' },
          { q: '初值定理与终值定理？', a: '$f(0^{+})=\\lim_{s\\to\\infty}sF(s)$；$f(\\infty)=\\lim_{s\\to0}sF(s)$（要求 $sF(s)$ 极点均在左半平面）。' },
          { q: '电感、电容的复频域（运算）模型？', a: 'L → 阻抗 $sL$ 串联电压源 $Li_{L}(0^{-})$；C → 阻抗 $\\dfrac{1}{sC}$ 串联电压源 $\\dfrac{u_{C}(0^{-})}{s}$。' }
        ]
      }
    ]
  },
  {
    id: 'english2-knowledge',
    name: '考研英语二',
    subtitle: '核心词汇 · 语法 · 完形 · 阅读 · 翻译 · 写作',
    icon: '🔤',
    color: '#3498DB',
    unit: '个知识点',
    parts: [
      { name: '核心词汇', sections: [
        sec('高频动词（一）', [
          item('abandon / absorb / accelerate', [
            '**abandon** v. 放弃、抛弃（同 desert / forsake，反 retain / keep）',
            '**absorb** v. 吸收；使全神贯注（同 soak up / assimilate，反 emit / release）',
            '**accelerate** v. 加速（同 quicken / hasten，反 decelerate）'
          ].join('\n')),
          item('accomplish / accumulate / acquire', [
            '**accomplish** v. 完成、实现（同 achieve / complete / fulfill，反 fail）',
            '**accumulate** v. 积累、堆积（同 amass / collect，反 disperse / scatter）',
            '**acquire** v. 获得、习得（同 obtain / gain，反 lose / forfeit）'
          ].join('\n')),
          item('adapt / adjust / administer', [
            '**adapt** v. 适应；改编（同 adjust / accommodate / modify）',
            '**adjust** v. 调整、适应（同 adapt / modify / alter）',
            '**administer** v. 管理、实施（同 manage / direct / execute）'
          ].join('\n')),
          item('advocate / allocate / alter', [
            '**advocate** v. 提倡、拥护（同 support / endorse，反 oppose）',
            '**allocate** v. 分配、拨给（同 assign / allot / distribute）',
            '**alter** v. 改变（同 change / modify / transform，反 preserve）'
          ].join('\n'))
        ]),
        sec('高频动词（二）', [
          item('analyze / anticipate / appeal', [
            '**analyze** v. 分析（同 examine / evaluate）',
            '**anticipate** v. 预期、预见（同 expect / foresee）',
            '**appeal** v./n. 呼吁；吸引（同 request / attraction）'
          ].join('\n')),
          item('assess / assign / assume', [
            '**assess** v. 评估（同 evaluate / appraise）',
            '**assign** v. 分配、指派（同 allocate / allot）',
            '**assume** v. 假定、承担（同 suppose / presume）'
          ].join('\n')),
          item('attain / attribute / confirm', [
            '**attain** v. 达到、获得（同 achieve / reach）',
            '**attribute** v. 归因于（attribute A to B，同 ascribe）',
            '**confirm** v. 确认、证实（同 verify / validate，反 contradict）'
          ].join('\n')),
          item('commence / conform / conserve', [
            '**commence** v. 开始（同 begin / start，反 end）',
            '**conform** v. 遵守、符合（conform to，同 comply / obey）',
            '**conserve** v. 保护、节约（同 preserve / save，反 waste）'
          ].join('\n'))
        ]),
        sec('高频形容词', [
          item('abundant / adequate / ambiguous', [
            '**abundant** adj. 丰富的、充足的（同 plentiful / ample，反 scarce）',
            '**adequate** adj. 足够的（同 sufficient / enough，反 inadequate）',
            '**ambiguous** adj. 模糊的、模棱两可的（同 vague / unclear，反 clear）'
          ].join('\n')),
          item('apparent / appropriate / authentic', [
            '**apparent** adj. 明显的（同 obvious / evident，反 obscure）',
            '**appropriate** adj. 合适的（同 suitable / fitting，反 inappropriate）',
            '**authentic** adj. 真实的、正宗的（同 genuine / real，反 fake）'
          ].join('\n')),
          item('beneficial / comprehensive / considerable', [
            '**beneficial** adj. 有益的（同 helpful / advantageous，反 harmful）',
            '**comprehensive** adj. 全面的（同 thorough / complete，反 partial）',
            '**considerable** adj. 相当大的、可观的（同 substantial / significant）'
          ].join('\n')),
          item('consistent / distinct / dominant', [
            '**consistent** adj. 一致的（be consistent with，同 steady / uniform）',
            '**distinct** adj. 明显的、不同的（同 clear / separate，反 similar）',
            '**dominant** adj. 主导的、占优势的（同 predominant / superior）'
          ].join('\n'))
        ]),
        sec('高频名词', [
          item('circumstance / controversy / hypothesis', [
            '**circumstance** n. 情况、环境（under no circumstances 决不）',
            '**controversy** n. 争议（同 dispute / debate）',
            '**hypothesis** n. 假设（同 assumption）'
          ].join('\n')),
          item('magnitude / opponent / stability', [
            '**magnitude** n. 巨大、重要性（同 extent / importance）',
            '**opponent** n. 对手（同 rival / adversary）',
            '**stability** n. 稳定性（同 steadiness，反 instability）'
          ].join('\n'))
        ])
      ]},
      { name: '语法', sections: [
        sec('核心时态', [
          item('将来完成时 will have done', [
            '**构成**：will have + 过去分词',
            '**标志词**：by next… / by the time…（将来）',
            '**例句**：By next summer, she will have worked here for five years.'
          ].join('\n')),
          item('过去进行时 was/were doing', [
            '**构成**：was/were + 现在分词',
            '**用法**：过去某时刻正在进行的动作',
            '**例句**：When the lights went out, I was cooking dinner.'
          ].join('\n')),
          item('现在完成时 has/have done', [
            '**构成**：has/have + 过去分词',
            '**标志词**：so far / already / since / for',
            '**例句**：She has completed three reports so far.'
          ].join('\n')),
          item('过去完成时 had done', [
            '**构成**：had + 过去分词（过去的过去）',
            '**标志词**：by the time + 过去时',
            '**例句**：By the time we arrived, the show had already ended.'
          ].join('\n'))
        ]),
        sec('高频介词搭配', [
          item('be + 介词（一）', [
            'be interested in 对……感兴趣',
            'be good at 擅长',
            'be afraid of 害怕',
            'be famous for 因……而著名',
            'be proud of 为……而自豪'
          ].join('\n')),
          item('be + 介词（二）', [
            'be capable of 有能力做',
            'be guilty of 犯有……罪',
            'be tired of 厌倦',
            'be full of 充满',
            'be short of 缺少'
          ].join('\n')),
          item('be + 介词（三）', [
            'be aware of 意识到',
            'be keen on 热衷于',
            'be used to doing 习惯于',
            'be accused of 被控告',
            'be satisfied with 对……满意'
          ].join('\n')),
          item('动词 + 介词', [
            'depend on / rely on / concentrate on 依靠 / 专注',
            'insist on / object to (+doing) 坚持 / 反对',
            'succeed in / participate in 成功 / 参加',
            'consist of 由……组成；complain about 抱怨',
            'look forward to + doing 期待；apply for 申请'
          ].join('\n'))
        ]),
        sec('常考连词', [
          item('让步与条件', [
            'although / though 虽然（+ 从句）',
            'unless = if not 除非',
            'provided that / as long as 只要（条件）',
            'as far as 就……而言（as far as I know）',
            'in case 以防'
          ].join('\n')),
          item('目的与时间', [
            'so that 以便（后可接 can / could）',
            'until 直到；as soon as 一……就',
            'while 当……时 / 而（表对比）'
          ].join('\n')),
          item('转折与并列', [
            'yet 然而（表转折，= however / but）',
            'or 否则；as well as 也、和',
            'in spite of / despite + 名词 = although + 从句'
          ].join('\n'))
        ])
      ]},
      { name: '完形填空', sections: [
        sec('逻辑连接词', [
          item('表转折 / 对比', [
            'however 然而；nevertheless 仍然、然而',
            'on the contrary 恰恰相反',
            'in contrast 相比之下',
            'instead 相反；而是'
          ].join('\n')),
          item('表因果', [
            'therefore / thus / hence 因此',
            'consequently 结果',
            'as a result 因此'
          ].join('\n')),
          item('表递进 / 补充', [
            'moreover / furthermore 此外、而且',
            'in addition 另外',
            'meanwhile 与此同时'
          ].join('\n')),
          item('表条件 / 其他', [
            'otherwise 否则',
            'subsequently 随后；eventually 最终'
          ].join('\n'))
        ]),
        sec('语境词汇', [
          item('描述人物 / 情绪', [
            'pale 苍白的；modest 谦虚的',
            'optimistic 乐观的；calm 冷静的',
            'eager 渴望的；reluctant 不情愿的'
          ].join('\n')),
          item('形容事物', [
            'comprehensive 全面的；meticulous 一丝不苟的',
            'flawless 完美的；breathtaking 令人惊叹的',
            'sturdy 坚固的；notable 显著的'
          ].join('\n')),
          item('行为与判断', [
            'evasive 含糊其辞的；bold 大胆的',
            'drastic 激烈的；remarkable 非凡的',
            'engaging 引人入胜的；offensive 冒犯的'
          ].join('\n'))
        ])
      ]},
      { name: '阅读理解', sections: [
        sec('阅读题型与技巧', [
          item('主旨题（main idea）', [
            '**问法**：What is the main idea of the passage?',
            '**技巧**：重点看首段与尾段，注意首句主题句',
            '**陷阱**：细节性描述（以偏概全）多为干扰项'
          ].join('\n')),
          item('细节题（details）', [
            '**问法**：According to the passage…?',
            '**技巧**：先定位关键词所在段落，再比对选项',
            '**陷阱**：张冠李戴 / 无中生有 / 绝对化表述'
          ].join('\n')),
          item('推理题（inference）', [
            '**问法**：It can be inferred that…?',
            '**技巧**：基于原文推断隐含结论，不可选原文直接陈述',
            '**陷阱**：过度推断、与原文矛盾'
          ].join('\n')),
          item('词义 / 态度题', [
            '**词义题**：结合上下文语境（转折 / 因果）猜词',
            '**态度题**：抓作者用词的褒贬色彩（positive / negative / neutral）'
          ].join('\n'))
        ]),
        sec('高频阅读主题词', [
          item('科技类', [
            'artificial intelligence 人工智能',
            'automate 使自动化；online learning 在线学习',
            'remote working 远程办公；privacy 隐私'
          ].join('\n')),
          item('环境类', [
            'climate change 气候变化；emissions 排放',
            'renewable energy 可再生能源',
            'deforestation 森林砍伐；recycling 回收利用'
          ].join('\n')),
          item('经济与社会', [
            'economic growth 经济增长；inflation 通货膨胀',
            'globalization 全球化；urbanization 城市化',
            'gig economy 零工经济；income gap 收入差距'
          ].join('\n'))
        ])
      ]},
      { name: '翻译', sections: [
        sec('英译中高频表达', [
          item('固定搭配（一）', [
            'be capable of 有能力做',
            'due to 由于',
            'attribute A to B 把 A 归因于 B',
            'adapt to 适应',
            'have a profound impact on 对……产生深远影响'
          ].join('\n')),
          item('固定搭配（二）', [
            'be committed to 致力于',
            'in charge of 负责',
            'take advantage of 利用',
            'consist of 由……组成',
            'be accused of 被控告'
          ].join('\n')),
          item('固定搭配（三）', [
            'be subject to 受……支配 / 须经',
            'be based on 基于',
            'run out of 用完',
            'under construction 在建设中',
            'ahead of schedule 提前'
          ].join('\n')),
          item('固定搭配（四）', [
            'be consistent with 与……一致',
            'be engaged in 从事',
            'be addicted to 沉迷于',
            'be accessible to 可供……使用',
            'be opposed to 反对'
          ].join('\n')),
          item('固定搭配（五）', [
            'be absorbed in 全神贯注于',
            'be strict with 对……严格',
            'be worth doing 值得做',
            'be responsible for 对……负责',
            'too…to… 太……而不能'
          ].join('\n'))
        ]),
        sec('中译英高频句型', [
          item('高频句型（一）', [
            'make full use of 充分利用',
            'be known for 因……而闻名',
            'succeed in doing 成功做某事',
            'be used to doing 习惯于',
            'be busy with 忙于'
          ].join('\n')),
          item('高频句型（二）', [
            'be satisfied with 对……满意',
            'look forward to + doing 期待',
            'insist on + doing 坚持做',
            'remain to be done 有待完成',
            'owe A to B 把 A 归功于 B'
          ].join('\n')),
          item('高频句型（三）', [
            'attach importance to 重视',
            'substitute for 代替',
            'be devoted to doing 致力于做',
            'be praised for 因……受表扬',
            'be determined to do 决心做'
          ].join('\n')),
          item('高频句型（四）', [
            'refuse to do 拒绝做',
            'prepare for 为……做准备',
            'be ashamed of 为……感到羞愧',
            'cherish 珍惜；focus on 专注于'
          ].join('\n'))
        ])
      ]},
      { name: '写作', sections: [
        sec('书信格式规范', [
          item('称呼与署名', [
            '正式信件称呼：Dear Sir or Madam（不知姓名）',
            '知悉姓名：Dear Mr/Ms xxx；落款 Yours sincerely',
            '不知姓名落款：Yours faithfully',
            '不知具体收件人：To Whom It May Concern',
            '朋友信件落款：Best wishes / Yours'
          ].join('\n')),
          item('格式要点', [
            '日期写在右上角（如 29 August 2026）',
            '寄信人地址在右上角，收信人地址在左上',
            '主题行应简短明确（如 Application for Marketing Position）',
            'CC 抄送（收件人可见名单）；BCC 密送（不可见）',
            'Re: 表示事由；PS 表示附言'
          ].join('\n'))
        ]),
        sec('写作常用表达', [
          item('引出观点 / 举例', [
            'In my opinion 在我看来',
            'For example / For instance 例如',
            'It is worth noting that… 值得注意的是',
            'Generally speaking 总的来说'
          ].join('\n')),
          item('衔接递进 / 转折', [
            'Furthermore / Moreover 此外、而且',
            'On the other hand 另一方面',
            'However / Nevertheless 然而',
            'In spite of the fact that… 尽管'
          ].join('\n')),
          item('结论 / 总结', [
            'In conclusion / To sum up 总之',
            'As a result / Therefore 因此',
            'In other words 换句话说',
            'It should be emphasized that… 应该强调的是'
          ].join('\n'))
        ]),
        sec('高频语法错误', [
          item('主谓一致', [
            'Neither of the boys is here.（neither of 谓语单数）',
            'Each of the students has a book.（each of 谓语单数）',
            'The number of students is increasing. / A number of students are absent.',
            '就近原则：Neither he nor I am responsible.'
          ].join('\n')),
          item('固定结构', [
            'suggest that + 动词原形（She suggested that he see a doctor.）',
            'look forward to / object to / be used to + doing',
            'make sb do sth；would rather do than do',
            'So + adj. + that 如此……以至于'
          ].join('\n')),
          item('时态与倒装', [
            'by the time + 现在时，主句用将来完成时',
            'Hardly had I left when it started to rain.（倒装）',
            'Not only did he apologize, but he also…（倒装）',
            'wish + 过去完成时（与过去事实相反）'
          ].join('\n'))
        ]),
        sec('文章结构', [
          item('段落三要素', [
            '**主题句**（topic sentence）：概括段落主旨，置于段首',
            '**支持句**（supporting sentences）：用例子、数据展开论证',
            '**结论句**（concluding sentence）：总结、呼应主题'
          ].join('\n')),
          item('议论文结构', [
            '开头段：引出话题 + 亮出论点（thesis statement）',
            '主体段：2–3 段，每段一个分论点 + 论据',
            '结尾段：重申观点 + 升华（建议 / 展望）'
          ].join('\n'))
        ])
      ]}
    ],
    tips: [
      '**be used to + doing** 表示“习惯于”，**used to + do** 表示“过去常常”。',
      'look forward to / object to / devote…to 中的 to 是介词，后接名词或动名词。',
      'suggest that 从句用动词原形（虚拟语气）：She suggested that he see a doctor.',
      'the number of + 谓语单数；a number of + 谓语复数。',
      'Hardly…when / Not only… / Only… 置于句首时主句要部分倒装。',
      'despite / in spite of 后接名词；although 后接从句，二者不可混用。',
      'so that 引导目的/结果状语从句；so…that 表示“如此……以至于”。',
      'by the time + 现在时，主句常用将来完成时；by the time + 过去时，主句用过去完成时。',
      'Neither…nor / Either…or / Not only…but also 遵循“就近原则”决定谓语。',
      'information、advice、equipment 都是不可数名词，无复数形式。'
    ],
    cardGroups: [
      {
        name: '核心词汇',
        cards: [
          { q: 'abandon / acquire / accumulate 的含义？', a: 'abandon 放弃（反 retain）；acquire 获得（同 obtain）；accumulate 积累（同 amass）。' },
          { q: 'adapt / adjust / adopt 的区别？', a: 'adapt 适应、改编（adapt to）；adjust 调整；adopt 采纳、收养。' },
          { q: 'authentic / apparent / ambiguous 的含义？', a: 'authentic 真实的（反 fake）；apparent 明显的；ambiguous 模棱两可的。' },
          { q: 'beneficial / comprehensive / considerable 的含义？', a: 'beneficial 有益的；comprehensive 全面的；considerable 相当大的。' },
          { q: 'attribute A to B 与 owe A to B？', a: 'attribute…to… 把……归因于；owe…to… 把……归功于。' },
          { q: 'conform to / comply with 的含义？', a: 'conform to 遵守、符合；comply with 遵从（规则、要求）。' }
        ]
      },
      {
        name: '语法时态',
        cards: [
          { q: '将来完成时的构成与标志词？', a: 'will have + 过去分词；标志词 by next… / by the time + 将来时。' },
          { q: '现在完成时与过去完成时的区别？', a: '现在完成时强调与现在的联系（so far / since / for）；过去完成时表示“过去的过去”（by the time + 过去时）。' },
          { q: 'be used to doing 与 used to do？', a: 'be used to doing 习惯于（to 为介词）；used to do 过去常常（现在不再）。' },
          { q: 'wish 从句的虚拟时态？', a: '与现在相反用一般过去时；与过去相反用过去完成时（wish I had studied）。' }
        ]
      },
      {
        name: '介词搭配',
        cards: [
          { q: 'be 常考搭配（一）？', a: 'be interested in / good at / afraid of / famous for / proud of。' },
          { q: 'be 常考搭配（二）？', a: 'be capable of / guilty of / tired of / full of / short of。' },
          { q: '动词 + 介词（一）？', a: 'depend on / rely on / concentrate on；insist on + doing。' },
          { q: '动词 + 介词（二）？', a: 'succeed in / participate in；look forward to + doing；object to + doing。' },
          { q: '其他高频搭配？', a: 'apply for 申请；protect…from… 保护免受；be accused of 被控告。' }
        ]
      },
      {
        name: '逻辑连接词',
        cards: [
          { q: '表转折的连接词？', a: 'however、nevertheless、on the contrary、in contrast、instead。' },
          { q: '表因果的连接词？', a: 'therefore、thus、hence、consequently、as a result。' },
          { q: '表递进 / 补充的连接词？', a: 'moreover、furthermore、in addition、besides、meanwhile。' },
          { q: '表条件 / 否则？', a: 'unless（除非）、provided that / as long as（只要）、otherwise（否则）。' }
        ]
      },
      {
        name: '翻译高频表达',
        cards: [
          { q: 'be committed to / be devoted to / be absorbed in？', a: 'be committed to 致力于；be devoted to doing 献身于；be absorbed in 全神贯注于。' },
          { q: 'be subject to / be based on / be consistent with？', a: 'be subject to 受……支配；be based on 基于；be consistent with 与……一致。' },
          { q: 'under construction / ahead of schedule / run out of？', a: '在建设中 / 提前 / 用完。' },
          { q: 'take advantage of / in charge of / make full use of？', a: '利用 / 负责 / 充分利用。' },
          { q: 'be worth doing / too…to / be strict with？', a: '值得做 / 太……而不能 / 对……严格。' }
        ]
      },
      {
        name: '写作易错点',
        cards: [
          { q: 'Neither of / Each of / The number of 谓语用单数还是复数？', a: '三者谓语均用单数；A number of 后用复数。' },
          { q: 'suggest that 从句的谓语形式？', a: '动词原形（虚拟语气）：She suggested that he see a doctor.' },
          { q: 'Hardly…when 的倒装结构？', a: 'Hardly had + 主语 + 过去分词 when + 一般过去时（一……就）。' },
          { q: '与过去相反的虚拟语气？', a: 'If I had known, I would have helped.（从句过去完成，主句 would have done）' },
          { q: 'so that 与 so…that 的区别？', a: 'so that 以便/以致（引导目的结果）；so + adj. + that 如此……以至于。' }
        ]
      }
    ]
  }
];
export type Lang = "zh" | "en";
export type T2 = { zh: string; en: string };

export type TypeCode =
  | "PIXL" | "AUTO" | "BLCK"
  | "LOGO" | "UNDO" | "MEGO"
  | "SHIP" | "GHST" | "LORM"
  | "FNAL" | "COPY" | "VIBE";

export type Family = "pixel" | "client" | "ship" | "chaos";

export const FAMILIES: Record<Family, { name: T2; desc: T2 }> = {
  pixel: { name: { zh: "强迫症派", en: "Pixel Keepers" }, desc: { zh: "对齐是信仰，规范是底线", en: "Alignment is a religion" } },
  client: { name: { zh: "甲方友好派", en: "Client Pleasers" }, desc: { zh: "有求必应，改到天亮", en: "Revisions until sunrise" } },
  ship: { name: { zh: "交付派", en: "Shippers" }, desc: { zh: "能交就行，下班最大", en: "Done beats perfect" } },
  chaos: { name: { zh: "混沌派", en: "Chaos Makers" }, desc: { zh: "文件夹是黑洞，灵感是收藏夹", en: "Desktop full of finals" } },
};

export type Rarity = "SSR" | "SR" | "R" | "N";

export interface TypeInfo {
  code: TypeCode;
  name: T2;
  family: Family;
  line: T2;
  traits: { zh: string[]; en: string[] };
  enemy: TypeCode;
  bestie: TypeCode;
  rarity: Rarity;
  why?: { bestie: T2; enemy: T2 };
}

export const TYPES: Record<TypeCode, TypeInfo> = {
  PIXL: {
    code: "PIXL", family: "pixel", rarity: "SSR", enemy: "SHIP", bestie: "AUTO",
    name: { zh: "像素警察", en: "Pixel Police" },
    line: { zh: "0.5px 也逃不过你的眼睛", en: "Not even 0.5px gets past you" },
    traits: {
      zh: ["截图先放大到 800% 再说话", "走查清单比需求文档还长", "开发最怕你那句“我就看一眼”"],
      en: ["Zooms to 800% before saying a word", "Your QA list is longer than the PRD", "Devs dread “I'll just take a quick look”"],
    },
  },
  AUTO: {
    code: "AUTO", family: "pixel", rarity: "N", enemy: "FNAL", bestie: "PIXL",
    name: { zh: "Auto Layout 原教旨", en: "Auto Layout Purist" },
    line: { zh: "没套 Auto Layout 的不算设计", en: "No Auto Layout, no design" },
    traits: {
      zh: ["图层命名比代码变量还规范", "间距只认 4 的倍数", "看见绝对定位会皱眉"],
      en: ["Layer names cleaner than the codebase", "Spacing comes in multiples of 4. Only.", "Flinches at absolute positioning"],
    },
  },
  BLCK: {
    code: "BLCK", family: "pixel", rarity: "N", enemy: "COPY", bestie: "LOGO",
    name: { zh: "五彩斑斓黑大师", en: "Colorful Black Wizard" },
    line: { zh: "你真的调出来了", en: "You actually pulled it off" },
    traits: {
      zh: ["甲方的玄学需求你都能翻译", "色板里躺着 23 种黑", "深夜研究过甲虫的结构色"],
      en: ["Fluent in client nonsense", "23 shades of black in one palette", "Has read about beetle iridescence at 2am"],
    },
  },
  LOGO: {
    code: "LOGO", family: "client", rarity: "SR", enemy: "PIXL", bestie: "MEGO",
    name: { zh: "放大师", en: "The Enlarger" },
    line: { zh: "甲方说大，你问多大", en: "Client says bigger, you ask how much" },
    traits: {
      zh: ["你的 logo 永远在第一视觉", "汇报稿写着“品牌露出最大化”", "留白就是还没放 logo 的地方"],
      en: ["Your logo is always the hero", "Every deck says “maximize brand presence”", "Whitespace is where the logo isn't yet"],
    },
  },
  UNDO: {
    code: "UNDO", family: "client", rarity: "R", enemy: "VIBE", bestie: "FNAL",
    name: { zh: "第一版受害者", en: "Victim of v1" },
    line: { zh: "改了 37 版，最后用回第一版", en: "37 rounds later, back to v1" },
    traits: {
      zh: ["文件夹里躺着 v1 到 v37", "第一版永远不删，你懂的", "心态比设计稿还稳"],
      en: ["v1 through v37 share one folder", "Never delete v1. You know why.", "Calmer than your mockups"],
    },
  },
  MEGO: {
    code: "MEGO", family: "client", rarity: "SR", enemy: "GHST", bestie: "LOGO",
    name: { zh: "美工本工", en: "Errand Designer" },
    line: { zh: "“帮我 P 个证件照”也接了", en: "Yes, you'll also fix their passport photo" },
    traits: {
      zh: ["亲戚的请柬、老板的 PPT 全包", "嘴上说我是设计师，手上已经在抠图", "有求必应，从不收费"],
      en: ["Wedding invites, the boss's slides, all yours", "Says “I'm a designer” while removing a background", "Always yes, never an invoice"],
    },
  },
  SHIP: {
    code: "SHIP", family: "ship", rarity: "R", enemy: "PIXL", bestie: "VIBE",
    name: { zh: "先上线再说", en: "Ship It First" },
    line: { zh: "歪了？用户看不出来", en: "Misaligned? Users won't notice" },
    traits: {
      zh: ["口头禅是“先跑起来”", "设计稿和线上是两个平行宇宙", "走查？下个版本再说"],
      en: ["Catchphrase: “let's just get it live”", "Figma and prod are parallel universes", "Design QA? Next sprint."],
    },
  },
  GHST: {
    code: "GHST", family: "ship", rarity: "SR", enemy: "MEGO", bestie: "LORM",
    name: { zh: "已读不回", en: "Left on Read" },
    line: { zh: "周五 17:58 之后查无此人", en: "Unreachable after Friday 5:58 PM" },
    traits: {
      zh: ["下班即失联，边界感满分", "消息免打扰是你的设计系统", "甲方的“在吗”在你这儿永远未读"],
      en: ["Offline the minute work ends", "Do Not Disturb is your design system", "The client's “u there?” stays unread"],
    },
  },
  LORM: {
    code: "LORM", family: "ship", rarity: "SSR", enemy: "AUTO", bestie: "GHST",
    name: { zh: "Lorem ipsum 本人", en: "Lorem Ipsum, Live" },
    line: { zh: "占位文案已经上线三个月", en: "Placeholder copy, in prod for 3 months" },
    traits: {
      zh: ["稿子里住着 Lorem 和 ipsum", "真实数据？等运营给吧", "头像全是灰色圆圈"],
      en: ["Lorem and Ipsum live in your files", "Real data? Waiting on marketing", "Every avatar is a grey circle"],
    },
  },
  FNAL: {
    code: "FNAL", family: "chaos", rarity: "SSR", enemy: "AUTO", bestie: "UNDO",
    name: { zh: "最终版永动机", en: "Final_Final Forever" },
    line: { zh: "final_final_真的final_v3", en: "final_final_REAL_final_v3" },
    traits: {
      zh: ["文件名就是一部改稿史", "从不相信“这是最后一版”", "桌面比 Figma 图层还乱"],
      en: ["Your filenames are a revision history", "Never believes it's the last round", "Desktop messier than your layers"],
    },
  },
  COPY: {
    code: "COPY", family: "chaos", rarity: "N", enemy: "BLCK", bestie: "SHIP",
    name: { zh: "灵感搬运工", en: "Inspiration Courier" },
    line: { zh: "“参考”了 Dribbble 前三页", en: "“Referenced” the first 3 pages of Dribbble" },
    traits: {
      zh: ["收藏夹比作品集丰富", "致敬和参考你分得很清", "Pinterest 是你的第二大脑"],
      en: ["Bookmarks richer than your portfolio", "Knows homage from copy. Mostly.", "Pinterest is your second brain"],
    },
  },
  VIBE: {
    code: "VIBE", family: "chaos", rarity: "N", enemy: "UNDO", bestie: "SHIP",
    name: { zh: "被 AI 吓醒的人", en: "Woken Up by AI" },
    line: { zh: "白天画稿，晚上学 vibe coding", en: "Pushes pixels by day, vibe codes by night" },
    traits: {
      zh: ["一边焦虑 AI 抢饭碗，一边用 AI 赶稿", "收藏了 40 个 AI 工具，常用 2 个", "简历上多了一行“会写代码”"],
      en: ["Worried about AI, ships with AI", "Saved 40 AI tools, uses 2", "Résumé now says “can code”"],
    },
  },
};

export const WHY: Record<TypeCode, { bestie: T2; enemy: T2 }> = {
  PIXL: {
    bestie: { zh: "你负责发现歪了 0.5px，Ta 负责让它从一开始就不会歪。一个查，一个防，走查清单能短一半。", en: "You catch the 0.5px. They build it so it never drifts. One inspects, one prevents, and the QA list gets half as long." },
    enemy: { zh: "你说“再对齐一下”，Ta 说“用户看不出来”。你们对“完成”的定义差了一整个走查流程。", en: "You say “align it once more.” They say “users won't notice.” Your definitions of done are one QA pass apart." },
  },
  AUTO: {
    bestie: { zh: "你搭好组件和间距规范，Ta 用放大镜帮你验收。你们能把一个设计系统维护到下个大版本。", en: "You set up the components and spacing. They inspect it with a magnifier. Together you keep a design system alive past v2." },
    enemy: { zh: "你的文件夹按版本号排好，Ta 的桌面上躺着 final_final_v3。打开 Ta 的文件时，你会先深呼吸。", en: "Your folders are versioned. Their desktop has final_final_v3. You take a deep breath before opening their files." },
  },
  BLCK: {
    bestie: { zh: "Ta 把甲方的话照单全收，你把它翻译成能做出来的东西。甲方觉得被听懂了，你们俩都能早点下班。", en: "They take every client request at face value. You translate it into something buildable. The client feels heard and you both leave on time." },
    enemy: { zh: "你为了一个“对的黑”研究了一晚上，Ta 直接从 Dribbble 吸了个色。你们对“原创”的耐心不在一个量级。", en: "You spent a night finding the right black. They color-picked one from Dribbble. Your patience for originality is not on the same scale." },
  },
  LOGO: {
    bestie: { zh: "你们都很难对甲方说不。一个负责放大 logo，一个负责顺手 P 证件照，甲方最爱找你们俩。", en: "Neither of you can say no to a client. One enlarges the logo, the other retouches the passport photo. Clients love you both." },
    enemy: { zh: "你把 logo 放大到 300%，Ta 在旁边默默量留白。Ta 不说话，但走查文档上已经写了 12 条。", en: "You scale the logo to 300%. They quietly measure the margins. They say nothing, but the QA doc already has 12 items." },
  },
  UNDO: {
    bestie: { zh: "你改了 37 版，Ta 存了 37 个 final。你们俩合在一起，就是一部完整的改稿史，谁也不会把第一版删掉。", en: "You did 37 rounds. They saved 37 finals. Together you are a complete revision history, and nobody deletes v1." },
    enemy: { zh: "你还在等甲方确认第 38 版，Ta 已经用 AI 生成了 50 个方向。你们一个怕改，一个怕慢。", en: "You're waiting on round 38. They already generated 50 directions with AI. One of you fears revisions, the other fears waiting." },
  },
  MEGO: {
    bestie: { zh: "Ta 放大 logo，你顺手把老板的 PPT 也排了。你们是甲方通讯录里置顶的两个人。", en: "They enlarge the logo, you also fix the boss's slides. You're the two pinned contacts in every client's phone." },
    enemy: { zh: "周五 17:58 你秒回“收到”，Ta 已经关机了。下周一的需求，最后都会落到你头上。", en: "Friday 5:58 PM, you reply “on it” instantly. They've already turned their phone off. Monday's requests all land on you." },
  },
  SHIP: {
    bestie: { zh: "你说先上线，Ta 已经让 AI 写好了 demo。你们俩的组合，一个下午能跑完别人一周的流程。", en: "You say ship it. They already had AI build the demo. Together you finish in an afternoon what takes others a week." },
    enemy: { zh: "你觉得歪 0.5px 用户看不出来，Ta 觉得这是原则问题。每次走查，你们都在吵同一件事。", en: "You think users can't see 0.5px. They think it's a matter of principle. Every QA session, you argue about the same thing." },
  },
  GHST: {
    bestie: { zh: "你们都守得住下班时间。Ta 的 Lorem ipsum 和你的已读不回，是职场里最稳定的边界感。", en: "You both protect your evenings. Their Lorem ipsum and your left-on-read are the most reliable boundaries in the office." },
    enemy: { zh: "Ta 周末也秒回甲方，让甲方觉得所有设计师都应该这样。你的边界感，就是被 Ta 一点点卷没的。", en: "They answer clients on weekends, so clients expect it from everyone. Your boundaries erode because of them." },
  },
  LORM: {
    bestie: { zh: "你们都不急：文案等运营给，消息明天再回。两个人一起，项目节奏刚刚好，就是有点慢。", en: "Neither of you rushes. Copy can wait for marketing, messages can wait till tomorrow. The pace is calm. Slightly slow." },
    enemy: { zh: "Ta 的组件要求真实数据才能测 Auto Layout，你的稿子里全是 Lorem ipsum。Ta 一打开就开始写评论。", en: "They need real data to test their Auto Layout. Your file is all Lorem ipsum. They start commenting the moment they open it." },
  },
  FNAL: {
    bestie: { zh: "你存 final_v3，Ta 改到第 37 版。你们都知道“最后一版”不存在，所以从来不会互相催。", en: "You save final_v3, they're on round 37. You both know the last version doesn't exist, so you never rush each other." },
    enemy: { zh: "Ta 看到你的文件命名会忍不住帮你重新整理，然后你就再也找不到任何东西了。", en: "They can't help reorganizing your filenames. After that, you can't find anything." },
  },
  COPY: {
    bestie: { zh: "你找来十张参考，Ta 当天就拼出一版上线。你们俩合作，从灵感到上线只要一杯咖啡的时间。", en: "You bring ten references, they ship a version that day. Inspiration to launch in one coffee." },
    enemy: { zh: "Ta 为了一个颜色能研究一晚上，你觉得“参考一下”就够了。Ta 看你的 moodboard 时，眉头一直没松开。", en: "They'll research one color all night. You think a reference is enough. They frown the whole time they look at your moodboard." },
  },
  VIBE: {
    bestie: { zh: "你让 AI 生成，Ta 直接上线。一个负责焦虑，一个负责不焦虑，刚好互补。", en: "You generate it with AI, they ship it. One of you worries, the other doesn't. A perfect fit." },
    enemy: { zh: "你一晚上能生成 50 个方向，Ta 只想要甲方确认第 38 版。你越快，Ta 越崩溃。", en: "You can generate 50 directions in a night. They just want round 38 approved. The faster you go, the more they despair." },
  },
};

export const TYPE_ORDER: TypeCode[] = [
  "PIXL", "AUTO", "BLCK", "LOGO", "UNDO", "MEGO",
  "SHIP", "GHST", "LORM", "FNAL", "COPY", "VIBE",
];

/** Four MBTI-style axes. Positive = left pole. */
export const AXES: { left: T2; right: T2 }[] = [
  { left: { zh: "像素", en: "Pixel" }, right: { zh: "交付", en: "Ship" } },
  { left: { zh: "顺从", en: "Yes" }, right: { zh: "硬刚", en: "No" } },
  { left: { zh: "秩序", en: "Order" }, right: { zh: "混沌", en: "Chaos" } },
  { left: { zh: "在线", en: "Online" }, right: { zh: "下线", en: "Offline" } },
];

export type Axis4 = [number, number, number, number];

export interface Effect {
  t?: Partial<Record<TypeCode, number>>;
  a?: Partial<Axis4>;
  log: T2;
}

/** Filename classifier for Q3. Plain rules, no model. */
export function classifyFilename(raw: string): { label: T2; effect: Omit<Effect, "log"> } {
  const name = raw.trim();
  const lower = name.toLowerCase();
  if (!name || /^(untitled|未命名|新建|副本|copy of)/i.test(name) || /untitled|未命名/.test(lower)) {
    return { label: { zh: "Untitled 流", en: "Untitled school" }, effect: { t: { LORM: 3, SHIP: 1 }, a: [-1, 0, -1, -1] } };
  }
  const finals = (lower.match(/final|最终|定稿|终稿/g) || []).length;
  if (finals > 0) {
    return {
      label: finals > 1 ? { zh: "final 套娃流", en: "final_final school" } : { zh: "final 流", en: "final school" },
      effect: { t: { FNAL: finals > 1 ? 5 : 4, UNDO: 1 }, a: [0, 1, -2, 1] },
    };
  }
  if (/改|修改|改版|新版|再改|edit|revis|fix|new|latest/i.test(name)) {
    return { label: { zh: "改稿日记流", en: "revision diary" }, effect: { t: { UNDO: 3, MEGO: 1 }, a: [0, 2, -1, 1] } };
  }
  if (/v\d+|\d{6,8}|_\d{1,2}\.\d|@\d+x/i.test(lower) && /[_\-\s.]/.test(name)) {
    return { label: { zh: "规范版本号流", en: "proper versioning" }, effect: { t: { AUTO: 3, PIXL: 1 }, a: [1, 0, 2, 0] } };
  }
  const letters = lower.replace(/[^a-z]/g, "");
  const keyRuns = /(asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwer|wert|erty|rtyu|tyui|yuio|uiop|zxcv|xcvb|cvbn|vbnm|aaaa|jjjj|kkkk)/;
  const vowels = (letters.match(/[aeiou]/g) || []).length;
  if (letters.length >= 4 && (keyRuns.test(letters) || vowels / letters.length < 0.15)) {
    return { label: { zh: "键盘乱敲流", en: "keyboard smash" }, effect: { t: { VIBE: 2, SHIP: 1, LORM: 1 }, a: [-1, -1, -2, 0] } };
  }
  if (/(sheji|gaigao|zuizhong|xin|jiu|haibao|banner|zhuye|shouye)/.test(lower) && !/\s/.test(name)) {
    return { label: { zh: "拼音流", en: "pinyin school" }, effect: { t: { MEGO: 2, UNDO: 1 }, a: [0, 1, -1, 0] } };
  }
  return { label: { zh: "正常人命名", en: "sane naming" }, effect: { t: { AUTO: 1, PIXL: 1 }, a: [1, 0, 1, 0] } };
}

export interface Result {
  type: TypeInfo;
  scores: Record<TypeCode, number>;
  axes: Axis4; // 0–100, percent toward the left pole
  log: T2[];
}

export function computeResult(effects: Effect[], hiddenFixedAt: number | null): Result {
  const scores = Object.fromEntries(TYPE_ORDER.map((c) => [c, 0])) as Record<TypeCode, number>;
  const axes: Axis4 = [0, 0, 0, 0];
  const all = [...effects];
  if (hiddenFixedAt !== null) all.push({ t: { PIXL: 2 }, a: [2, 0, 1, 0], log: { zh: "", en: "" } });
  for (const e of all) {
    for (const [k, v] of Object.entries(e.t ?? {})) scores[k as TypeCode] += v ?? 0;
    e.a?.forEach((v, i) => { axes[i] += v ?? 0; });
  }
  let best: TypeCode = "SHIP";
  let bestScore = -Infinity;
  // ties go to the rarer type
  const TIE: TypeCode[] = ["MEGO", "GHST", "FNAL", "LORM", "UNDO", "LOGO", "COPY", "VIBE", "SHIP", "BLCK", "AUTO", "PIXL"];
  for (const c of TIE) {
    if (scores[c] > bestScore) { best = c; bestScore = scores[c]; }
  }
  const pct = axes.map((v) => Math.round(Math.max(6, Math.min(94, 50 + (v / 8) * 50)))) as Axis4;
  return { type: TYPES[best], scores, axes: pct, log: effects.map((e) => e.log).filter((l) => l.zh) };
}

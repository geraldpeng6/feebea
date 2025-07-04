/**
 * Configuration and Content Data
 * Centralized storage for all text content and settings
 */

const CONFIG = {
    // Site metadata
    site: {
        title: "FEEBEA - A Color Story",
        description: "A tribute to those I love",
        author: "Peng",
        email: "pjlpcc@qq.com",
        wechat: "wx3dot1415926"
    },

    // Color information
    color: {
        hex: "#feebea",
        rgb: "rgb(254, 235, 234)",
        hsl: "hsl(3, 91%, 96%)",
        name: "Feebea"
    },

    // Main content in both languages
    content: {
        en: {
            title: "Feebea",
            subtitle: "",
            tribute: "To Those I Love",
            meditation: `"Sometimes, it's difficult even for me<br />
                to understand what I've become.<br />
                And harder still to remember what I once was.<br />
                The blue of the tiles...<br />
                Zima Blue, the manufacturer called it.<br />
                The first thing I ever saw.<br />
                This was where I began.<br />
                A crude little machine with<br />
                barely enough intelligence to steer itself.<br />
                But it was my world.<br />
                It was all I knew, all I needed to know.<br />
                And now?<br />
                I will immerse myself.<br />
                And as I do, I will slowly shut down my higher brain functions...<br />
                un-making myself...<br />
                leaving just enough to appreciate my surroundings...<br />
                to extract some simple pleasure<br />
                from the execution of a task well done.<br />
                My search for truth is finished at last.<br />
                I'm going home."`,
            phoebeTitle: "Phoebe's Wisdom",
            phoebeQuote: "NO, YOU ARE THE BOSS OF YOU!",
            finalText: "Peng"
        },
        zh: {
            title: "Feebea",
            subtitle: "",
            tribute: "致那些我所热爱的",
            meditation: `"Sometimes, it's difficult even for me<br />
                有时候 连我自己都很难理解<br />
                to understand what I've become.<br />
                我到底成为了什么<br />
                And harder still to remember what I once was.<br />
                更难记清楚我曾经是什么样子<br />
                The blue of the tiles...<br />
                瓷砖的蓝色<br />
                Zima Blue, the manufacturer called it.<br />
                齐马蓝 制作商这样称呼<br />
                The first thing I ever saw.<br />
                我见到的第一件物品<br />
                This was where I began.<br />
                一切从这里开始<br />
                A crude little machine with<br />
                一个简陋的小机器<br />
                barely enough intelligence to steer itself.<br />
                几乎没有足够智能操控自己<br />
                But it was my world.<br />
                但那是我的世界<br />
                It was all I knew, all I needed to know.<br />
                是我了解的一切 也是我需要了解的一切<br />
                And now?<br />
                现在呢<br />
                I will immerse myself.<br />
                我将浸入泳池<br />
                And as I do, I will slowly shut down my higher brain functions...<br />
                与此同时 我会逐渐关闭我的高级脑功能<br />
                un-making myself...<br />
                拆解自己<br />
                leaving just enough to appreciate my surroundings...<br />
                只留下必要的组件来欣赏周围环境<br />
                to extract some simple pleasure<br />
                从高效完成任务中<br />
                from the execution of a task well done.<br />
                感受简单的愉悦<br />
                My search for truth is finished at last.<br />
                我对真相的探索终于结束了<br />
                I'm going home."<br />
                我要回家了`,
            phoebeTitle: "菲比的智慧",
            phoebeQuote: "NO, YOU ARE THE BOSS OF YOU!",
            finalText: "Peng"
        }
    },

    // Quote sections data
    quotes: {
        himym: {
            en: [
                {
                    text: "My search for truth is finished at last. I'm going home.",
                    author: "Zima Blue"
                }
            ],
            zh: [
                {
                    text: "我对真相的探索终于结束了。我要回家了。",
                    author: "齐马蓝"
                }
            ]
        }
    },

    // Essence cards data
    essenceCards: {
        en: [
            {
                title: "The night is dark and full of terrors",
                desc: "Game of Thrones"
            },
            {
                title: "I have a hangover. A hangover with a hangover",
                desc: "Black Books"
            },
            {
                title: "Life is a beautiful robe crawling with lice",
                desc: "Zhang Ailing"
            },
            {
                title: "Sometimes you have to run before you can walk",
                desc: "Iron Man"
            }
        ],
        zh: [
            {
                title: "长夜漫漫，处处险恶",
                desc: "权力的游戏"
            },
            {
                title: "我宿醉了。比宿醉还醉的宿醉",
                desc: "布莱克书店"
            },
            {
                title: "人生是一袭华美的袍，爬满了虱子",
                desc: "张爱玲"
            },
            {
                title: "有时候你必须先跑起来，才能学会走路",
                desc: "钢铁侠"
            }
        ]
    },

    // Navigation items
    navigation: [
        { id: "header", tooltip: "Top" },
        { id: "color-display", tooltip: "Color" },
        { id: "quote-section", tooltip: "Quote" },
        { id: "meditation", tooltip: "Meditation" },
        { id: "essence", tooltip: "Essence" },
        { id: "phoebe-section", tooltip: "Phoebe" }
    ],

    // Easter egg settings
    easterEggs: {
        triggerThreshold: 3,
        maxTriggers: 3,
        cooldownTime: 500
    },

    // Animation settings
    animations: {
        fadeInDuration: 2000,
        fadeInUpDuration: 2000,
        fadeInUpDelay: 1000,
        transitionDuration: 300,
        pulseInterval: 3000
    },

    // Responsive breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
        large: 1400
    },

    // Audio settings
    audio: {
        defaultVolume: 0.7,
        fadeInDuration: 1000,
        fadeOutDuration: 500
    }
};

// Export configuration
window.CONFIG = CONFIG;

// Helper functions to get content based on current language
window.getContent = function(key, lang = null) {
    const currentLang = lang || (window.languageManager ? window.languageManager.getCurrentLanguage() : 'en');
    const content = CONFIG.content[currentLang];
    return content ? content[key] : CONFIG.content.en[key];
};

window.getQuotes = function(section = 'himym', lang = null) {
    const currentLang = lang || (window.languageManager ? window.languageManager.getCurrentLanguage() : 'en');
    const quotes = CONFIG.quotes[section];
    return quotes ? quotes[currentLang] : CONFIG.quotes.himym.en;
};

window.getEssenceCards = function(lang = null) {
    const currentLang = lang || (window.languageManager ? window.languageManager.getCurrentLanguage() : 'en');
    return CONFIG.essenceCards[currentLang] || CONFIG.essenceCards.en;
};

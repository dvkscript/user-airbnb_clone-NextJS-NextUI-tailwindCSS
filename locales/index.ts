import 'server-only';

const dictionaries = {
    en: () => import("./en").then((module) => module.default),
    vi: () => import("./vi").then((module) => module.default),
}

export default dictionaries
export const generateId = (prefix = 'id_') => {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createEmptyRow = (limitCount) => {
    return {
        origin: "",
        dest: "",
        rates: new Array(limitCount).fill(null)
    };
};

export const DEFAULT_LIMITS = [50, 100, 150, 500];

export const MODEL_KEYS = [
    'fixed', 'minFixed', 'flat', 'cumulative',
    'minCumulative', 'excess', 'minExcess'
];

// NEW: Display Names Mapping
export const MODEL_LABELS = {
    fixed: "Fixed Bracket Pricing",
    minFixed: "Minimum Fixed Bracket Pricing",
    flat: "Flat Bracket Pricing",
    cumulative: "Cumulative Bracket Pricing",
    minCumulative: "Minimum Cumulative Bracket Pricing",
    excess: "Excess Bracket Pricing",
    minExcess: "Minimum Excess Bracket Pricing"
};

export const createFreshClientStore = () => {
    let store = {};
    MODEL_KEYS.forEach(key => {
        const pid = generateId('p_');
        const initialLimits = [...DEFAULT_LIMITS];

        store[key] = {
            activeId: pid,
            profiles: {}
        };

        store[key].profiles[pid] = {
            name: "Standard Table",
            limits: initialLimits,
            rows: [createEmptyRow(initialLimits.length)]
        };
    });
    return store;
};
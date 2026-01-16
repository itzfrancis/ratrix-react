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

// CHANGED: Default now starts with a single column "0" (Renders as 1-0)
export const DEFAULT_LIMITS = [0];

// CHANGED: Excess now starts with Base "0" and Excess Placeholder
export const EXCESS_DEFAULTS = [0, 999999];

export const MODEL_KEYS = [
    'fixed', 
    'minFixed', 
    'flat', 
    'cumulative', 
    'minCumulative', 
    'excess', 
    'minExcess'
];

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
        store[key] = {
            activeId: null,
            profiles: {}
        };
    });
    return store;
};
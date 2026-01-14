export const isValid = (val) => val !== null && val !== "" && !isNaN(val);

export const getBracketIndex = (w, limits) => {
    const effectiveWeight = Math.floor(w);
    for (let i = 0; i < limits.length; i++) {
        if (effectiveWeight <= limits[i]) return i;
    }
    return -1;
};

export const strategies = {
    fixed: (w, rates, limits) => {
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null; 
        return w * rates[index];
    },
    flat: (w, rates, limits) => {
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null;
        return rates[index];
    },
    minFixed: (w, rates, limits) => {
        if (w <= limits[0]) return isValid(rates[0]) ? rates[0] : null;
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null;
        return w * rates[index];
    },
    cumulative: (w, rates, limits) => {
        let total = 0;
        let remaining = w;
        let prevMax = 0;
        for (let i = 0; i < limits.length; i++) {
            if (!isValid(rates[i])) return null; 
            const capacity = limits[i] - prevMax;
            const fill = Math.min(remaining, capacity);
            if (fill > 0) {
                total += fill * rates[i];
                remaining -= fill;
            }
            prevMax = limits[i];
            if (remaining <= 0) break;
        }
        return remaining > 0 ? null : total; 
    },
    minCumulative: (w, rates, limits) => {
        let total = 0;
        let remaining = w;
        let prevMax = 0;
        for (let i = 0; i < limits.length; i++) {
            if (!isValid(rates[i])) return null;
            const capacity = limits[i] - prevMax;
            const fill = Math.min(remaining, capacity);
            if (fill > 0) {
                if (i === 0) total += rates[0]; 
                else total += fill * rates[i];
                remaining -= fill;
            }
            prevMax = limits[i];
            if (remaining <= 0) break;
        }
        return remaining > 0 ? null : total;
    },
    minExcess: (w, rates, limits) => {
        if (!isValid(rates[0]) || !isValid(rates[1])) return null;
        const limit = limits[0]; 
        const baseFlat = rates[0];      
        const excessRate = rates[1];     
        if (w <= limit) return baseFlat;
        return baseFlat + ((w - limit) * excessRate);
    },
    excess: (w, rates, limits) => {
        if (!isValid(rates[0]) || !isValid(rates[1])) return null;
        const limit = limits[0]; 
        const baseRate = rates[0];       
        const excessRate = rates[1];     
        if (w <= limit) return w * baseRate;
        return (limit * baseRate) + ((w - limit) * excessRate);
    }
};
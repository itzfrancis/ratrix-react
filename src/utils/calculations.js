// Helper to check if a value is a valid number
export const isValid = (val) => val !== null && val !== "" && !isNaN(val);

// Helper to find which bracket the total weight falls into
export const getBracketIndex = (w, limits) => {
    // Some logic prefers floor, but generally comparison is direct
    // Using simple comparison to match standard ranges (e.g., 50.5 is > 50)
    for (let i = 0; i < limits.length; i++) {
        if (w <= limits[i]) return i;
    }
    return -1; // Exceeds all defined fixed brackets
};

export const strategies = {
    // 1. FIXED: Weight * Rate
    fixed: (w, rates, limits) => {
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null;
        return w * rates[index];
    },

    // 2. MINIMUM FIXED: 1st Bracket is Flat, Others are Weight * Rate
    minFixed: (w, rates, limits) => {
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null;
        
        // If it's the first bracket (Index 0), use Flat Rate
        if (index === 0) {
            return rates[0];
        }
        
        // Otherwise, use Weight * Rate
        return w * rates[index];
    },

    // 3. FLAT: Just the Rate (No multiplication)
    flat: (w, rates, limits) => {
        const index = getBracketIndex(w, limits);
        if (index === -1 || !isValid(rates[index])) return null;
        return rates[index];
    },

    // 4. CUMULATIVE: Split weight across brackets, multiply each chunk
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

        // If weight remains but no more brackets, usually strictly invalid or free? 
        // Based on screenshots, we assume it must fit in brackets. 
        // Returning null if exceeds strict limits implies "Over Limit".
        return remaining > 0.001 ? null : total;
    },

    // 5. MINIMUM CUMULATIVE: 1st Bracket Flat, Rest Cumulative
    minCumulative: (w, rates, limits) => {
        let total = 0;
        let remaining = w;
        let prevMax = 0;

        for (let i = 0; i < limits.length; i++) {
            if (!isValid(rates[i])) return null;

            const capacity = limits[i] - prevMax;
            const fill = Math.min(remaining, capacity);

            if (fill > 0) {
                if (i === 0) {
                    // First bracket is FLAT Base Rate
                    total += rates[0];
                } else {
                    // Subsequent brackets are Weight * Rate
                    total += fill * rates[i];
                }
                remaining -= fill;
            }

            prevMax = limits[i];
            if (remaining <= 0) break;
        }

        return remaining > 0.001 ? null : total;
    },

    // 6. EXCESS: (Base * BaseRate) + (Excess * ExcessRate)
    excess: (w, rates, limits) => {
        // Needs at least 2 rates: [0] = Base, [1] = Excess
        if (!isValid(rates[0]) || !isValid(rates[1])) return null;
        
        const baseLimit = limits[0]; // e.g., 50
        const baseRate = rates[0];   // e.g., 100
        const excessRate = rates[1]; // e.g., 95

        if (w <= baseLimit) {
            // Within base limit: Weight * Base Rate
            return w * baseRate;
        } else {
            // Exceeds base: (BaseLimit * BaseRate) + (ExcessWeight * ExcessRate)
            const excessWeight = w - baseLimit;
            return (baseLimit * baseRate) + (excessWeight * excessRate);
        }
    },

    // 7. MINIMUM EXCESS: BaseRate + (Excess * ExcessRate)
    minExcess: (w, rates, limits) => {
        // Needs at least 2 rates: [0] = Base, [1] = Excess
        if (!isValid(rates[0]) || !isValid(rates[1])) return null;
        
        const baseLimit = limits[0]; // e.g., 50
        const baseRate = rates[0];   // e.g., 4800 (FLAT)
        const excessRate = rates[1]; // e.g., 95

        if (w <= baseLimit) {
            // Within base limit: Flat Base Rate
            return baseRate;
        } else {
            // Exceeds base: Flat Base Rate + (ExcessWeight * ExcessRate)
            const excessWeight = w - baseLimit;
            return baseRate + (excessWeight * excessRate);
        }
    }
};
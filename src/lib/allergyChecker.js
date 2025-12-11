/**
 * Allergy Checker Utility
 * Checks if a food name might contain allergens based on user's allergy profile
 */

// Common allergen keywords mapping
const ALLERGEN_KEYWORDS = {
    'Peanuts': ['peanut', 'groundnut', 'arachis', 'mandelonas', 'satay', 'pad thai'],
    'Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut', 'chestnut', 'pine nut', 'praline', 'marzipan', 'nougat', 'gianduja', 'nut butter'],
    'Dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'whey', 'casein', 'lactose', 'ghee', 'curd', 'paneer', 'custard', 'ice cream', 'milkshake', 'latte', 'cappuccino', 'mocha', 'dairy'],
    'Eggs': ['egg', 'mayonnaise', 'mayo', 'meringue', 'omelette', 'omelet', 'frittata', 'quiche', 'custard', 'eggnog', 'albumin'],
    'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'tamari', 'soybean', 'soy sauce', 'soy milk'],
    'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'crawfish', 'scallop', 'clam', 'mussel', 'oyster', 'squid', 'calamari', 'octopus', 'shellfish', 'seafood'],
    'Gluten': ['wheat', 'bread', 'pasta', 'noodle', 'flour', 'cake', 'cookie', 'biscuit', 'cracker', 'cereal', 'barley', 'rye', 'oat', 'malt', 'seitan', 'couscous', 'bulgur', 'farro', 'spelt', 'semolina', 'gluten', 'croissant', 'bagel', 'pizza', 'sandwich', 'burger bun', 'tortilla', 'wrap', 'pancake', 'waffle'],
    'Fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'sardine', 'anchovy', 'mackerel', 'trout', 'bass', 'halibut', 'snapper', 'swordfish', 'catfish', 'herring', 'haddock', 'perch', 'flounder', 'fish sauce', 'worcestershire']
};

/**
 * Check if a food name contains potential allergens
 * @param {string} foodName - The name of the food to check
 * @param {string[]} userAllergies - Array of user's allergies (e.g., ['Peanuts', 'Dairy'])
 * @returns {{ hasAllergen: boolean, matchedAllergens: string[], matchedKeywords: string[] }}
 */
export function checkFoodForAllergens(foodName, userAllergies) {
    if (!foodName || !userAllergies || userAllergies.length === 0) {
        return { hasAllergen: false, matchedAllergens: [], matchedKeywords: [] };
    }

    const foodNameLower = foodName.toLowerCase();
    const matchedAllergens = [];
    const matchedKeywords = [];

    for (const allergy of userAllergies) {
        const keywords = ALLERGEN_KEYWORDS[allergy];
        if (!keywords) continue;

        for (const keyword of keywords) {
            if (foodNameLower.includes(keyword.toLowerCase())) {
                if (!matchedAllergens.includes(allergy)) {
                    matchedAllergens.push(allergy);
                }
                if (!matchedKeywords.includes(keyword)) {
                    matchedKeywords.push(keyword);
                }
            }
        }
    }

    return {
        hasAllergen: matchedAllergens.length > 0,
        matchedAllergens,
        matchedKeywords
    };
}

/**
 * Format allergen warning message
 * @param {string[]} matchedAllergens - Array of matched allergen names
 * @param {string[]} matchedKeywords - Array of matched keywords in the food
 * @returns {string}
 */
export function formatAllergenWarning(matchedAllergens, matchedKeywords) {
    if (matchedAllergens.length === 0) return '';

    const allergenList = matchedAllergens.join(', ');
    const keywordList = matchedKeywords.slice(0, 3).join(', ');

    return `⚠️ Allergy Warning: This food may contain ${allergenList}. Detected ingredients: ${keywordList}. Are you sure you want to log this meal?`;
}

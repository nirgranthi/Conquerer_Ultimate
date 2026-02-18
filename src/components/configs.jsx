const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#f40e6eff', '#14B8A6', '#4B5563'];
const neutralId = 11;
const playerId = 0;

const nodeCount = 40;
const minimumDistance = 70;
const maxPopulation = 200;
const playerGrowthRate = 1.5;
const troopSpeed = 2.8;
const troopSize = 4;
const nodeRadius = 24;
const aiStartDelay = 5;

const difficultyConfig = {
    easy: { aiInterval: 2000, aiAggression: 0.3, growthMod: 0.4 },
    medium: { aiInterval: 1000, aiAggression: 0.6, growthMod: 1.0 },
    hard: { aiInterval: 400, aiAggression: 0.95, growthMod: 1.2 }
};

export { colors, neutralId, playerId, nodeCount, minimumDistance, maxPopulation, playerGrowthRate, troopSpeed, troopSize, nodeRadius, aiStartDelay, difficultyConfig }

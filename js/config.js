export const API_BASE = 'https://api.github.com/repos/ZeroK-RTS/Zero-K/contents/units';

// Valid unit type prefixes
export const VALID_PREFIXES = [
    'amph', 'shield', 'cloak', 'gunship', 'jump', 
    'ship', 'hover', 'veh', 'tank', 'chicken', 
    'plane', 'spider', 'strider', 'turret'
];

// Numeric attributes that can be mutated
export const MUTABLE_ATTRIBUTES = [
    'speed', 'metalCost', 'range', 'reloadtime',
    'default', 'areaOfEffect', 'health', 'shieldPower',
    'shieldPowerRegen', 'buildDistance', 'turnRate',
    'acceleration', 'buildTime', 'energyCost', 'sightDistance',
    'impulseFactor', 'weaponVelocity'
];

// Attributes where a higher value is worse (will be reversed in mutations)
export const REVERSED_ATTRIBUTES = [
    'metalCost',
    'reloadtime',
    'buildTime',
    'energyCost'
];

export const MUTATION_THEMES = {
    "Speed Kills": ["speed", "turnRate", "reloadtime"],
    "Tanky": ["health", "shieldPower", "metalCost"],
    "Economic": ["metalCost", "buildTime"],
    "Glass Cannon": ["default", "weaponVelocity", "health"],
    "Artillery": ["range", "areaOfEffect"],
    "Fast & Furious": ["speed", "acceleration"],
    "Resource Hog": ["metalCost", "energyCost"],
    "Scout": ["sightDistance", "speed"],
    "Heavy Hitter": ["default", "impulseFactor"],
    "Fortress": ["health", "range"]
};

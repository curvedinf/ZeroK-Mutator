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
    "Speed Kills": {
        positive_attributes: ["speed", "turnRate"],
        negative_attributes: ["reloadtime"]
    },
    "Tanky": {
        positive_attributes: ["health", "shieldPower"],
        negative_attributes: ["metalCost"]
    },
    "Economic": {
        positive_attributes: [],
        negative_attributes: ["metalCost", "buildTime"]
    },
    "Glass Cannon": {
        positive_attributes: ["default", "weaponVelocity", "health"],
        negative_attributes: []
    },
    "Artillery": {
        positive_attributes: ["range", "areaOfEffect"],
        negative_attributes: []
    },
    "Fast & Furious": {
        positive_attributes: ["speed", "acceleration"],
        negative_attributes: []
    },
    "Resource Hog": {
        positive_attributes: [],
        negative_attributes: ["metalCost", "energyCost"]
    },
    "Scout": {
        positive_attributes: ["sightDistance", "speed"],
        negative_attributes: []
    },
    "Heavy Hitter": {
        positive_attributes: ["default", "impulseFactor"],
        negative_attributes: []
    },
    "Fortress": {
        positive_attributes: ["health", "range"],
        negative_attributes: []
    }
};

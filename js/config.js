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
    'shieldPowerRegen', 'buildDistance'
];

// Attributes where a higher value is worse (will be reversed in mutations)
export const REVERSED_ATTRIBUTES = [
    'metalCost',
    'reloadtime',
];

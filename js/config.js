export const API_BASE = 'https://api.github.com/repos/ZeroK-RTS/Zero-K/contents/units';

// Valid unit type prefixes
export const VALID_PREFIXES = [
    'amph', 'shield', 'cloak', 'gunship', 'jump', 
    'ship', 'hover', 'veh', 'tank', 'chicken', 
    'plane', 'spider'
];

// Numeric attributes that can be mutated
export const MUTABLE_ATTRIBUTES = [
    'speed', 'metalCost', 'range', 'reloadtime',
    'damage', 'areaOfEffect', 'health', 'shield',
];

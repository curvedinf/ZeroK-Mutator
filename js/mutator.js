import { MUTABLE_ATTRIBUTES, REVERSED_ATTRIBUTES, VALID_PREFIXES } from './config.js';

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, part) => current && current[part], obj);
}

// Helper to get the factory type of a unit
function getFactoryType(unitName) {
    const prefix = VALID_PREFIXES.find(prefix => unitName.toLowerCase().startsWith(prefix));
    return prefix || 'other';
}

// Helper to group units by factory type
function groupUnitsByFactory(unitData) {
    const groups = {};
    
    for (const [unitName, unit] of Object.entries(unitData)) {
        const factoryType = getFactoryType(unitName);
        if (!groups[factoryType]) {
            groups[factoryType] = [];
        }
        groups[factoryType].push([unitName, unit]);
    }
    
    return groups;
}

// Helper to randomly select N items from an array
function selectRandomUnits(units, count) {
    const selected = new Set();
    const shuffled = [...units];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
}

function findMutableAttributes(unitData, prefix = '') {
    const attributes = [];
    
    // Helper to check if a key is in MUTABLE_ATTRIBUTES
    const isValidAttribute = (key) => {
        const isValid = MUTABLE_ATTRIBUTES.includes(key);
        console.log(`Checking if ${key} is valid: ${isValid}`);
        return isValid;
    };
    
    // Helper to process a value at a path
    const processValue = (value, path, key) => {
        console.log(`Processing path: ${path}, key: ${key}, value type: ${typeof value}`);
        
        if (typeof value === 'object' && value !== null) {
            // Handle nested objects
            console.log(`Traversing object at path: ${path}`);
            for (const [k, v] of Object.entries(value)) {
                const newPath = path ? `${path}.${k}` : k;
                console.log(`-> Going into nested path: ${newPath}`);
                processValue(v, newPath, k);
            }
        } else if (typeof value === 'number') {
            // Check if this is a valid attribute
            const pathParts = path.split('.');
            const parentPath = pathParts.length > 1 ? pathParts[0] : '';
            
            // For weapon attributes, check if parent is weaponDefs
            if (parentPath === 'weaponDefs' && isValidAttribute(key)) {
                console.log(`Found valid weapon attribute: ${path} = ${value}`);
                attributes.push([path, value]);
            }
            // For non-weapon attributes, check if key is valid and we're at root level
            else if (pathParts.length === 1 && isValidAttribute(key)) {
                console.log(`Found valid numeric attribute: ${key} = ${value}`);
                attributes.push([key, value]);
            }
        }
    };
    
    // Start processing from root
    console.log('Starting attribute search...');
    processValue(unitData, '', '');
    console.log('Found attributes:', attributes);
    
    return attributes;
}

function setNestedValue(obj, path, value) {
    // If it's a weapon path, handle it with nesting
    if (path.startsWith('weaponDefs.')) {
        console.log(`Setting nested weapon value: ${path} = ${value}`);
        const parts = path.split('.');
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current)) {
                current[part] = {};
            }
            current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
    } else {
        // For non-weapon attributes, set at root level
        obj[path] = value;
    }
}

function mutateUnit(unitData, multiplier, nerfRatio) {
    console.log('Starting unit mutation...');
    console.log('MUTABLE_ATTRIBUTES:', MUTABLE_ATTRIBUTES);
    console.log('Multiplier:', multiplier, 'Nerf Ratio:', nerfRatio);
    
    // Get all mutable attributes including nested ones
    const numericAttributes = findMutableAttributes(unitData);
    console.log('All found mutable attributes:', numericAttributes);
    
    if (numericAttributes.length < 2) {
        console.log('Not enough mutable attributes found');
        return null;
    }
    
    // Randomly select two different attributes
    const indices = new Set();
    while (indices.size < 2) {
        indices.add(Math.floor(Math.random() * numericAttributes.length));
    }
    
    const selectedAttrs = Array.from(indices).map(i => numericAttributes[i]);
    console.log('Selected attributes for mutation:', selectedAttrs);
    
    // Create mutation object
    const mutations = {};
    
    // Helper to get the key from a path for checking reversed attributes
    const getKey = (path) => {
        const parts = path.split('.');
        return parts[parts.length - 1];
    };
    
    // For each selected attribute, apply the appropriate multiplier
    selectedAttrs.forEach(([path, value], index) => {
        const key = getKey(path);
        const isReversed = REVERSED_ATTRIBUTES.includes(key);
        
        // Calculate the actual multipliers based on nerfRatio
        let buffMultiplier, nerfMultiplier;
        if (nerfRatio <= 0) {
            // Both attributes are buffs
            buffMultiplier = multiplier;
            nerfMultiplier = 1 / multiplier;
        } else {
            // One buff, one nerf with ratio
            buffMultiplier = multiplier;
            nerfMultiplier = Math.pow(multiplier, nerfRatio);
        }
        
        if (index === 0) {
            // First attribute gets buffed
            const actualMultiplier = isReversed ? 1 / buffMultiplier : buffMultiplier;
            setNestedValue(mutations, path, value * actualMultiplier);
        } else {
            // Second attribute gets nerfed (or buffed if nerfRatio <= 0)
            const actualMultiplier = isReversed ? nerfMultiplier : 1 / nerfMultiplier;
            setNestedValue(mutations, path, value * actualMultiplier);
        }
    });
    
    console.log('Generated mutations:', mutations);
    return mutations;
}

export function generateMutations(unitData, multiplier = 2.0, nerfRatio = 1.0, unitsPerFactory = 1.0) {
    console.log('Starting mutation generation for all units...');
    console.log('Using multiplier:', multiplier, 'nerf ratio:', nerfRatio, 'units per factory:', unitsPerFactory);
    
    // Group units by factory type
    const factoryGroups = groupUnitsByFactory(unitData);
    
    // Process each factory group
    const allMutations = {};
    for (const [factoryType, units] of Object.entries(factoryGroups)) {
        console.log(`\nProcessing factory type: ${factoryType} with ${units.length} units`);
        
        // Calculate how many units to modify from this factory
        const unitsToModify = Math.max(1, Math.ceil(units.length * unitsPerFactory));
        console.log(`Will modify ${unitsToModify} units from ${factoryType}`);
        
        // Randomly select units to modify
        const selectedUnits = selectRandomUnits(units, unitsToModify);
        
        // Generate mutations for selected units
        for (const [unitName, unit] of selectedUnits) {
            console.log(`Processing unit: ${unitName}`);
            const mutations = mutateUnit(unit, multiplier, nerfRatio);
            if (mutations) {
                console.log(`Added mutations for ${unitName}:`, mutations);
                allMutations[unitName] = mutations;
            }
        }
    }
    
    console.log('\nFinal mutations:', allMutations);
    return allMutations;
}

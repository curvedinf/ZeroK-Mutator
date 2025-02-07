import { MUTABLE_ATTRIBUTES } from './config.js';

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, part) => current && current[part], obj);
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

function mutateUnit(unitData, multiplier) {
    console.log('Starting unit mutation...');
    console.log('MUTABLE_ATTRIBUTES:', MUTABLE_ATTRIBUTES);
    
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
    
    // Multiply first attribute by multiplier
    setNestedValue(mutations, selectedAttrs[0][0], selectedAttrs[0][1] * multiplier);
    
    // Divide second attribute by multiplier
    setNestedValue(mutations, selectedAttrs[1][0], selectedAttrs[1][1] / multiplier);
    
    console.log('Generated mutations:', mutations);
    return mutations;
}

export function generateMutations(unitData, multiplier = 2.0) {
    console.log('Starting mutation generation for all units...');
    const allMutations = {};
    for (const [unitName, unit] of Object.entries(unitData)) {
        console.log(`\nProcessing unit: ${unitName}`);
        const mutations = mutateUnit(unit, multiplier);
        if (mutations) {
            console.log(`Added mutations for ${unitName}:`, mutations);
            allMutations[unitName] = mutations;
        }
    }
    console.log('\nFinal mutations:', allMutations);
    return allMutations;
}

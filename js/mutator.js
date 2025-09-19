import { MUTABLE_ATTRIBUTES, REVERSED_ATTRIBUTES, VALID_PREFIXES, MUTATION_THEMES } from './config.js';

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, part) => current && current[part], obj);
}

function getFactoryType(unitName) {
    const prefix = VALID_PREFIXES.find(prefix => unitName.toLowerCase().startsWith(prefix));
    return prefix || 'other';
}

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

function selectRandomUnits(units, count) {
    const shuffled = [...units];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function findMutableAttributes(unitData, theme) {
    const attributes = [];
    const targetAttributes = theme ? MUTATION_THEMES[theme] : MUTABLE_ATTRIBUTES;

    const isValidAttribute = (key) => {
        return targetAttributes.includes(key);
    };

    const processValue = (value, path, key) => {
        if (typeof value === 'object' && value !== null) {
            for (const [k, v] of Object.entries(value)) {
                const newPath = path ? `${path}.${k}` : k;
                processValue(v, newPath, k);
            }
        } else if (typeof value === 'number') {
            const pathParts = path.split('.');
            const parentPath = pathParts.length > 1 ? pathParts[0] : '';
            const attrKey = pathParts[pathParts.length -1];

            if (parentPath === 'weaponDefs' && isValidAttribute(attrKey)) {
                attributes.push([path, value]);
            }
            else if (pathParts.length === 1 && isValidAttribute(attrKey)) {
                attributes.push([key, value]);
            }
        }
    };
    
    processValue(unitData, '', '');
    return attributes;
}

function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}

function mutateUnit(unitData, { multiplier, attributesPerUnit, theme }) {
    const numericAttributes = findMutableAttributes(unitData, theme);

    if (numericAttributes.length < attributesPerUnit) {
        return null;
    }

    const selectedAttrs = selectRandomUnits(numericAttributes, attributesPerUnit);
    const mutations = {};

    const getKey = (path) => path.split('.').pop();

    selectedAttrs.forEach(([path, value], index) => {
        const key = getKey(path);
        const isReversed = REVERSED_ATTRIBUTES.includes(key);
        
        let actualMultiplier;
        if (index % 2 === 0) { // Buff
            actualMultiplier = isReversed ? 1 / multiplier : multiplier;
        } else { // Nerf
            actualMultiplier = isReversed ? multiplier : 1 / multiplier;
        }
        setNestedValue(mutations, path, value * actualMultiplier);
    });

    return mutations;
}

export function generateMutations(unitData, options) {
    const { multiplier, attributesPerUnit, unitsPerFactory, mutationMode, selectedThemes } = options;
    
    const factoryGroups = groupUnitsByFactory(unitData);
    const allMutations = {};

    for (const [factoryType, units] of Object.entries(factoryGroups)) {
        const unitsToModify = Math.max(1, Math.ceil(units.length * unitsPerFactory));
        const selectedUnits = selectRandomUnits(units, unitsToModify);

        for (const [unitName, unit] of selectedUnits) {
            let theme = null;
            if (mutationMode === 'theme') {
                theme = selectedThemes[Math.floor(Math.random() * selectedThemes.length)];
            }

            const mutations = mutateUnit(unit, { multiplier, attributesPerUnit, theme });
            if (mutations) {
                allMutations[unitName] = mutations;
            }
        }
    }
    
    return allMutations;
}

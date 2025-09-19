export function parseLuaTable(content) {
    // Remove comments and normalize whitespace while preserving newlines
    content = content.replace(/--.*$/gm, '')
                   .replace(/\s+/g, ' ')
                   .trim();

    // Remove the "return" statement if present
    content = content.replace(/^return\s*/, '');

    function parseValue(value) {
        // Handle numbers
        if (/^-?\d+\.?\d*$/.test(value)) {
            return parseFloat(value);
        }
        // Handle booleans
        if (value === 'true') return true;
        if (value === 'false') return false;
        // Handle strings (with or without quotes)
        if (value.startsWith('"') || value.startsWith("'")) {
            return value.slice(1, -1);
        }
        return value;
    }

    function findMatchingBrace(str, startPos) {
        let depth = 1;
        let pos = startPos;
        
        while (depth > 0 && pos < str.length) {
            if (str[pos] === '{') depth++;
            if (str[pos] === '}') depth--;
            pos++;
        }
        
        return pos;
    }

    function parseTableContent(tableStr) {
        const result = {};
        let pos = 0;
        
        while (pos < tableStr.length) {
            // Skip whitespace and commas
            while (pos < tableStr.length && /[\s,]/.test(tableStr[pos])) pos++;
            if (pos >= tableStr.length) break;

            // Find key
            let keyEnd = tableStr.indexOf('=', pos);
            if (keyEnd === -1) break;
            
            const key = tableStr.slice(pos, keyEnd).trim();
            pos = keyEnd + 1;

            // Skip whitespace after equals
            while (pos < tableStr.length && /\s/.test(tableStr[pos])) pos++;
            
            let value;
            if (tableStr[pos] === '{') {
                // Handle nested table
                const tableEnd = findMatchingBrace(tableStr, pos + 1);
                const nestedTableStr = tableStr.slice(pos + 1, tableEnd - 1);
                value = parseTableContent(nestedTableStr);
                pos = tableEnd;
            } else {
                // Handle simple value
                let valueEnd = pos;
                while (valueEnd < tableStr.length && 
                       tableStr[valueEnd] !== ',' && 
                       tableStr[valueEnd] !== '}') {
                    valueEnd++;
                }
                const valueStr = tableStr.slice(pos, valueEnd).trim();
                value = parseValue(valueStr);
                pos = valueEnd;
            }

            // Clean the key (remove quotes if present)
            const cleanKey = key.replace(/["']/g, '');
            result[cleanKey] = value;
        }

        return result;
    }

    // Find the main table
    const mainTableMatch = content.match(/\{([^]*)\}$/);
    if (!mainTableMatch) return null;

    // Parse the outer table structure (unit name and its definition)
    const outerResult = parseTableContent(mainTableMatch[1]);
    
    return outerResult;
}

export function generateLuaTable(data) {
    if (Object.keys(data).length === 0) {
        return 'return {}';
    }

    function stringifyValue(value) {
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'object' && value !== null) {
            return stringifyTable(value);
        }
        return `"${value}"`;
    }

    function stringifyTable(table) {
        const parts = [];
        for (const [key, value] of Object.entries(table)) {
            const keyStr = `["${key}"]`;
            parts.push(`${keyStr} = ${stringifyValue(value)}`);
        }
        return `{${parts.join(', ')}}`;
    }

    return `return ${stringifyTable(data)}`;
}

export function base64Encode(str) {
    // Use built-in btoa function, but first encode UTF-8 properly
    return btoa(unescape(encodeURIComponent(str)));
}

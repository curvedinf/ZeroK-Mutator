import { API_BASE, VALID_PREFIXES } from './config.js';
import { parseLuaTable } from './parser.js';

export async function fetchUnitFiles() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to fetch unit directory');
        const files = await response.json();
        
        // Filter for .lua files with valid prefixes
        return files.filter(file => {
            if (!file.name.endsWith('.lua')) return false;
            const unitName = file.name.replace('.lua', '').toLowerCase();
            return VALID_PREFIXES.some(prefix => unitName.startsWith(prefix));
        });
    } catch (error) {
        console.error('Error fetching unit files:', error);
        throw error;
    }
}

export async function fetchUnitContent(file) {
    try {
        const response = await fetch(file.download_url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${file.name}:`, error);
        throw error;
    }
}

export async function fetchAllUnits() {
    const unitFiles = await fetchUnitFiles();
    
    const promises = unitFiles.map(async (file) => {
        const content = await fetchUnitContent(file);
        const unitName = file.name.replace('.lua', '');
        const parsedData = parseLuaTable(content);
        
        // Merge the inner unit data with any top-level properties
        const innerUnitData = parsedData[unitName] || {};
        delete parsedData[unitName];  // Remove the inner duplicate

        return { [unitName]: { ...parsedData, ...innerUnitData } };
    });

    const results = await Promise.all(promises);
    
    return results.reduce((acc, current) => ({ ...acc, ...current }), {});
}

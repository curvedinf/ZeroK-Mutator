import { fetchAllUnits } from './unitFetcher.js';
import { generateMutations } from './mutator.js';
import { generateLuaTable, base64Encode } from './parser.js';

// Add slider update handler
function updateMultiplierValue() {
    const multiplier = document.getElementById('multiplier');
    const multiplierValue = document.getElementById('multiplierValue');
    multiplierValue.textContent = parseFloat(multiplier.value).toFixed(1);
}

export async function handleGenerateMutations() {
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    
    try {
        // Disable buttons while generating
        generateBtn.disabled = true;
        copyBtn.disabled = true;
        output.value = '';
        
        status.textContent = 'Fetching unit files...';
        const unitData = await fetchAllUnits();
        
        status.textContent = 'Generating mutations...';
        const allMutations = generateMutations(unitData, multiplier);

        // Generate Lua table string
        const luaTableStr = generateLuaTable(allMutations);
        
        // Encode to base64
        const encoded = base64Encode(luaTableStr);
        
        // Display result
        output.value = encoded;
        
        status.textContent = 'Mutations generated successfully! Click "Copy to Clipboard" to use in Zero-K.';
        
        // Enable copy button
        copyBtn.disabled = false;
        
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
    } finally {
        // Re-enable generate button
        generateBtn.disabled = false;
    }
}

export function handleCopyToClipboard() {
    const output = document.getElementById('output');
    const status = document.getElementById('status');
    
    navigator.clipboard.writeText(output.value)
        .then(() => {
            status.textContent = 'Copied to clipboard! Ready to use in Zero-K.';
            setTimeout(() => {
                status.textContent = 'Ready to generate new mutations';
            }, 2000);
        })
        .catch(err => {
            status.textContent = 'Failed to copy to clipboard: ' + err.message;
            console.error('Failed to copy:', err);
        });
}

// Initialize slider
document.getElementById('multiplier').addEventListener('input', updateMultiplierValue);

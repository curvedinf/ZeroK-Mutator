import { fetchAllUnits } from './unitFetcher.js';
import { generateMutations } from './mutator.js';
import { generateLuaTable, base64Encode } from './parser.js';

// Update multiplier value display
const multiplierSlider = document.getElementById('multiplier');
const multiplierValue = document.getElementById('multiplierValue');
multiplierSlider.addEventListener('input', () => {
    multiplierValue.textContent = parseFloat(multiplierSlider.value).toFixed(1);
});

// Update nerf ratio value display
const nerfRatioSlider = document.getElementById('nerfRatio');
const nerfRatioValue = document.getElementById('nerfRatioValue');
nerfRatioSlider.addEventListener('input', () => {
    nerfRatioValue.textContent = parseFloat(nerfRatioSlider.value).toFixed(1);
});

// Update units per factory value display
const unitsPerFactorySlider = document.getElementById('unitsPerFactory');
const unitsPerFactoryValue = document.getElementById('unitsPerFactoryValue');
unitsPerFactorySlider.addEventListener('input', () => {
    unitsPerFactoryValue.textContent = Math.round(parseFloat(unitsPerFactorySlider.value));
});

export async function handleGenerateMutations() {
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const multiplier = parseFloat(multiplierSlider.value);
    const nerfRatio = parseFloat(nerfRatioSlider.value);
    const unitsPerFactory = parseFloat(unitsPerFactorySlider.value) / 100; // Convert to decimal
    
    try {
        // Disable buttons while generating
        generateBtn.disabled = true;
        copyBtn.disabled = true;
        output.value = '';
        
        status.textContent = 'Fetching unit files...';
        const unitData = await fetchAllUnits();
        
        status.textContent = 'Generating mutations...';
        const allMutations = generateMutations(unitData, multiplier, nerfRatio, unitsPerFactory);

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

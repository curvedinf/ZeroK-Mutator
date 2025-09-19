import { fetchAllUnits } from './unitFetcher.js';
import { generateMutations } from './mutator.js';
import { generateLuaTable, base64Encode } from './parser.js';
import { MUTATION_THEMES } from './config.js';

// DOM elements
const multiplierSlider = document.getElementById('multiplier');
const multiplierValue = document.getElementById('multiplierValue');
const attributesPerUnitSlider = document.getElementById('attributesPerUnit');
const attributesPerUnitValue = document.getElementById('attributesPerUnitValue');
const unitsPerFactorySlider = document.getElementById('unitsPerFactory');
const unitsPerFactoryValue = document.getElementById('unitsPerFactoryValue');
const mutationModeRadios = document.querySelectorAll('input[name="mutationMode"]');
const themeSelection = document.getElementById('theme-selection');
const themeCheckboxesContainer = document.getElementById('theme-checkboxes');

// Populate theme checkboxes
Object.keys(MUTATION_THEMES).forEach(themeName => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'themes';
    checkbox.value = themeName;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(themeName));
    themeCheckboxesContainer.appendChild(label);
});

// Event Listeners
multiplierSlider.addEventListener('input', () => {
    multiplierValue.textContent = parseFloat(multiplierSlider.value).toFixed(3);
});

attributesPerUnitSlider.addEventListener('input', () => {
    attributesPerUnitValue.textContent = attributesPerUnitSlider.value;
});

unitsPerFactorySlider.addEventListener('input', () => {
    unitsPerFactoryValue.textContent = Math.round(parseFloat(unitsPerFactorySlider.value));
});

mutationModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'theme') {
            themeSelection.style.display = 'block';
        } else {
            themeSelection.style.display = 'none';
        }
    });
});

export async function handleGenerateMutations() {
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');

    const multiplier = parseFloat(multiplierSlider.value);
    const attributesPerUnit = parseInt(attributesPerUnitSlider.value, 10);
    const unitsPerFactory = parseFloat(unitsPerFactorySlider.value) / 100;
    const mutationMode = document.querySelector('input[name="mutationMode"]:checked').value;
    
    let selectedThemes = [];
    if (mutationMode === 'theme') {
        document.querySelectorAll('input[name="themes"]:checked').forEach(checkbox => {
            selectedThemes.push(checkbox.value);
        });
        if (selectedThemes.length === 0) {
            status.textContent = 'Error: Please select at least one theme.';
            return;
        }
    }

    try {
        generateBtn.disabled = true;
        copyBtn.disabled = true;
        output.value = '';
        
        status.textContent = 'Fetching unit files...';
        const unitData = await fetchAllUnits();
        
        status.textContent = 'Generating mutations...';
        const allMutations = generateMutations(unitData, {
            multiplier,
            attributesPerUnit,
            unitsPerFactory,
            mutationMode,
            selectedThemes
        });

        const luaTableStr = generateLuaTable(allMutations);
        const encoded = base64Encode(luaTableStr);
        
        output.value = encoded;
        status.textContent = 'Mutations generated successfully! Click "Copy to Clipboard" to use in Zero-K.';
        copyBtn.disabled = false;
        
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
    } finally {
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

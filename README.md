# ZeroK-Mutator

A web-based tool for creating random unit definition tweaks for the [Zero-K](https://zero-k.info/) real-time strategy game. This tool creates chaotic and unpredictable gameplay by randomly modifying unit statistics.

## How It Works

1. The tool fetches unit definition files from the [Zero-K GitHub repository](https://github.com/ZeroK-RTS/Zero-K/tree/master/units)
2. For each unit, it:
   - Parses the Lua table containing unit statistics
   - Randomly selects two attributes
   - Doubles one attribute and halves the other
3. Creates a new Lua table containing all modified unit stats
4. Base64 encodes the resulting table
5. Displays the encoded string ready to be copied to clipboard

## Usage

1. Visit the [ZeroK-Mutator page](https://curvedinf.github.io/ZeroK-Mutator/)
2. Click the generate button to create a new random unit modification
3. Copy the generated base64 string
4. Use the string in Zero-K to apply the modifications

## Technical Details

- Built using vanilla JavaScript
- Runs entirely in the browser
- Hosted on GitHub Pages
- Downloads unit definitions directly from Zero-K's GitHub repository
- Includes a Lua table parser written in JavaScript
- Generates valid Lua table syntax for Zero-K compatibility

## Contributing

Feel free to submit issues and enhancement requests!

// temp_get_key.js

// Copied directly from server/server.js
function generateCacheKey(latex, title) {
  try {
    const input = latex + (title || '');
    const fullHex = Buffer.from(input).toString('hex');
    const hashLength = fullHex.length;
    const prefix = fullHex.substring(0, 4);
    const middle = hashLength > 20 ? 
      fullHex.substring(Math.floor(hashLength / 2) - 4, Math.floor(hashLength / 2) + 4) :
      fullHex.substring(4, Math.min(12, hashLength - 4));
    const suffix = fullHex.substring(Math.max(0, hashLength - 4));
    return prefix + middle + suffix;
  } catch (error) {
    console.error('Error generating cache key:', error);
    return Buffer.from(latex + (title || '')).toString('hex').substring(0, 16);
  }
}

const latex_1 = "\\sigma_1"; // Note: These are already escaped for JS string
const title_1 = "Sigma One";

const latex_2 = "\\alpha_2"; // Note: These are already escaped for JS string
const title_2 = "Alpha Two";

const key_1 = generateCacheKey(latex_1, title_1);
const key_2 = generateCacheKey(latex_2, title_2);

console.log("KEY_1:" + key_1);
console.log("KEY_2:" + key_2);

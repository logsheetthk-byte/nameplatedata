const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// The file might contain UTF-16LE characters (the spaces between letters like v i e w e r) 
// or corrupted script tags at the end. We'll find the last </html> tag and truncate anything after it.

const htmlEndIndex = content.lastIndexOf('</html>');
if (htmlEndIndex !== -1) {
    content = content.substring(0, htmlEndIndex + 7);
}

// Remove any existing viewer.js script tags before </body> to avoid duplicates
content = content.replace(/<script src="viewer\.js"><\/script>/g, '');

// Now append it properly right before </body>
content = content.replace(/<\/body>/, '<script src="viewer.js"></script>\n</body>');

fs.writeFileSync(file, content, 'utf8');
console.log('Cleaned up index.html successfully.');

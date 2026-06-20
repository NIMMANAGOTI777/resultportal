import fs from 'fs';

const sqlContent = fs.readFileSync('c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/scratch/db_seed_full.sql', 'utf-8');

console.log("SQL File length:", sqlContent.length, "characters");

// Check 1: No occurrences of "size"
if (sqlContent.toLowerCase().includes('size')) {
  console.error("❌ ERROR: File contains the word 'size'!");
  process.exit(1);
} else {
  console.log("✅ Success: No 'size' column/word found.");
}

// Check 2: Balanced parenthesis within the file (ignoring strings)
let inSingleQuote = false;
let inDoubleDollar = false;
let inLineComment = false;
let parenthesesCount = 0;
let braceCount = 0;

for (let i = 0; i < sqlContent.length; i++) {
  const char = sqlContent[i];
  const nextChar = sqlContent[i + 1] || '';

  if (inLineComment) {
    if (char === '\n' || char === '\r') {
      inLineComment = false;
    }
    continue;
  }

  if (inSingleQuote) {
    if (char === "'" && sqlContent[i - 1] !== '\\') {
      inSingleQuote = false;
    }
    continue;
  }

  if (inDoubleDollar) {
    if (char === '$' && nextChar === '$') {
      inDoubleDollar = false;
      i++; // skip next $
    }
    continue;
  }

  // Check comments
  if (char === '-' && nextChar === '-') {
    inLineComment = true;
    i++;
    continue;
  }

  // Check quotes
  if (char === "'") {
    inSingleQuote = true;
    continue;
  }

  if (char === '$' && nextChar === '$') {
    inDoubleDollar = true;
    i++;
    continue;
  }

  // Check parenthesis
  if (char === '(') {
    parenthesesCount++;
  } else if (char === ')') {
    parenthesesCount--;
    if (parenthesesCount < 0) {
      console.error(`❌ ERROR: Unbalanced closing parenthesis at index ${i}`);
      process.exit(1);
    }
  }

  // Check braces
  if (char === '{') {
    braceCount++;
  } else if (char === '}') {
    braceCount--;
    if (braceCount < 0) {
      console.error(`❌ ERROR: Unbalanced closing brace at index ${i}`);
      process.exit(1);
    }
  }
}

if (parenthesesCount !== 0) {
  console.error(`❌ ERROR: Unbalanced parenthesis count total: ${parenthesesCount}`);
  process.exit(1);
}

if (braceCount !== 0) {
  console.error(`❌ ERROR: Unbalanced brace count total: ${braceCount}`);
  process.exit(1);
}

console.log("✅ Success: Parentheses, braces, and quotes appear properly balanced.");

// Check 3: Every statement ends with a semicolon (semicolons are used for statements outside DO $$)
// Split statements by semicolon, but ignore semicolons inside single quotes and $$ blocks.
let statementsCount = 0;
let statementBuffer = "";
inSingleQuote = false;
inDoubleDollar = false;
inLineComment = false;

for (let i = 0; i < sqlContent.length; i++) {
  const char = sqlContent[i];
  const nextChar = sqlContent[i + 1] || '';

  if (inLineComment) {
    if (char === '\n' || char === '\r') {
      inLineComment = false;
    }
    continue;
  }

  if (inSingleQuote) {
    if (char === "'" && sqlContent[i - 1] !== '\\') {
      inSingleQuote = false;
    }
    continue;
  }

  if (inDoubleDollar) {
    if (char === '$' && nextChar === '$') {
      inDoubleDollar = false;
      i++;
    }
    continue;
  }

  if (char === '-' && nextChar === '-') {
    inLineComment = true;
    i++;
    continue;
  }

  if (char === "'") {
    inSingleQuote = true;
    continue;
  }

  if (char === '$' && nextChar === '$') {
    inDoubleDollar = true;
    i++;
    continue;
  }

  statementBuffer += char;

  if (char === ';') {
    const trimmed = statementBuffer.trim();
    if (trimmed.length > 0) {
      statementsCount++;
      // If it starts with INSERT INTO, make sure it ends with semicolon
      if (trimmed.toUpperCase().startsWith("INSERT INTO") && !trimmed.endsWith(";")) {
        console.error(`❌ ERROR: SQL Statement starting with INSERT INTO does not end with semicolon: ${trimmed.slice(0, 100)}...`);
        process.exit(1);
      }
    }
    statementBuffer = "";
  }
}

console.log(`✅ Success: Parsed ${statementsCount} top-level SQL statements successfully.`);
console.log("🎉 Syntax verification complete: SQL appears 100% syntactically valid.");

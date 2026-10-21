const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

async function check() {
  const from = path.resolve(__dirname, "../src/styles/tailwind.css");
  const result = await postcss([tailwind()]).process(
    fs.readFileSync(from, "utf8"),
    { from }
  );
  const selectors = new Set();
  result.root.walkRules((rule) => selectors.add(rule.selector));
  const classes = new Set();
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (filename.endsWith(".tsx")) {
        const source = fs.readFileSync(filename, "utf8");
        for (const match of source.matchAll(/className="([^"]+)"/g)) {
          for (const value of match[1].split(/\s+/)) {
            if (value.startsWith("me:")) classes.add(value);
          }
        }
      }
    }
  }
  visit(path.resolve(__dirname, "../src/CqlBuilderPanel"));
  assert(classes.size > 0, "Expected prefixed editor utilities");
  for (const value of classes) {
    const selector = "." + value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    assert(
      [...selectors].some(
        (candidate) =>
          candidate === selector || candidate.startsWith(selector + " ")
      ),
      `Missing compiled utility: ${value}`
    );
  }
  assert.match(result.css, /--me-color-slate:\s*#ededed/);
  assert.match(result.css, /flex:\s*1 1 0%/);
  assert.match(result.css, /margin-left:\s*1\.25rem/);
  assert.match(result.css, /width >= 48rem/);
  assert(!result.css.includes("box-sizing"), "Preflight must not be bundled");
  assert(
    !result.css.includes("@layer utilities"),
    "Utilities must be unlayered"
  );
  assert(
    fs
      .readFileSync(path.resolve(__dirname, "../src/index.ts"), "utf8")
      .includes('import "./styles/tailwind.css"'),
    "The npm package must import its utility CSS"
  );
  console.log(
    `Verified ${classes.size} compiled utilities and library CSS isolation.`
  );
}

check().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

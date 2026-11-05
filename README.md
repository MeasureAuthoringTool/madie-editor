# madie-editor

This is a single-spa Application responsible for the MADiE application's editor

## Building the npm package

This project is consumed as an npm package; it does not need a development
server. Use `npm run build:dev` for a development bundle or `npm run build:local`
to build and create a package archive. The existing entry points and exports
are unchanged.

The CQL builder uses Tailwind 4 utility classes with the `me:` prefix to avoid
collisions with consuming applications. PostCSS compiles the utilities, and the
package entry point imports the generated stylesheet into the JavaScript bundle.
Consumers do not need Tailwind, a separate CSS import, or source scanning.
Preflight is excluded so the package does not reset the application's styles.

The custom `bg-slate` color remains `#ededed`. The `editor-space-x-5` utility
preserves the previous sibling margins and hidden-child behavior rather than
adopting Tailwind 4's changed `space-x-*` behavior. Utilities are unlayered to
remain effective alongside existing unlayered component styles.
Run `npm run test:styles` to verify utility coverage and stylesheet isolation.
Tailwind 4 targets modern browsers (Chrome 111+, Safari 16.4+, Firefox 128+).

The `assert` and `process` development dependencies provide the browser
polyfills needed by the ANTLR parser and its utilities. They replace reliance
on the unused Node polyfill plugin and the consuming application's polyfills.

## Usage

```js
import React, { useState } from "react";
import { MadieEditor } from "@madie/madie-editor";

const Usage = () => {
  const [content, setContent] = useState("");

  const handleChange = (nextValue) => {
    setContent(nextValue);
  };

  return (
    <div>
      <MadieEditor value={content} onChange={handleChange} />
    </div>
  );
};
```

## Props

Common props you may want to include:

- `parseDebounceTime` - debounce time to invoke parser in milliseconds (default 1500ms)
- `onChange`\* - subscribe to change events
- `value`\* - control the current value

`*` - denotes a required prop

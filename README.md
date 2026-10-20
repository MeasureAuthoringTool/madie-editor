# madie-editor

This is a single-spa Application responsible for the MADiE application's editor

## Building the npm package

This project is consumed as an npm package; it does not need a development
server. Use `npm run build:dev` for a development bundle or `npm run build:local`
to build and create a package archive. The existing entry points and exports
are unchanged.

The CQL builder uses styled-components directly. Its styles were expanded from
the former twin.macro/Tailwind 3 macros, preserving their CSS values, responsive
rules, and component IDs. Tailwind and macro processing are no longer required.
PostCSS still runs Autoprefixer for imported stylesheets.

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

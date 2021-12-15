# madie-editor

This is a single-spa Application responsible for the MADiE application's editor

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
- `onChange`* - subscribe to change events
- `value`* - control the current value

`*` - denotes a required prop

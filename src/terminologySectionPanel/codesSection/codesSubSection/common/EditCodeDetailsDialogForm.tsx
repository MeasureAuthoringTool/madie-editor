import React from "react";
import { TextField } from "@madie/madie-design-system/dist/react";
import { Checkbox, FormControlLabel } from "@mui/material";
import tw from "twin.macro";
import "styled-components/macro";

export default function EditCodeDetailsDialogForm({ selectedCodeDetails }) {
  const getCodeSystemName = (codeDetails) => {
    if (codeDetails.codeSystem) {
      if (codeDetails.suffix) {
        const pattern = /^(.*?)\s*\(\d+\)$/;
        const match = codeDetails?.codeSystem.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
      return codeDetails?.codeSystem;
    }
    return "";
  };

  return (
    <div tw="flex flex-col">
      <div tw="flex mt-4">
        <div tw="w-1/3" data-testid="code-info">
          <p className="result-label">Code</p>
          <span className="result-value">{selectedCodeDetails?.name}</span>
        </div>

        <div tw="flex-grow pl-5" data-testid="code-description-info">
          <p className="result-label">Code Description</p>
          <span className="result-value">{selectedCodeDetails?.display}</span>
        </div>
      </div>

      <div tw="flex md:flex-wrap mt-4">
        <div tw="w-1/3" data-testid="code-system-info">
          <p className="result-label">Code System</p>
          <span className="result-value">
            {getCodeSystemName(selectedCodeDetails)}
          </span>
        </div>

        <div tw="flex-grow pl-5" data-testid="code-system-version-info">
          <p className="result-label">Code System Version</p>
          <span className="result-value">
            {selectedCodeDetails?.svsVersion
              ? selectedCodeDetails.svsVersion
              : selectedCodeDetails?.version}
          </span>
        </div>
      </div>

      <div tw="flex md:flex-wrap mt-4">
        <div tw="w-48">
          <TextField
            placeholder="Suffix"
            label="Suffix(Max Length 4)"
            id="suffix-max-length"
            inputProps={{
              "data-testid": "suffix-max-length-input",
              disabled: false,
              value: `${
                selectedCodeDetails?.suffix ? selectedCodeDetails.suffix : ""
              }`,
            }}
            data-testid="suffix-max-length-text-field"
            size="small"
          />
        </div>
        <div tw="flex-grow pl-5 mt-2">
          <FormControlLabel
            control={
              <Checkbox
                //onchange needs to implemented
                //onChange={}
                sx={{
                  color: "#717171",
                }}
                name="includCodeSystemVersion"
                id="include-code-system-version-checkbox"
                data-testid="include-code-system-version-checkbox"
                checked={selectedCodeDetails?.isVersionIncluded}
              />
            }
            label="Include Code System Version"
            sx={{
              color: "#515151",
              textTransform: "none",
              fontFamily: "Rubik",
              marginTop: "6px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

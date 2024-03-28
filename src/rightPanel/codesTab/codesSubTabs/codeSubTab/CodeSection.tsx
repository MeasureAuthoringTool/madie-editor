import React from "react";
import "twin.macro";
import "styled-components/macro";
import {
  Select,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import TerminologySection from "../../../../common/TerminologySection";

export default function CodeSection() {
  return (
    <div>
      <TerminologySection title="Code(s)" />
    </div>
  );
}

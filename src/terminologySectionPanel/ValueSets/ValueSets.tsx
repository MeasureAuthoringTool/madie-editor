import React, { useState } from "react";
import TerminologySection from "../../common/TerminologySection";
import Filter from "./Filter/Filter";
import Search from "./Search/Search";
import Results from "./Results/Results";
import { SEARCH_CATEGORIES } from "./Search/Search";
import useTerminologyServiceApi, {
  ValueSetForSearch,
} from "../../api/useTerminologyServiceApi";
import { MadieSpinner } from "@madie/madie-design-system/dist/react";

import "./ValueSets.scss";

interface ValueSetsProps {
  canEdit: boolean;
}

export default function ValueSets(props: ValueSetsProps) {
  const { canEdit } = props;
  const [resultValueSets, setResultValuesSets] = useState<ValueSetForSearch[]>(
    []
  );
  const [resultsOpen, setResultsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (values) => {
    setLoading(true);
    const nonEmptyValues = {};
    SEARCH_CATEGORIES.forEach(({ value }) => {
      // blank the value if it exists and it is still a search category
      if (values[value]) {
        nonEmptyValues[value] = values[value];
        console.log(values[value]);
      }
    });
    const terminologyService = await useTerminologyServiceApi();
    terminologyService
      .searchValueSets(nonEmptyValues)
      .then((data) => {
        setResultValuesSets(data);
        setLoading(false);
        setResultsOpen(true);
      })
      .catch((e) => {
        console.error("Error retrieving value sets from vsac, : ", e);
        setLoading(false);
      });
  };
  return (
    <div id="value-sets-right-panel">
      {loading && (
        <div className="spinner-overlay" data-testid="madie-spinner">
          <div className="spinner-container">
            <MadieSpinner />
          </div>
        </div>
      )}
      <TerminologySection title="Search" showHeaderContent={true}>
        <Search canEdit={canEdit} handleSearch={handleSearch} />
      </TerminologySection>
      <TerminologySection title="Filter" showHeaderContent={false}>
        <Filter canEdit={canEdit} />
      </TerminologySection>
      <TerminologySection title="Results" showHeaderContent={resultsOpen}>
        <Results resultValueSets={resultValueSets} />
      </TerminologySection>
    </div>
  );
}

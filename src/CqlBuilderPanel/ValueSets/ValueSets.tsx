import React, { useState } from "react";
import ExpandingSection from "../../common/ExpandingSection";
import Filter, { FILTER_CATEGORIES } from "./Filter/Filter";
import Search, { SEARCH_CATEGORIES } from "./Search/Search";
import Results from "./Results/Results";
import useTerminologyServiceApi, {
  ValueSetForSearch,
} from "../../api/useTerminologyServiceApi";
import { MadieSpinner } from "@madie/madie-design-system/dist/react";
import "./ValueSets.scss";

interface ValueSetsProps {
  canEdit: boolean;
  handleApplyValueSet: Function;
}

export default function ValueSets(props: ValueSetsProps) {
  const { canEdit, handleApplyValueSet } = props;
  const [resultValueSets, setResultValuesSets] = useState<ValueSetForSearch[]>(
    []
  );
  const [filteredValueSets, setFilteredValueSets] = useState<
    ValueSetForSearch[]
  >([]);
  const [resultBundle, setResultBundle] = useState<string>("");
  // Calls can be pretty heavy and very slow.
  // This route limits calls to vsac, but state may be heavier. This will allow users to immediately update filters
  // on clear can be implemented after to reset
  const [resultsOpen, setResultsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (values) => {
    setLoading(true);
    const nonEmptyValues = {};
    SEARCH_CATEGORIES.forEach(({ value }) => {
      // blank the value if it exists and it is still a search category

      if (values[value]) {
        const trimmedFieldValue = values[value].toString().trim();
        nonEmptyValues[value] = trimmedFieldValue;
      }
    });
    // eslint-disable-next-line
    const terminologyService = await useTerminologyServiceApi();
    terminologyService
      .searchValueSets(nonEmptyValues)
      .then((data) => {
        setResultValuesSets(data.valueSets);
        setFilteredValueSets(data.valueSets);
        setResultBundle(data.resultBundle);
        setLoading(false);
        setResultsOpen(true);
      })
      .catch((e) => {
        console.error("Error retrieving value sets from vsac, : ", e);
        setLoading(false);
      });
  };

  //  Title is the human friendly version, the mockup refers to it as name, but there are spaces.
  //  This should probably be listed as title instead.
  const onFilter = (values) => {
    const nonEmptyValues = {};
    FILTER_CATEGORIES.forEach(({ value }) => {
      // blank the value if it exists and it is still a search category
      if (values[value]) {
        if (value === "oid" || value === "url") {
          // if there's an http in front, we don't care so just cut it since we're string matching anyway
          values[value] = values[value].replace(/^http?:\/\//, "");
        }
        nonEmptyValues[value] = values[value].toLowerCase();
      }
    });
    const filteredValueSets = resultValueSets?.filter((valueSet) => {
      for (const key in nonEmptyValues) {
        const filterTerm = nonEmptyValues[key];
        const valueSetPropValue = valueSet[key];
        if (!valueSetPropValue.toLowerCase().includes(filterTerm)) {
          return false;
        }
        return true;
      }
    });
    setFilteredValueSets(filteredValueSets);
  };

  const onFilterClear = () => {
    setFilteredValueSets(resultValueSets);
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
      <ExpandingSection title="Search" showHeaderContent={true}>
        <Search canEdit={canEdit} handleSearch={handleSearch} />
      </ExpandingSection>
      <ExpandingSection title="Filter" showHeaderContent={false}>
        <Filter
          canEdit={canEdit}
          onFilter={onFilter}
          onFilterClear={onFilterClear}
        />
      </ExpandingSection>
      <ExpandingSection title="Results" showHeaderContent={resultsOpen}>
        <Results
          resultBundle={resultBundle}
          filteredValueSets={filteredValueSets}
          handleApplyValueSet={handleApplyValueSet}
        />
      </ExpandingSection>
    </div>
  );
}

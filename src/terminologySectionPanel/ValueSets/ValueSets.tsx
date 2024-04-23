import React, { useState } from "react";
import TerminologySection from "../../common/TerminologySection";
import Filter from "./Filter/Filter";
import Search from "./Search/Search";
import "./ValueSets.scss";

interface ValueSetsProps {
  canEdit: boolean;
}
export default function ValueSets(props: ValueSetsProps) {
  const { canEdit } = props;
  return (
    <div>
      <TerminologySection title="Search" showHeaderContent={true}>
        <Search canEdit={canEdit} />
      </TerminologySection>
      <TerminologySection title="Filter" showHeaderContent={false}>
        <Filter canEdit={canEdit} />
      </TerminologySection>
      <TerminologySection title="Results" showHeaderContent={false} />
    </div>
  );
}

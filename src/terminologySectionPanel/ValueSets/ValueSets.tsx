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
  const [searchResults, setSearchResults] = useState([]);

  // fullUrl: "http://terminology.hl7.org/CodeSystem/v3-ActCode"id: "ActCode2017-07-01"
  // lastUpdated: "2024-04-24T22:33:14.770Z" lastUpdatedUpstream: "2017-11-20T05:00:00.000+00:00"
  // name: "ActCode"oid: "urn:oid:2.16.840.1.113883.5.4"
  // title: "ActCode"version: "2017-07-01", versionId: "3690798541"
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

import React from "react";
import { expect, describe, it } from "@jest/globals";
import { render, screen, getByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Results from "./Results";
import Modal from 'react-modal';
import {
  ValueSetForSearch,
  TerminologyServiceApi,
} from "../../../api/useTerminologyServiceApi";
import { act } from "react-dom/test-utils";

const mockTerminologyServiceApi = {
  getValueSet: jest.fn().mockResolvedValue({}),
} as unknown as TerminologyServiceApi;

jest.mock("../../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);

const RESULT_VALUESETS = [
  {
    title: "Emergency Department Evaluation",
    name: "EmergencyDepartmentEvaluation",
    author: "Lantana EH Author",
    composedOf: "",
    effectiveDate: "DateType[2020-03-05]",
    lastReviewDate: "DateType[2024-03-11]",
    lastUpdated: "Thu Dec 21 14:43:03 PST 2023",
    publisher: "Lantana EH Steward",
    purpose:
      "(Clinical Focus: The purpose of this value set is to represent concepts of an assessment performed in the emergency department.),(Data Element Scope: This value set may use a model element related to Assessment.),(Inclusion Criteria: Includes concepts that represent an assessment that was performed in the emergency department.),(Exclusion Criteria: No exclusions.)",
    url: "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1111.163",
    oid: "urn:oid:2.16.840.1.113762.1.4.1111.163",
    steward: "Lantana EH Steward",
    version: "20200305",
    codeSystem: null,
    status: "ACTIVE",
  },
  {
    title: "Emergency Department Evaluation and Management Visit",
    name: "EmergencyDepartmentEvaluationAndManagementVisit",
    author: "NCQA PHEMUR Author",
    composedOf: "",
    effectiveDate: "DateType[2021-09-28]",
    lastReviewDate: "DateType[2024-02-14]",
    lastUpdated: "Thu Dec 21 14:43:03 PST 2023",
    publisher: "NCQA PHEMUR",
    purpose:
      "(Clinical Focus: The purpose of this value set is to represent concepts for encounters in the emergency department.),(Data Element Scope: This value set may use a model element related to Encounter.),(Inclusion Criteria: Includes concepts that represent an encounter for care provided to new and established patients in the emergency department.),(Exclusion Criteria: Excludes concepts that represent an encounter not representative of ED visits, including critical care and observation services.)",
    url: "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1010",
    oid: "urn:oid:2.16.840.1.113883.3.464.1003.101.12.1010",
    steward: "NCQA PHEMUR",
    version: "20210928",
    codeSystem: null,
    status: "ACTIVE",
  },
  {
    title: "Emergency Department Evaluation and Management Visit",
    name: "EmergencyDepartmentEvaluationAndManagementVisit",
    author: "NCQA PHEMUR Author",
    composedOf: "",
    effectiveDate: "DateType[2017-05-04]",
    lastReviewDate: "DateType[2024-02-12]",
    lastUpdated: "Thu Dec 21 14:43:03 PST 2023",
    publisher: "NCQA PHEMUR",
    purpose:
      "(Clinical Focus: The purpose of this value set is to represent concepts for encounters in the emergency department.),(Data Element Scope: This value set may use a model element related to Encounter.),(Inclusion Criteria: Includes concepts that represent an encounter for care provided to new and established patients in the emergency department.),(Exclusion Criteria: Excludes concepts that represent an encounter not representative of ED visits, including critical care and observation services.)",
    url: "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.11.1050",
    oid: "urn:oid:2.16.840.1.113883.3.464.1003.101.11.1050",
    steward: "NCQA PHEMUR",
    version: "20170504",
    codeSystem: null,
    status: "ACTIVE",
  },
] as ValueSetForSearch;

const { getByTestId } = screen;
describe("ValueSets Page", () => {
  it("Should use a type ahead field to add and remove search categories", async () => {
    const handleApplyValueSet = jest.fn();

    render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultValueSets={RESULT_VALUESETS}
      />
    );
    const selectButton = getByTestId(`select-action-0_apply`);
    userEvent.click(selectButton);
    //
    const applyButton = getByTestId(
      "apply-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163"
    );
    expect(applyButton).toBeDefined();
  });

  it.only("Displays Details after clicking 'Details'", async () => {
    const handleApplyValueSet = jest.fn();

    render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultValueSets={RESULT_VALUESETS}
      />
    );

    const selectButton = getByTestId(`select-action-0_apply`);
    act(() => {
       userEvent.click(selectButton);      
    });
    screen.debug();
    
    const detailsButton = getByTestId(
      "details-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163"
    );
    expect(detailsButton).toBeDefined();
    await userEvent.click(detailsButton);

   });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Results from "./Results";
import { ValueSetForSearch } from "../../../api/useTerminologyServiceApi";

const RESULT_VALUESETS: ValueSetForSearch[] = [
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
];

// const { getByTestId } = screen;
describe("ValueSets Page", () => {
  it("Should use a type ahead field to add and remove search categories", async () => {
    const handleApplyValueSet = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultValueSets={RESULT_VALUESETS}
      />
    );

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      userEvent.click(selectButton);
    });

    const applyButton = getByTestId(`apply-valueset-0`);
    userEvent.click(applyButton);
    expect(handleApplyValueSet).toHaveBeenCalled();
  });

  it("Display edit dialogue box and show errors when user enters invalid input", async () => {
    const handleApplyValueSet = jest.fn();

    const { getByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultValueSets={RESULT_VALUESETS}
      />
    );

    const selectButton = screen.getByTestId(`select-action-0_apply`);
    userEvent.click(selectButton);
    const editButton = getByTestId(`edit-valueset-0`);
    userEvent.click(editButton);

    await waitFor(async () => {
      const continueButton = getByTestId("apply-suffix-continue-button");
      const cancelButton = getByTestId("apply-suffix-cancel-button");

      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toBeDisabled();
      expect(cancelButton).toBeInTheDocument();

      const suffixInput = (await getByTestId(
        "suffix-max-length-input"
      )) as HTMLInputElement;
      userEvent.type(suffixInput, "52345");
      userEvent.click(continueButton);
      expect(getByTestId("suffix-max-length-helper-text")).toBeInTheDocument();

      userEvent.type(suffixInput, "523a");
      userEvent.click(continueButton);
      expect(getByTestId("suffix-max-length-helper-text")).toBeInTheDocument();
    });
  });

  it("Display edit dialogue box and applying valuesets when contine button is clicked", async () => {
    const handleApplyValueSet = jest.fn();

    const { getByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultValueSets={RESULT_VALUESETS}
      />
    );

    const selectButton = screen.getByTestId(`select-action-0_apply`);
    userEvent.click(selectButton);
    const editButton = getByTestId(`edit-valueset-0`);
    userEvent.click(editButton);

    await waitFor(async () => {
      const continueButton = getByTestId("apply-suffix-continue-button");
      const cancelButton = getByTestId("apply-suffix-cancel-button");

      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toBeDisabled();
      expect(cancelButton).toBeInTheDocument();

      const suffixInput = (await getByTestId(
        "suffix-max-length-input"
      )) as HTMLInputElement;

      userEvent.type(suffixInput, "5");
      expect(suffixInput.value).toBe("5");
      expect(continueButton).not.toBeDisabled();

      userEvent.click(continueButton);
      expect(handleApplyValueSet).toHaveBeenCalled();
    });
  });
});

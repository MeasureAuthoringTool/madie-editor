import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Results from "./Results";
import filteredTestResults from "./mockValueSetResults.json";
import {
  ValueSetForSearch,
  TerminologyServiceApi,
} from "../../../api/useTerminologyServiceApi";
import { find } from "styled-components/test-utils";

const mockTerminologyServiceApi = {
  getValueSet: jest.fn().mockResolvedValue({}),
} as unknown as TerminologyServiceApi;

jest.mock("../../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);
// @ts-ignore;
const mockValueSetResults = filteredTestResults as ValueSetForSearch[]; // can't stop making ts upset
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

describe("ValueSets Results", () => {
  it("Should use a type ahead field to add and remove search categories", async () => {
    const handleApplyValueSet = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultBundle={"{}"}
        filteredValueSets={RESULT_VALUESETS}
      />
    );

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      userEvent.click(selectButton);
    });

    const applyButton = getByTestId(
      `apply-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163`
    );
    userEvent.click(applyButton);
    expect(handleApplyValueSet).toHaveBeenCalled();
  });

  it("Should allow a 'Details' button to show ValueSet Details", async () => {
    const handleApplyValueSet = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultBundle={"{}"}
        filteredValueSets={RESULT_VALUESETS}
      />
    );

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      userEvent.click(selectButton);
    });

    const detailsButton = getByTestId(
      `details-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163`
    );
    userEvent.click(detailsButton);
  });

  it("Display edit dialogue box and show errors when user enters invalid input", async () => {
    const handleApplyValueSet = jest.fn();

    const { findByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultBundle={"{}"}
        filteredValueSets={RESULT_VALUESETS}
      />
    );

    const selectButton = await findByTestId(`select-action-0_apply`);
    userEvent.click(selectButton);
    const editButton = await findByTestId(
      `edit-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163`
    );
    userEvent.click(editButton);
    const continueButton = await findByTestId("apply-suffix-continue-button");
    const cancelButton = await findByTestId("apply-suffix-cancel-button");

    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();
    expect(cancelButton).toBeInTheDocument();

    const suffixInput = (await findByTestId(
      "suffix-max-length-input"
    )) as HTMLInputElement;

    userEvent.type(suffixInput, "52345");
    await waitFor(async () => {
      expect(
        await findByTestId("suffix-max-length-helper-text")
      ).toBeInTheDocument();
    });

    userEvent.type(suffixInput, "523a");
    await waitFor(async () => {
      expect(
        await findByTestId("suffix-max-length-helper-text")
      ).toBeInTheDocument();
    });
  });

  it("Display edit dialogue box and applying value sets when continue button is clicked", async () => {
    const handleApplyValueSet = jest.fn();

    const { findByTestId } = render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        resultBundle={"{}"}
        filteredValueSets={RESULT_VALUESETS}
      />
    );

    const selectButton = screen.getByTestId(`select-action-0_apply`);
    userEvent.click(selectButton);
    const editButton = await findByTestId(
      `edit-valueset-urn:oid:2.16.840.1.113762.1.4.1111.163`
    );
    userEvent.click(editButton);

    const continueButton = await findByTestId("apply-suffix-continue-button");
    const cancelButton = await findByTestId("apply-suffix-cancel-button");

    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();
    expect(cancelButton).toBeInTheDocument();

    const suffixInput = (await findByTestId(
      "suffix-max-length-input"
    )) as HTMLInputElement;

    userEvent.type(suffixInput, "5");
    await waitFor(async () => {
      expect(suffixInput.value).toBe("5");
      expect(continueButton).not.toBeDisabled();
    });

    userEvent.click(continueButton);
    await waitFor(async () => {
      expect(handleApplyValueSet).toHaveBeenCalled();
    });
  });
});

describe("Results pagination", () => {
  const { getByTestId, getByRole, findByRole, findAllByRole, findByLabelText } =
    screen;

  it("renders with the right number of visible elements", async () => {
    const handleApplyValueSet = jest.fn();
    await render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        filteredValueSets={mockValueSetResults}
      />
    );
    const tableBody = getByTestId("vs-results-table-body");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(10);
    });
  });
  it("handles limit change as expected", async () => {
    const handleApplyValueSet = jest.fn();
    await render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        filteredValueSets={mockValueSetResults}
      />
    );
    const limitChangeButton = await findByRole("button", { expanded: false });
    expect(limitChangeButton).toBeInTheDocument();
    userEvent.click(limitChangeButton);
    const options = await findAllByRole("option");
    expect(options).toHaveLength(4);
    userEvent.click(options[3]);
    const tableBody = getByTestId("vs-results-table-body");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(30);
    });
  });
  it("handles page change by next and prev", async () => {
    const handleApplyValueSet = jest.fn();

    await render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        filteredValueSets={mockValueSetResults}
      />
    );
    const nextButton = await findByLabelText("Go to next page");
    userEvent.click(nextButton);
    const previousButton = await findByLabelText("Go to previous page");
    expect(previousButton).toBeInTheDocument();
  });
  it("handles page change by pagination number click", async () => {
    const handleApplyValueSet = jest.fn();

    await render(
      <Results
        handleApplyValueSet={handleApplyValueSet}
        filteredValueSets={mockValueSetResults}
      />
    );
    // select limit as 25 items;
    const limitChangeButton = await findByRole("button", { expanded: false });
    expect(limitChangeButton).toBeInTheDocument();
    userEvent.click(limitChangeButton);
    const options = await findAllByRole("option");
    expect(options).toHaveLength(4);
    userEvent.click(options[2]);
    // select second nav item
    const page2 = await findByLabelText("Go to page 2");
    userEvent.click(page2);
    // confirm there are 5 items on page
    const tableBody = getByTestId("vs-results-table-body");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(5);
    });
  });
});

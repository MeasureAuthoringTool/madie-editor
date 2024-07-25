import React from "react";
import { TextField } from "@madie/madie-design-system/dist/react";
import ExpandingSection from "../../common/ExpandingSection";
import Search from "./Search";

export interface LibraryTabContentProps {
  activeLibraryTab: string;
  canEdit: boolean;
}

const LibraryTabContent = (props: LibraryTabContentProps) => {
  const { activeLibraryTab, canEdit } = props;
  return (
    <div className="content">
      {activeLibraryTab === "library" && (
        <>
          <TextField
            label="Library Alias"
            required
            disabled={!canEdit}
            id="library-alias"
          />
          <ExpandingSection title="Search" showHeaderContent={true}>
            <Search canEdit={canEdit} />
          </ExpandingSection>
          <ExpandingSection
            title="Library Results"
            showHeaderContent={false}
          ></ExpandingSection>
        </>
      )}
    </div>
  );
};
export default LibraryTabContent;

import React, { FC } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import CqlBuilderPanel from "../CqlBuilderPanel/CqlBuilderPanel";
import { useLocation } from "react-router-dom"
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";

const CqlEditorWithTerminology: FC<EditorPropsType> = ({
  value,
  onChange,
  handleCodeDelete,
  handleApplyCode,
  handleApplyValueSet,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
}) => {
  const { pathname } = useLocation();
  console.log('pathname is', pathname);

  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
      <Allotment defaultSizes={[175, 125]} vertical={false}>
        <Allotment.Pane>
          <div style={{ borderWidth: "24px", borderColor: "#ededed" }} />
          <div className="left-panel">
            <div className="panel-content">
              <MadieAceEditor
                value={value}
                onChange={onChange}
                height={height}
                parseDebounceTime={parseDebounceTime}
                inboundAnnotations={inboundAnnotations}
                inboundErrorMarkers={inboundErrorMarkers}
                readOnly={readOnly}
                validationsEnabled={validationsEnabled}
                setOutboundAnnotations={setOutboundAnnotations}
              />
            </div>
          </div>
        </Allotment.Pane>
        <Allotment.Pane>
          <CqlBuilderPanel
            canEdit={!readOnly}
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            measureModel={measureModel}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
            handleApplyCode={handleApplyCode}
            handleApplyValueSet={handleApplyValueSet}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

const CqlEditorWithTerminologyWrapper: FC = (props) => {
  //@ts-ignore
  return <CqlEditorWithTerminology {...props} />;
};

export const routesConfig = [
  {
    path: "/*",
    element: <CqlEditorWithTerminologyWrapper />,
  },
];

const router = createBrowserRouter(routesConfig);

const EditorBrowserRouter: FC<EditorPropsType> = (props) => {
  return <RouterProvider router={router} />;
}

export default EditorBrowserRouter;

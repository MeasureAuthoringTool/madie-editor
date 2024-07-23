import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import CqlEditorWithTerminology from "./CqlEditorWithTerminology";
// import EditMeasure from "../editMeasure/EditMeasure";
// import MeasureLanding from "../measureLanding/MeasureLanding";
// import NotFound from "../notfound/NotFound";



export const routesConfig = [
    {
      children: [
        { path: "/", element:(props) => <CqlEditorWithTerminology {...props}/> },
        { path: "/valueSets", element:(props) => <CqlEditorWithTerminology {...props}/> },
        { path: "/codes*", element:(props) => <CqlEditorWithTerminology {...props}/> }
      ],
    },
  ];

  const router = createBrowserRouter(routesConfig);

  const EditorBrowserRouter = () => {
    <RouterProvider router={router} />
  }

  export default EditorBrowserRouter;
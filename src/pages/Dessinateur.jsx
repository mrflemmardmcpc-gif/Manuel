import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.dessinateur";

export default function Dessinateur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Dessinateur" dataOverride={data} />;
}

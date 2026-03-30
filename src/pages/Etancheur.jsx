import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.etancheur";

export default function Etancheur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Etancheur" dataOverride={data} />;
}

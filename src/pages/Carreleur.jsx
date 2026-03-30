import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.carreleur";

export default function Carreleur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Carreleur" dataOverride={data} />;
}

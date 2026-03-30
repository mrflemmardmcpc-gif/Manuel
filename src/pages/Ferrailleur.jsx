import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.ferrailleur";

export default function Ferrailleur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Ferrailleur" dataOverride={data} />;
}

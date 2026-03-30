import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.peintre";

export default function Peintre(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Peintre" dataOverride={data} />;
}

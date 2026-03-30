import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.chauffagiste";

export default function Chauffagiste(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Chauffagiste" dataOverride={data} />;
}

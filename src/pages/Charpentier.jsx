import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.charpentier";

export default function Charpentier(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Charpentier" dataOverride={data} />;
}

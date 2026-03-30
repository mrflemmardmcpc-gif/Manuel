import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.menuisier";

export default function Menuisier(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Menuisier" dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.macon";

export default function Macon(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Macon" dataOverride={data} />;
}

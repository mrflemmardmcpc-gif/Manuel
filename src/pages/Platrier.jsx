import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.platrier";

export default function Platrier(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Platrier" dataOverride={data} />;
}

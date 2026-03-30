import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.calorifugeur";

export default function Calorifugeur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Calorifugeur" dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.couvreur";

export default function Couvreur(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Couvreur" dataOverride={data} />;
}

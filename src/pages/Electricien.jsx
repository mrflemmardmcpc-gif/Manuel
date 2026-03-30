import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.electricien";

export default function Electricien(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Electricien" dataOverride={data} />;
}

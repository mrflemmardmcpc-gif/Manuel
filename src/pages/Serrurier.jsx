import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.serrurier";

export default function Serrurier(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName="Serrurier" dataOverride={data} />;
}

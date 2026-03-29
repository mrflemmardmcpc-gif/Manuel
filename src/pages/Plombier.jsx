import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.plombier";

export default function Plombier(props) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage {...props} moduleName={"Plombier"} dataOverride={data} />;
}

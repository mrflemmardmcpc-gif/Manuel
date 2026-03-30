import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.peintre";

export default function Peintre({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Peintre" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

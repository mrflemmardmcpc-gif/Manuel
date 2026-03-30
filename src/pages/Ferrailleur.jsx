import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.ferrailleur";

export default function Ferrailleur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Ferrailleur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

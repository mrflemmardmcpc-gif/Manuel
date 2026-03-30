import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.etancheur";

export default function Etancheur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Etancheur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

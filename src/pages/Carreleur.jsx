import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.carreleur";

export default function Carreleur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Carreleur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.menuisier";

export default function Menuisier({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Menuisier" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.platrier";

export default function Platrier({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Plâtrier" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

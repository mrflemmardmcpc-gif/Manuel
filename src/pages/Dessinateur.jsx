import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.dessinateur";

export default function Dessinateur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Dessinateur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

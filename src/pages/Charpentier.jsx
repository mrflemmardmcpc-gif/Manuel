import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.charpentier";

export default function Charpentier({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Charpentier" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.macon";

export default function Macon({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Macon" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.chauffagiste";

export default function Chauffagiste({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Chauffagiste" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.electricien";

export default function Electricien({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Electricien" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

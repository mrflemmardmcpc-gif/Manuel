import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.serrurier";

export default function Serrurier({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Serrurier" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

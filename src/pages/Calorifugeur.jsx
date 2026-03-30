import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.calorifugeur";

export default function Calorifugeur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Calorifugeur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

import React from "react";
import ModulePage from "./ModulePage";
import dataSrc from "../data/data.couvreur";

export default function Couvreur({ isAdmin, onHome }) {
  const data = dataSrc && (dataSrc.value || dataSrc);
  return <ModulePage moduleName="Couvreur" isAdmin={isAdmin} onHome={onHome} dataOverride={data} />;
}

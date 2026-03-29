import React from "react";
import ModulePage from "./ModulePage";

export default function Calorifugeur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Calorifugeur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

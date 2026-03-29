import React from "react";
import ModulePage from "./ModulePage";

export default function Carreleur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Carreleur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

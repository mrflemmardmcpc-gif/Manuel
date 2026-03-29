import React from "react";
import ModulePage from "./ModulePage";

export default function Peintre({ isAdmin, onHome }) {
  return <ModulePage moduleName="Peintre" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

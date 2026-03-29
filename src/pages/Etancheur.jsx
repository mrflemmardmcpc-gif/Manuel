import React from "react";
import ModulePage from "./ModulePage";

export default function Etancheur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Étancheur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

import React from "react";
import ModulePage from "./ModulePage";

export default function Ferrailleur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Ferrailleur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

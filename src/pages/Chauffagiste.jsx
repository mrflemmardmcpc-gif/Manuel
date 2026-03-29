import React from "react";
import ModulePage from "./ModulePage";

export default function Chauffagiste({ isAdmin, onHome }) {
  return <ModulePage moduleName="Chauffagiste" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

import React from "react";
import ModulePage from "./ModulePage";

export default function Charpentier({ isAdmin, onHome }) {
  return <ModulePage moduleName="Charpentier" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

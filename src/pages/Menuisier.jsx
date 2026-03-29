import React from "react";
import ModulePage from "./ModulePage";

export default function Menuisier({ isAdmin, onHome }) {
  return <ModulePage moduleName="Menuisier" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

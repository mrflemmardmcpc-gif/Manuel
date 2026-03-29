import React from "react";
import ModulePage from "./ModulePage";

export default function Dessinateur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Dessinateur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

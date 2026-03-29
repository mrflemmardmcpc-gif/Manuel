import React from "react";
import ModulePage from "./ModulePage";

export default function Platrier({ isAdmin, onHome }) {
  return <ModulePage moduleName="Plâtre" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

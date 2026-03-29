import React from "react";
import ModulePage from "./ModulePage";

export default function Serrurier({ isAdmin, onHome }) {
  return <ModulePage moduleName="Serrurier" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

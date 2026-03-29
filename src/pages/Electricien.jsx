import React from "react";
import ModulePage from "./ModulePage";

export default function Electricien({ isAdmin, onHome }) {
  return <ModulePage moduleName="Électricien" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

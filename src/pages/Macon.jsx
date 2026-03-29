import React from "react";
import ModulePage from "./ModulePage";

export default function Macon({ isAdmin, onHome }) {
  return <ModulePage moduleName="Macon" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

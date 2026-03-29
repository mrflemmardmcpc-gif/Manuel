import React from "react";
import ModulePage from "./ModulePage";

export default function Couvreur({ isAdmin, onHome }) {
  return <ModulePage moduleName="Couvreur" isAdmin={isAdmin} onHome={onHome} dataOverride={{ value: { sections: [], categories: [] } }} />;
}

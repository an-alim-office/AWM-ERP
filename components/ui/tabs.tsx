"use client";

import * as React from "react";

export function Tabs({ children }: any) {
  return <div>{children}</div>;
}

export function TabsList({ children }: any) {
  return <div style={{ display: "flex", gap: "10px" }}>{children}</div>;
}

export function TabsTrigger({ children, onClick }: any) {
  return (
    <button onClick={onClick} style={{ padding: "8px 12px" }}>
      {children}
    </button>
  );
}

export function TabsContent({ children }: any) {
  return <div style={{ marginTop: "10px" }}>{children}</div>;
}
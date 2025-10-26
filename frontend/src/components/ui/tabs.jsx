import * as TabsPrimitive from "@radix-ui/react-tabs";
import React from "react";

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ children }) => (
  <TabsPrimitive.List className="flex border-b mb-2">{children}</TabsPrimitive.List>
);
export const TabsTrigger = ({ children, value }) => (
  <TabsPrimitive.Trigger
    value={value}
    className="px-4 py-2 text-gray-600 data-[state=active]:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600"
  >
    {children}
  </TabsPrimitive.Trigger>
);
export const TabsContent = TabsPrimitive.Content;

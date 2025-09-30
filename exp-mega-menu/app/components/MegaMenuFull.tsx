import React, { useState, useEffect } from "react";
import {
  Frame,
  Button,
  TextField,
  Card,
  Thumbnail,
  BlockStack,
  DropZone,
  Text,
} from "@shopify/polaris";
import TreeEditor from "./TreeEditor";
import TreePreview from "./TreePreview";
import TreeModal from "../components/TreeModal";
import TreeView from "./TreeView";
import { v4 as uuidv4 } from "uuid";
import MenuGrid from "./MenuGrid";
import { accessSync } from "fs";
import { useCallback } from "react";
import AdditionalHelp from "./AdditionalHelp";
import { json } from "stream/consumers";
import { Images } from "lucide-react";

export interface TreeNode {
  id: string;
  label: string;
  title: string;
  linkType: "custom" | "collection" | "product" | "page";
  linkValue: string;
  children: TreeNode[];
}

interface MegaMenu {
  id: string;
  title: string;
  items: TreeNode[];
}

  
export default function MegaMenuFullScreenLayout() {
  const [active, setActive] = useState(false);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [menu, setMenu] = useState<MegaMenu>({
    id: `menu-${uuidv4()}`,
    title: "",
    items: [],
  });

  const [customize, setCustomise] = useState<MegaMenu>();
  const [isCustomise, setIsCustomise] = useState<boolean>(false);

  const [isRootModalOpen, setIsRootModalOpen] = useState(false);
  const handleOpenRootModal = () => setIsRootModalOpen(true);
  const handleCloseRootModal = () => setIsRootModalOpen(false);

  const toggleActive = () => {
    setTree([]);
    setActive((prev) => !prev);
  };

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [active]);

  //  Add  MegaMenu
  const handleMenuSubmit = async () => {
    const finalMenu = {
      ...menu,
      items: tree,
    };

    console.log("final menu ", finalMenu);

    // call menu upload api
    fetch("http://localhost:5000/api/add-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalMenu),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        setMenu({
          id: `menu-${uuidv4()}`,
          title: "",
          items: [],
        });
        setTimeout(() => {
          setActive((prev) => !prev);
        }, 3000);
      })
      .catch((error) => {
        console.log(" Error In API ", error);
      });
  };

  // handle customisation
  const handleCustomisation = (obj: MegaMenu, id: string) => {
    console.log("mega menu gen", obj);
    console.log(` Customisation clicked for ${id}`, obj);
    setIsCustomise(true);
    setCustomise(obj);
    toggleActive();
    setMenu((prev) => ({
      ...prev,
      title: obj.title,
      id: `menu-${uuidv4()}`,
      items: obj.items,
    }));
    setTree(obj.items);
  };

  console.log("customise data", customize);

  return (
    <Frame>
      <div style={{ marginTop: "10px" }}>
        <Button onClick={toggleActive}>Add Mega Menu</Button>
      </div>

      {active && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 16,
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f6f6f7",
            }}
          >
            <strong>Mega Menu #{Math.floor(Math.random() * 100000)}</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={toggleActive}>Cancel</Button>
              <Button
                size="medium"
                variant="primary"
                onClick={handleMenuSubmit}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex" }}>
            {/* Left */}
            <div
              style={{
                width: "60%",
                borderRight: "1px solid #ccc",
                padding: 20,
                overflowY: "auto",
              }}
            >
              <TextField
                label="Menu Name"
                value={menu.title}
                onChange={(value) =>
                  setMenu((prev) => ({ ...prev, title: value }))
                }
                autoComplete="off"
              />
              <TreeEditor
                tree={tree}
                setTree={setTree}
                isCostomize={isCustomise}
                data={customize}
              />
            </div>

            {/* Right */}
            <div style={{ width: "45%", padding: 24, overflowY: "auto" }}>
              <TreeView
                tree={tree}
                setTree={setTree}
                isCostomize={isCustomise}
                data={customize}
              />
            </div>
          </div>
        </div>
      )}

      {/*  display Grid below */}
      {!active && (
        <div style={{ marginTop: "20px" }}>
          <MenuGrid onCustomise={handleCustomisation}></MenuGrid>
        </div>
      )}
      {/* <div>
        <AdditionalHelp></AdditionalHelp>
      </div> */}
    </Frame>
  );
}

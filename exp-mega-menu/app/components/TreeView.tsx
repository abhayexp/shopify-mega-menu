import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  Modal,
  Card,
  DropZone,
  BlockStack,
  Thumbnail,
  Text,
  Icon,
  SelectOption,
} from "@shopify/polaris";

import { PlusMinor } from "@shopify/polaris-icons";

import type { TreeNode } from "./MegaMenuFullScreenLayout";
import { inertia } from "framer-motion";
import { useCallback } from "react";

const linkTypeOptions = [
  { label: "Custom", value: "custom" },
  { label: "Collection", value: "collection" },
  { label: "Product", value: "product" },
  { label: "Page", value: "page" },
];

interface TreeEditorProps {
  tree: TreeNode[];
  setTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isCostomize: boolean;
  data: any;
  menuId?: string;
}

interface editingNode {
  id: string;
  label: string;
  linkType: string;
}

const TreeView: React.FC<TreeEditorProps> = ({
  tree,
  setTree,
  isCostomize,
  data,
}) => {
  const [label, setLabel] = useState("");
  const [linkType, setLinkType] = useState("custom");

  const [linkTypeOptions, setLinkTypeOptions] = useState<SelectOption[]>([]);

  // Slider with image and heading ,url
  const [image, setImage] = useState<File | null>(null);
  const [heading, setHeading] = useState("");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);

  const [parentId, setParentId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);
  const [active, setActive] = useState(false);

  const [menuId, setMenuId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");



  //  image toggle handler
  const handleToggle = async (node: any, menuId: string) => {
    setMenuId(menuId);
    setItemId(editingNode.id);
    try {

      const itemId = editingNode.id;
      const response = await fetch(`http://localhost:5000/api/hideslider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menuId, itemId, isSliderVisible: active }),
      });

      if (!response.ok) {
        throw new Error(`Response Status : ${response.status}`);
      }

      const result = await response.json();
      setEditingNode(null); // close editing section
    } catch (error) {
      console.log(error);
    }
    setActive((prev) => !prev);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      // Revoke preview URL to free memory
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  //  Add Node to Tree
  const handleAddNode = () => {
    console.log(
      "Adding Node Clicked",
      label,
      linkType,
      parentId,
      files,
      heading,
    );
    if (!label.trim()) return;
    const newNode: TreeNode = {
      id: `${Date.now()}`,
      label: label.trim(),
      linkType,
      children: [],
      image: files.map(({ file }) => file),
      heading,
    };

    if (isCostomize && data) {

      if (!parentId) {
        const updatedItems = [...data.items, newNode];
        setTree(updatedItems);
        data.items = updatedItems;
      } else {
        const updateItems = (items: TreeNode[]): TreeNode[] => {
          return items.map((item) =>
            item.id === parentId
              ? { ...item, children: [...item.children, newNode] }
              : { ...item, children: updateItems(item.children) },
          );
        };
        const updatedItems = updateItems(data.items);
        setTree(updatedItems);
        data.items = updatedItems;
      }
    } else {
      if (!parentId) {
        console.log("No Parent ID, Adding to Root");
        setTree((prev) => [...prev, newNode]);
      } else {
        setTree((prev) => addToTree(prev, parentId, newNode));
      }
    }

    setLabel("");
    setLinkType("custom");
    setParentId(null);
    setFiles([]);
    setHeading("");
  };

  const addToTree = (
    nodes: TreeNode[],
    parentId: string,
    newNode: TreeNode,
  ): TreeNode[] =>
    nodes.map((node) =>
      node.id === parentId
        ? { ...node, children: [...node.children, newNode] }
        : { ...node, children: addToTree(node.children, parentId, newNode) },
    );

  // Edit Node in Tree

const updateTreeNode = (nodes: TreeNode[], updatedNode: TreeNode): TreeNode[] =>
  nodes.map((node) =>
    node.id === updatedNode.id
      ? { ...node, ...updatedNode }
      : { ...node, children: updateTreeNode(node.children, updatedNode) }
  );

  // Delete Node
const deleteFromTree = (nodes: TreeNode[], nodeId: string): TreeNode[] => {
   console.log("Deleting Node ID:", nodeId);
   console.log("Current Nodes:", nodes);
};

  // Tree Renderer
  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) => (
      <div
        key={node.id}
        style={{
          marginLeft: 20,
          marginTop: 10,
          borderLeft: "1px dashed #ccc",
          paddingLeft: 10,
        }}
      >
        <div
          style={{
            display: "block",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>{node.label}</strong> – <em>{node.linkType}</em>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              icon={<Icon source={PlusMinor} />}
              accessibilityLabel="Add theme"
              onClick={() => setParentId(node.id)}
            ></Button>
            <Button
              size="slim"
              onClick={() =>
                setEditingNode({
                  ...node,
                  label: node.label ?? "",
                  linkType: node.linkType ?? "custom",
                })
              }
            >
              Edit
            </Button>
            <Button
              size="slim"
              tone="critical"
              onClick={() => setTree((prev) => deleteFromTree(prev, node.id))}
            >
              Delete
            </Button>
          </div>

          {/* Editing Node  */}
          {editingNode?.id == node?.id && (
            <div>
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  display: "block",
                  width: "200px",
                  // alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <div>
                  <TextField
                    label="Category Name"
                    value={editingNode.label ?? ""}
                    onChange={(val) =>
                    setEditingNode((prev :any ) => (prev ? { ...prev, label: val } : prev))
                   }
                    autoComplete="off"
                  />
                  <Select
                    label="Link"
                    options={linkTypeOptions}
                    value={editingNode.linkType ?? "custom"}
                    onChange={(val) =>
                    setEditingNode((prev :any) => (prev ? { ...prev, linkType: val } : prev))
                    }
                  />
                </div>

                {editingNode.images && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px",
                      gap: "10px",
                    }}
                  >
                    <p>Show Slider</p>
                    <Button onClick={() => handleToggle(editingNode, data.id)}>
                      {active ? "Turn On" : "Turn Off"}
                    </Button>
                  </div>
                )}
                {/* <Button
                  onClick={() => {
                    setTree((prev) => updateTreeNode(prev)); // update the tree recursively
                    setEditingNode(null); // close editing section
                  }}
                >
                  Update
                </Button> */}
              </div>
            </div>
          )}

          <div>
            {parentId == node.id && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <TextField
                  label="Child Category Name"
                  value={label}
                  onChange={setLabel}
                  autoComplete="off"
                />
                <Select
                  label="Link "
                  options={linkTypeOptions}
                  value={linkType}
                  onChange={setLinkType}
                />

                <Button onClick={handleAddNode}>Add</Button>
              </div>
            )}
          </div>
        </div>
        {renderTree(node.children)}
      </div>
    ));

  useEffect(() => {
    console.log("Tree state updated:", tree);
  }, [tree]);

  useEffect(() => {
    const getCollection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/collection");
        if (!response.ok) {
          throw new Error(`Response Status : ${response.status}`);
        }
        const result = await response.json();
        console.log("collection data", result.collections);

        const options: SelectOption[] = result.collections.map((c) => ({
          label: c.title,
          value: c.handle,
        }));
        setLinkTypeOptions(options);

        // linkTypeOptions = result.collections;
      } catch (error) {
        console.log(error);
      }
    };
    getCollection();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          marginTop: 20,
          maxHeight: 500,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {isCostomize && data ? renderTree(data.items) : renderTree(tree)}
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <Modal
          open={true}
          onClose={() => setEditingNode(null)}
          title="Edit Category"
          primaryAction={{
            content: "Save",
            onAction: () => {
              setTree(updateTreeNode);
              setEditingNode(null);
            },
          }}
          secondaryActions={[
            { content: "Cancel", onAction: () => setEditingNode(null) },
          ]}
        >
          <Modal.Section>
            <TextField
              label="Category Name"
              value={editingNode.label}
              onChange={(val) => setEditingNode({ ...editingNode, label: val })}
              autoComplete="off"
            />
            <Select
              label="Link Type"
              options={linkTypeOptions}
              value={editingNode.linkType}
              onChange={(val) =>
                setEditingNode({ ...editingNode, linkType: val })
              }
            />
          </Modal.Section>
        </Modal>
      )}
    </div>
  );
};

export default TreeView;

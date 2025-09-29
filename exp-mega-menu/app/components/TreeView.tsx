import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  Modal,
  Icon,
  SelectOption,
} from "@shopify/polaris";
import { PlusMinor } from "@shopify/polaris-icons";

import type { TreeNode } from "./MegaMenuFullScreenLayout";

interface TreeEditorProps {
  tree: TreeNode[];
  setTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isCostomize: boolean;
  data: any;
}

const defaultLinkTypeOptions: SelectOption[] = [
  { label: "Custom", value: "custom" },
  { label: "Collection", value: "collection" },
  { label: "Product", value: "product" },
  { label: "Page", value: "page" },
];

const TreeView: React.FC<TreeEditorProps> = ({
  tree,
  setTree,
  isCostomize,
  data,
}) => {
  const [label, setLabel] = useState("");
  const [linkType, setLinkType] = useState("custom");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);
  const [linkTypeOptions, setLinkTypeOptions] = useState<SelectOption[]>(
    defaultLinkTypeOptions,
  );


  useEffect(() => {
    if (isCostomize && data?.items) {
      setTree(data.items);
    }
    else {
      setTree([]);
    }
  }, [isCostomize, data]);


  
  // Add Node
  const handleAddNode = () => {
    if (!label.trim()) return;
    const newNode: TreeNode = {
      id: `${Date.now()}`,
      label: label.trim(),
      linkType,
      children: [],
    };

    const addNode = (nodes: TreeNode[], parentId?: string): TreeNode[] => {
      if (!parentId) return [...nodes, newNode];
      return nodes.map(node =>
        node.id === parentId
          ? { ...node, children: [...node.children, newNode] }
          : { ...node, children: addNode(node.children, parentId) }
      );
    };

    if (isCostomize && data) {
      const updatedItems = addNode(data.items, parentId || undefined);
      setTree(updatedItems);
      data.items = updatedItems;
    } else {
      setTree(prev => addNode(prev, parentId || undefined));
    }

    setLabel("");
    setLinkType("custom");
    setParentId(null);
  };

  // Update Node
  const updateTreeNode = (
    nodes: TreeNode[],
    updatedNode: TreeNode,
  ): TreeNode[] =>
    nodes.map((node) =>
      node.id === updatedNode.id
        ? { ...node, ...updatedNode }
        : { ...node, children: updateTreeNode(node.children, updatedNode) },
    );

  // Delete Node
  const deleteFromTree = (nodes: TreeNode[], nodeId: string): TreeNode[] => {
    console.log(" nodes", nodes);
    console.log("Node ID ", nodeId);
    const newNodes = nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: deleteFromTree(node.children, nodeId),
      }));
    console.log(" finale node ", newNodes);
    return newNodes;
  };

  const handleEditNode = (node: TreeNode) => {
    console.log("Editing node: ", node);
    // setEditingNode(node);
  };

  const handleDeleteNode = (nodeId: string) => {
    setTree((prevTree) => {
      const newTree = deleteFromTree(prevTree, nodeId);
      return newTree;
    });

    if (editingNode?.id === nodeId) setEditingNode(null);
  };

  // Render Tree recursively
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
            display: "flex",
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
              onClick={() => setParentId(node.id)}
            />
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
              onClick={() => handleDeleteNode(node.id)}
            >
              Delete
            </Button>
          </div>

          {/*  If user click on  edit  edit modal show up */}
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
                    label="Category name"
                    value={editingNode?.label}
                    onChange={(val) => 
                        setEditingNode({ ...editingNode, label: val })
                    }
                    autoComplete="off"  
                  />
                  <Select
                    label="Link"
                    options={linkTypeOptions}
                    value={editingNode.linkType ?? "custom"}
                    onChange={(val) =>
                      setEditingNode((prev: any) =>
                        prev ? { ...prev, linkType: val } : prev,
                      )
                    }
                  />
                </div>
                {/* {editingNode.images && (
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
                )} */}
                <Button
                  onClick={() => {
                    setTree((prev) => updateTreeNode(prev, editingNode)); // update the tree recursively
                    setEditingNode(null); // close editing section
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Child Add Form */}
        {parentId === node.id && (
          <div style={{ marginTop: 8, padding: 8, display: "flex", gap: 12 }}>
            <TextField
              label="Child Name"
              value={label}
              onChange={setLabel}
              autoComplete="off"
            />
            <Select
              label="Link Type"
              options={linkTypeOptions}
              value={linkType}
              onChange={setLinkType}
            />
            <Button onClick={handleAddNode}>Add</Button>
          </div>
        )}

        {node.children.length > 0 && renderTree(node.children)}
      </div>
    ));

  // Fetch collections for select options
  useEffect(() => {
    const getCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/collection");
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const result = await res.json();
        const options: SelectOption[] = result.collections.map((c: any) => ({
          label: c.title,
          value: c.handle,
        }));
        setLinkTypeOptions([...defaultLinkTypeOptions, ...options]);
      } catch (err) {
        console.log(err);
      }
    };
    getCollections();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          maxHeight: 500,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {/* {isCostomize && data ? renderTree(tree) : renderTree([])} */}
        {renderTree(tree)}
      </div>

      {/* Edit Modal */}
      {/* {editingNode && (
        <Modal
          open={true}
          onClose={() => setEditingNode(null)}
          title="Edit Category"
          primaryAction={{
            content: "Save",
            onAction: () => {
              setTree((prev) => updateTreeNode(prev, editingNode));
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
      )} */}
    </div>
  );
};

export default TreeView;

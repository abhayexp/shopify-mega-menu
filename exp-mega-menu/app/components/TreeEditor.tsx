import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, TextField, Select,
  Modal, Card, DropZone, BlockStack, Thumbnail, Text,
  SelectGroup,
  SelectOption,
  Box,
  FormLayout
} from '@shopify/polaris';
// Correct import for TypeScript

import type { TreeNode } from './MegaMenuFullScreenLayout';
import { inertia } from 'framer-motion';

import { PlusMinor } from '@shopify/polaris-icons';
import { Icon } from '@shopify/polaris';

interface TreeEditorProps {
  tree: TreeNode[];
  setTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isCostomize: boolean;
  data: any
}


interface editingNode {
  id: string,
  label: string,
  linkType: string
}


const TreeEditor: React.FC<TreeEditorProps> = ({ tree, setTree, isCostomize, data }) => {
  const [label, setLabel] = useState('');
  const [linkType, setLinkType] = useState('');
  const [linkTypeOptions, setLinkTypeOptions] = useState<SelectOption[]>([]);


  // Slider with image and heading ,url
  const [active, setActive] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
   const [items, setItems] = useState<any[]>([]); 
   const [isVisible, setIsVisible] = useState(false);


  const handleTitleChange = useCallback((value: string) => setTitle(value), []);
  const handleUrlChange = useCallback((value: string) => setUrl(value), []);
  const handleDescriptionChange = useCallback((value: string) => setDescription(value), []);




  const [parentId, setParentId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);


  
  //  Add Node To Tree
  const formData = new FormData();
  const handleAddNode = () => {
  
    console.log("Adding Node Clicked", label, linkType, parentId,  items);
    if (!label.trim()) return;
    const newNode: TreeNode = {
      id: `${Date.now()}`,
      label: label.trim(),
      linkType,
      children: [],
      images: items
    };

    console.log("New Node Created", newNode);

    if (isCostomize && data) {
    
      if (!parentId) {
        const updatedItems = [...data.items, newNode];
        setTree(updatedItems);
        data.items = updatedItems;
      } else {
        const updateItems = (items: TreeNode[]): TreeNode[] => {
          return items.map(item =>
            item.id === parentId
              ? { ...item, children: [...item.children, newNode] }
              : { ...item, children: updateItems(item.children) }
          );
        };
        const updatedItems = updateItems(data.items);
        setTree(updatedItems);
        data.items = updatedItems;
      }
    } else {
      if (!parentId) {
        setTree(prev => [...prev, newNode]);

      } else {
        setTree(prev => addToTree(prev, parentId, newNode));
      }
    } 
    setLabel('');
    setLinkType(' ');
    setParentId(null);
    setItems([]); 
  };



  const addToTree = (nodes: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] =>
    nodes.map(node =>
      node.id === parentId
        ? { ...node, children: [...node.children, newNode] }
        : { ...node, children: addToTree(node.children, parentId, newNode) }
    );





  // Edit Node in Tree
  const updateTreeNode = (nodes: any) =>
    nodes.map(node => {
      if (node.id === editingNode?.id) {
        return {
          ...node,
          label: editingNode.label,
          linkType: editingNode.linkType,
        };
      }
      return { ...node, children: updateTreeNode(node.children) };
    });





  // Delete Node
  const deleteFromTree = (nodes: TreeNode[], nodeId: string): TreeNode[] =>
    nodes
      .filter(node => node.id !== nodeId)
      .map(node => ({ ...node, children: deleteFromTree(node.children, nodeId) }));



  // Tree Renderer
  const renderTree = (nodes: TreeNode[]) =>
    nodes.map(node => (
      <div key={node.id} style={{ marginLeft: 20, marginTop: 10, borderLeft: '1px dashed #ccc', paddingLeft: 10 }}>
        <div style={{ display: 'block', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{node.label}</strong> – <em>{node.linkType}</em>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon={<Icon source={PlusMinor} />} accessibilityLabel="Add theme" onClick={() => setParentId(node.id)}></Button>
            <Button size="slim" onClick={() => setEditingNode({ ...node })}>Edit</Button>
            <Button size="slim" tone="critical" onClick={() => setTree(prev => deleteFromTree(prev, node.id))}>
              Delete
            </Button>
          </div>


          {/* Editing Node  */}
          {editingNode?.id == node?.id && (
            <div>
              <div style={{ marginTop: 8, padding: 8, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <TextField
                  label="Child Category Name"
                  value={editingNode.label}
                  onChange={setLabel}
                  autoComplete="off"
                />
                <Select
                  label="Link "
                  options={linkTypeOptions}
                  value={linkType}
                  onChange={setLinkType}
                />
                <Button onClick={() => updateTreeNode({
                  id: editingNode.id,
                  label: label,
                  linkType: linkType,
                })}>Update</Button>
              </div>
            </div>
          )}

          <div>
            {parentId == node.id && (
              <div style={{ marginTop: 8, padding: 8, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
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

                <Button size="medium" variant="primary" onClick={handleAddNode}>Add</Button>
              </div>

            )}
          </div>
        </div>
        {renderTree(node.children)}
      </div>
    ));

  // useEffect(() => {
  //   console.log("Tree state updated:", tree);
  // }, [tree]);



  
  useEffect(() => {
    const getCollection = async ()=>{
    try {
        const response = await fetch("http://localhost:5000/api/collection");
        if (!response.ok)
        {
          throw new Error(`Response Status : ${response.status}`);
        }
        const result = await response.json();

        const options :SelectOption[] = result.collections.map((c)=>({
          label:c.title,
          value: c.handle
        }));
        setLinkTypeOptions(options);

        // linkTypeOptions = result.collections;
      } catch (error) {
        console.log(error);
      }
  } 
    getCollection();
  }, []);


//slider 
  const handleChange = () => {
    console.log(" Add Images Clicked");
    setActive(!active);
  };

 const handleSubmit = () => {
    const newItem = { title, url, description , isVisible };
    setItems([...items, newItem]);

    setTitle("");
    setUrl("");
    setDescription("");
    setIsVisible(false);
    setTimeout(() => {
      setActive(false);
    }, 1000);
  };

  const handleremoveimage = (index: number) => {
    console.log("Remove Image Clicked", index);
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };



  return (

    <div style={{ marginTop: 20 }}>
      <TextField
        label={'Root Category Name'}
        value={label}
        onChange={setLabel}
        autoComplete="off"
      />
      <div style={{ marginTop: '10px' }}>
        <Select
          label="Link Type"
          options={linkTypeOptions}
          value={linkType}
          onChange={setLinkType}
        />
      </div>

      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        {/* <TextField
          label="Heading"
          value={heading}
          onChange={setHeading}
          autoComplete="off"
        /> */}

        <Button onClick={handleChange}>Add Images</Button>
      { active && (
         <Card sectioned>
            <FormLayout>
              <TextField
                label="Image Title"
                value={title}
                onChange={handleTitleChange}
                autoComplete="off"
              />
              <TextField
                label="CDN URL"
                value={url}
                onChange={handleUrlChange}
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={description}
                onChange={handleDescriptionChange}
                autoComplete="off"
                multiline={3}
              />
              <Button  onClick={handleSubmit}>
                Save Image
              </Button>
            </FormLayout>
          </Card>
      )}

      {/* preview */}
      { items.length > 0 && (
        <div>
          {items.map((item, index) => (
            <Box key={index} borderStyle="solid">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                 <Text variant="bodyMd" as="p"><strong>Title:</strong> {item.title}</Text>
                </div>
                <div>
                  <Button onClick={() => handleremoveimage(index)}>Delete</Button>
                </div>

              </div>
             
            </Box>
          ))}
        </div>

      )}
        
        
      </div>

      {/* <Card sectioned>
        <DropZone accept="image/*" type="file" onDrop={handleDrop}>
          <DropZone.FileUpload actionHint="Drop or click to upload" />
        </DropZone>


        {files.length > 0 && (
          <BlockStack gap="200" padding="200">
            <Text as="h3" variant="headingSm">
              Selected files:
            </Text>
            {files.map(({ file, preview }, index) => (
              <BlockStack
                key={index}
                gap="100"
                align="center"
                inlineAlign="space-between"
                direction="horizontal"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <BlockStack gap="100" align="center" direction="horizontal">
                    <Thumbnail source={preview} alt={file.name} size="small" />
                    <Text as="p">
                      {file.name.slice(0, 10)}... ({(file.size / 1024).toFixed(1)} KB)
                    </Text>
                  </BlockStack>
                  <Button variant="plain" tone="critical" onClick={() => handleRemove(index)}>
                    Remove
                  </Button>
                </div>

              </BlockStack>
            ))}
          </BlockStack>
        )}

      </Card> */}



      <div style={{ marginTop: 10 }}>
        <Button onClick={handleAddNode}>Add</Button>
      </div>
      {/* 
      <div
        style={{
          marginTop: 20,
          maxHeight: 500, // adjust height as needed
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 10,
          borderRadius: 6,
        }}
      >
        {renderTree(tree)}
        {isCostomize && data ? (
          renderTree(data.items)
        ) : (
          tree && renderTree(tree)
        )}
      </div> */}



      {/* Edit Modal */}
      {editingNode && (
        <Modal
          open={true}
          onClose={() => setEditingNode(null)}
          title="Edit Category"
          primaryAction={{
            content: 'Save',
            onAction: () => {
              setTree(updateTreeNode);
              setEditingNode(null);
            },
          }}
          secondaryActions={[{ content: 'Cancel', onAction: () => setEditingNode(null) }]}
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
              onChange={(val) => setEditingNode({ ...editingNode, linkType: val })}
            />
          </Modal.Section>
        </Modal>
      )}
    </div>
  );
};

export default TreeEditor;
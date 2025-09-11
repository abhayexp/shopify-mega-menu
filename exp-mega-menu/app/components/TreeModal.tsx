import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  Modal,
  TextField,
  Card,
  Page,
  Layout,
  Select,
} from '@shopify/polaris';

// Tree node type
interface TreeNode {
  id: string;
  label: string;
  linkType: 'custom' | 'collection' | 'product' | 'page';
  linkValue: string;
  children: TreeNode[];
}

const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const TreeBuilderWithModal: React.FC = () => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isRootModalOpen, setIsRootModalOpen] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

  const [rootLabel, setRootLabel] = useState('');
  const [rootLinkType, setRootLinkType] = useState<'custom' | 'collection' | 'product' | 'page'>('custom');
  const [rootLinkValue, setRootLinkValue] = useState<string>('');

  const [childLabel, setChildLabel] = useState('');
  const [childLinkType, setChildLinkType] = useState<'custom' | 'collection' | 'product' | 'page'>('custom');
  const [childLinkValue, setChildLinkValue] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);




  //  collections
  const [collections, setCollection] = useState<any[]>([]);

  // Root Modal handlers
  const handleOpenRootModal = () => setIsRootModalOpen(true);
  
  const handleCloseRootModal = () => {
    setIsRootModalOpen(false);
    setRootLabel('');
    setRootLinkType('custom');
    setRootLinkValue('');
  };

  const handleAddRootCategory = () => {
    if (!rootLabel.trim()) return;
    const id = `parent-${Date.now()}`;
    setTree(prev => [
      ...prev,
      {
        id,
        label: rootLabel.trim(),
        linkType: rootLinkType,
        linkValue: (rootLinkValue ?? '').trim(),
        children: [],
      },
    ]);
    handleCloseRootModal();
  };

  // Child Modal handlers
  const handleOpenChildModal = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsChildModalOpen(true);
  };

  const handleCloseChildModal = () => {
    setIsChildModalOpen(false);
    setChildLabel('');
    setChildLinkType('custom');
    setChildLinkValue('');
    setSelectedParentId(null);
  };

  const handleAddChild = () => {
    console.log(` child clicked child label- ${childLabel} and ${selectedParentId} `);
    if (!childLabel.trim() || !selectedParentId) return;
    setTree(prev =>
      prev.map(node =>
        node.id === selectedParentId
          ? {
            ...node,
            children: [
              ...node.children,
              {
                id: `child-${Date.now()}`,
                label: childLabel.trim(),
                linkType: childLinkType,
                linkValue: (childLinkValue ?? '').trim(),
                children: [],
              },
            ],
          }
          : node
      )
    );
    handleCloseChildModal();
  };


  // Drag-and-drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tree.findIndex(item => item.id === active.id);
    const newIndex = tree.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...tree];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    setTree(updated);
  };

  // Save Tree (example output)
  const saveTree = async () => {
    try {
      console.log("Tree", tree);
      const response = await fetch('/save-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tree }),
      });

      const result = await response.json();
      console.log(result);
      console.log('Metafield saved:');
    } catch (err) {
      console.error('Failed to save tree:', err);
    }
  };

  //Get Collection 
  useEffect(() => {
    const fetchCollections = async () => {
      console.log(" useeffect ran");

      try {
        const res = await fetch('/collections');
        if (!res.ok) {
          console.log(" Unable to make Api Call");
        }
        const data = await res.json();
        console.log(" data from api", data.collections);
        setCollection(data.collections);

      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    }
    fetchCollections();
  }, [])

  console.log(" collection", collections);

  return (

    <Page title="Mega Menu Builder">
      <Layout>
        <Layout.Section>
          <Button onClick={handleAddRootCategory}>+ Add Root Category</Button>

          {/* Root Modal */}
          <Modal
            open={isRootModalOpen}
            onClose={handleCloseRootModal}
            title="Add Root Category"
            primaryAction={{ content: 'Add', onAction: handleAddRootCategory }}
            secondaryActions={[{ content: 'Cancel', onAction: handleCloseRootModal }]}
          >
            <Modal.Section>
              <TextField
                label="Category Name"
                value={rootLabel}
                onChange={setRootLabel}
                autoComplete="off"
              />

              <Select
                label="Select a Collection"
                options={(collections || []).map((col: any) => ({
                  label: col.title,
                  value: col.handle,
                }))}
                value={rootLinkValue}
                onChange={setRootLinkValue}
              />
            </Modal.Section>
          </Modal>

          {/* Child Modal */}
          <Modal
            open={isChildModalOpen}
            onClose={handleCloseChildModal}
            title="Add Child Category"
            primaryAction={{ content: 'Add', onAction: handleAddChild }}
            secondaryActions={[{ content: 'Cancel', onAction: handleCloseChildModal }]}
          >

            <Modal.Section>
              <TextField
                label="Category Name"
                value={childLabel}
                onChange={setChildLabel}
                autoComplete="off"
              />

              <Select
                label="Select a Collection"
                options={(collections || []).map((col: any) => ({
                  label: col.title,
                  value: col.handle, // Store handle
                }))}
                value={childLinkValue}
                onChange={setChildLinkValue}
              />
            </Modal.Section>
          </Modal>

          <Card>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tree.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {tree.map(parent => (
                  <div key={parent.id} style={{ marginBottom: '16px' }}>
                    <SortableItem id={parent.id}>
                      <div className="Polaris-Text--headingLg">
                        {parent.label} → <small>{parent.linkType}: {parent.linkValue}</small>
                      </div>
                      
                    </SortableItem>
                    <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                      {parent.children.map(child => (
                        <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <strong>{child.label}</strong> → <small>{child.linkType}: {child.linkValue}</small>
                          </div>

                          <div>
                            <Button size="slim" onClick={()=> console.log('Edit', child.id)}>Edit</Button>
                            <Button size="slim" tone="critical">Delete</Button>
                          </div>

                        </div>
                      ))}
                      <Button onClick={() => handleOpenChildModal(parent.id)}>+ Add Child</Button>
                    </div>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </Card>
        </Layout.Section>
      </Layout>

      <div style={{ marginTop: "16px" }}>
        <Button variant="primary" onClick={saveTree}>Save Mega Menu</Button>
      </div>
    </Page>
  );
};

export default TreeBuilderWithModal;

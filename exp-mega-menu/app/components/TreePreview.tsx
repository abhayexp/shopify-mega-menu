import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {Button, Card} from '@shopify/polaris';
import AddCarouselSlides from './AddCarouselSlides';
// import type { TreeNode } from './MegaMenuFullScreenLayout';


interface TreeEditorProps {
  tree: TreeNode[];
  node: TreeNode;
  setTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isCostomize: boolean;
  data: any
}

interface TreeNode {
  id: string;
  label: string;
  title: string;
  linkType: 'custom' | 'collection' | 'product' | 'page';
  linkValue: string;
  children: TreeNode[];
}



const TreeItem: React.FC<TreeEditorProps> = ({ node, tree ,setTree,  isCostomize, data}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  console.log("tree data from preview component ", tree);


  return (
    <li style={{ marginBottom: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: hasChildren ? 'pointer' : 'default',
          color: '#1c1c1e',
          fontWeight: 500,
          fontSize: 14,
        }}
        onClick={() => hasChildren && setExpanded(prev => !prev)}
      >
        {hasChildren && (
          <span style={{ marginRight: 6 }}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        {node.label}
      </div> 

      {hasChildren && expanded && (
        <ul style={{ listStyle: 'none', paddingLeft: 20, marginTop: 4 }}>
          {node.children!.map(child => (
            <TreeItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function TreePreview() {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 16,
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      maxWidth: 400
    }}>
    {/* <Button> Add Courosal </Button> */}

    <AddCarouselSlides />
    </div>
  );
}

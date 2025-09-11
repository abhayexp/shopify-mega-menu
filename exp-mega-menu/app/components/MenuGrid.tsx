import { Card, Text, Button, IndexTable, useIndexResourceState, Badge } from '@shopify/polaris';
import React, { useState } from 'react';
import { useEffect } from 'react';

const menuItems = [
  {
    id: '1',
    title: 'Menu 1',
    status: 'Draft',
  },
  {
    id: '2',
    title: 'Menu 2',
    status: 'Published',
  },
  {
    id: '3',
    title: 'Menu 3',
    status: 'Draft',
  },
];

interface menuObject {
  id: string,
  title: string,
  isSliderVisible : boolean
}

export default function MenuGrid({ onCustomise }: any) {

    // const {  allResourcesSelected, handleSelectionChange } = useIndexResourceState(menuItems);

    const [menu, setMenu] = useState<menuObject[]>([]);

    const resourceName = {
      singular: 'menu',
      plural: 'menus',
    };

    console.log("Menu from  grid side", menu);

    const rows = menu.map(({ id, title, isSliderVisible }) => (

      <IndexTable.Row
        id={id}
        key={id}
        // position={index}
        // selected={selectedResources.includes(id)}
      >
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{id}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge status={isSliderVisible ? 'success' : 'info'}>
            {isSliderVisible ? 'Visible' : 'Hidden'}
          </Badge>
          
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="slim" onClick={() => handlePublish( id )} >
              Publish
            </Button>
            <Button size="medium" variant="plain" tone="critical" onClick={() => handleDelete(id)}>
              Delete
            </Button>

            <Button size="medium" variant="primary" onClick={() => handleClick(id)}>
              Customise
            </Button>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    ));


  const fetchMenus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/menus");
      const data = await response.json();
      setMenu(data.menus);
      console.log(" Api Fetched", menu);

    } catch (error) {
      console.log(error);
    }
  }


  // fetch menus 
  useEffect(() => {
    fetchMenus();
  }, []);

  const handleClick = (menuId: string) => {
    console.log("Menu function", menuId);
    menu.forEach(obj => {
      if (obj.id === menuId) {
        onCustomise(obj);
      }
    });
  }

  const handlePublish = (menuId: string) => {
    console.log(" Publish Clicked", menuId);

    try {
      fetch(`http://localhost:5000/api/publishmenu/${menuId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
        .then(response => response.json())
        .then(data => {
          console.log("Menu published:", data);

          fetchMenus();
        })
        .catch(error => {
          console.error("Error publishing menu:", error);
        });
    } catch (error) {
      console.error("Error publishing menu:", error);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log(" Menu deleted", id);
      const response = await fetch("http://localhost:5000/api/deletemenu", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuId: id })
      })
      const data = await response.json();
      if (!response.ok) {
        console.log(" Delete Failed", id);
        return;
      }
      if (response.ok) {
        console.log("Menu deleted:", data.message);
        fetchMenus();
      }

    }
    catch (error) {
      console.log(error);

    }
  }

  return (

    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={menuItems.length}
        // selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
        // onSelectionChange={handleSelectionChange}
        headings={[
          { title: 'Menu Title' },
          { title: 'ID' },
          { title: 'Ref' },

          { title: 'Actions' },
        ]}
      >
        {rows}
      </IndexTable>
    </Card>
  );
}
